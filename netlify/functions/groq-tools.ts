import { Handler } from "@netlify/functions";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
};

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL_NAME = "llama-3.3-70b-versatile";
const MAX_INPUT_CHARS = 1600;

const SUMMARY_SYSTEM_PROMPT =
  "You write dyslexia-friendly summaries. Use short sentences and simple words. Output JSON only: {\"summary\":\"...\"}. Keep under 80 words.";

const QUIZ_SYSTEM_PROMPT =
  "You create dyslexia-friendly multiple choice quizzes. Output JSON only: {\"questions\":[{\"question\":\"...\",\"options\":[\"A\",\"B\",\"C\",\"D\"],\"answer\":0}]}. Rules: 3-5 questions, short and clear, 4 options, answer 0-3.";

let groq: any | null = null;
async function getGroqClient() {
  if (!groq) {
    try {
      const GroqModule = await import("groq-sdk");
      const GroqClass = (GroqModule as any).default || (GroqModule as any).Groq || GroqModule;
      groq = new GroqClass({
        apiKey: GROQ_API_KEY,
      }) as any;
    } catch (err) {
      console.error("[GroqTools] Failed to initialize Groq client:", err);
      throw new Error("Failed to initialize AI client");
    }
  }
  return groq;
}

function normalizeInput(text: string, maxChars = MAX_INPUT_CHARS) {
  return text.replace(/\s+/g, " ").trim().slice(0, maxChars);
}

function extractJson(content: string) {
  const firstBrace = content.indexOf("{");
  const lastBrace = content.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No JSON object found in response");
  }

  let jsonString = content.slice(firstBrace, lastBrace + 1).trim();
  jsonString = jsonString.replace(/<[^>]+>/g, "");
  jsonString = jsonString.replace(/,(\s*[\]}])/g, "$1");
  jsonString = jsonString.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
  return jsonString;
}

function validateQuiz(questions: any[]) {
  if (!Array.isArray(questions) || questions.length < 3 || questions.length > 5) {
    throw new Error("Quiz must contain 3 to 5 questions");
  }

  questions.forEach((q, index) => {
    if (!q?.question || typeof q.question !== "string") {
      throw new Error(`Question ${index + 1} is missing text`);
    }
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      throw new Error(`Question ${index + 1} must have exactly 4 options`);
    }
    if (q.options.some((opt: any) => typeof opt !== "string" || !opt.trim())) {
      throw new Error(`Question ${index + 1} has invalid options`);
    }
    if (typeof q.answer !== "number" || q.answer < 0 || q.answer > 3) {
      throw new Error(`Question ${index + 1} answer must be 0-3`);
    }
  });
}

function buildFallbackSummary(text: string) {
  const sentences = text
    .replace(/\n+/g, " ")
    .split(/[.!?]/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const points = sentences.slice(0, 3);
  if (points.length === 0) {
    return "We could not generate a summary. Please try again.";
  }

  return `Key points:\n- ${points.join("\n- ")}`;
}

const STOP_WORDS = new Set([
  "with",
  "this",
  "that",
  "have",
  "from",
  "they",
  "them",
  "there",
  "their",
  "about",
  "into",
  "while",
  "where",
  "could",
  "would",
  "should",
  "along",
  "over",
  "these",
  "those",
  "your",
  "you're",
  "their",
  "the",
  "and",
  "for",
  "are",
  "was",
  "were",
  "because",
  "after",
  "before",
  "what",
  "when",
]);

function getKeywords(text: string, count = 3) {
  const words = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 4 && !STOP_WORDS.has(word));

  const frequency = new Map<string, number>();
  for (const word of words) {
    frequency.set(word, (frequency.get(word) ?? 0) + 1);
  }

  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([word]) => word);
}

function buildFallbackQuiz(text: string) {
  const keywords = getKeywords(text, 3);
  const topic = keywords[0] ?? "the topic";
  const word = keywords[1] ?? topic;

  return [
    {
      question: "What is the passage mostly about?",
      options: [topic, "sports", "cooking", "space"],
      answer: 0,
    },
    {
      question: "Which word appears in the text?",
      options: [word, "mountain", "ocean", "planet"],
      answer: 0,
    },
    {
      question: "What is a good next step after reading?",
      options: ["Review the key points", "Ignore the text", "Skip all details", "Delete the notes"],
      answer: 0,
    },
  ];
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  let body: any = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch (err) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Invalid JSON in request body" }),
    };
  }

  const text = typeof body.text === "string" ? body.text : "";
  const type = body.type === "summary" || body.type === "quiz" ? body.type : null;

  if (!text.trim()) {
    const fallbackSummary = buildFallbackSummary(text);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Missing text in request body",
        fallback: { summary: fallbackSummary },
      }),
    };
  }

  if (!type) {
    const fallbackSummary = buildFallbackSummary(text);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Missing or invalid type in request body",
        fallback: { summary: fallbackSummary },
      }),
    };
  }

  const safeText = normalizeInput(text);

  const fallbackSummary = buildFallbackSummary(safeText);
  const fallbackQuiz = buildFallbackQuiz(safeText);

  if (!GROQ_API_KEY) {
    console.error("[GroqTools] Missing GROQ_API_KEY environment variable");
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        error: "AI service is not configured",
        fallback: type === "summary" ? { summary: fallbackSummary } : { questions: fallbackQuiz },
      }),
    };
  }

  try {
    const groqClient = await getGroqClient();
    const messages = [
      {
        role: "system" as const,
        content: type === "summary" ? SUMMARY_SYSTEM_PROMPT : QUIZ_SYSTEM_PROMPT,
      },
      {
        role: "user" as const,
        content: `${type === "summary" ? "Summarize" : "Create a quiz about"} this text:\n${safeText}`,
      },
    ];

    const response = await groqClient.chat.completions.create({
      model: MODEL_NAME,
      messages,
      temperature: 0.2,
      max_tokens: 450,
      top_p: 1,
    });

    const content = response.choices[0]?.message?.content || "";
    const jsonString = extractJson(content);
    const parsed = JSON.parse(jsonString);

    if (type === "summary") {
      if (!parsed?.summary || typeof parsed.summary !== "string") {
        throw new Error("Summary response was invalid");
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          type,
          summary: parsed.summary.trim(),
          model: MODEL_NAME,
        }),
      };
    }

    validateQuiz(parsed?.questions);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        type,
        questions: parsed.questions,
        model: MODEL_NAME,
      }),
    };
  } catch (err: any) {
    console.error("[GroqTools] Failed to generate content:", err);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        error: err?.message || "Failed to generate content",
        fallback: type === "summary" ? { summary: fallbackSummary } : { questions: fallbackQuiz },
      }),
    };
  }
};
