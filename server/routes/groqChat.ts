import { RequestHandler } from "express";

const SYSTEM_PROMPT = `You are an emotional wellbeing companion designed to support students with dyslexia.
Provide empathetic, encouraging, and supportive responses.
Do not provide medical or psychological diagnoses.
Keep responses calm, human-like, and under 120 words.`;

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL_NAME = "llama-3.3-70b-versatile";

// Lazy initialize Groq client
let groq: any | null = null;
async function getGroqClient() {
  if (!groq) {
    try {
      // Use dynamic import to handle ES modules properly
      const GroqModule = await import("groq-sdk");
      const GroqClass = (GroqModule as any).default || (GroqModule as any).Groq || GroqModule;
      groq = new GroqClass({
        apiKey: GROQ_API_KEY,
      }) as any;
    } catch (err) {
      console.error("[GroqChat] Failed to initialize Groq client:", err);
      throw new Error("Failed to initialize AI client");
    }
  }
  return groq;
}

export const handleGroqChat: RequestHandler = async (req, res) => {
  try {
    // Validate API key
    if (!GROQ_API_KEY) {
      console.error("[GroqChat] Missing GROQ_API_KEY environment variable");
      return res.status(500).json({
        success: false,
        error: "Internal server error - API key not configured",
      });
    }

    const body = req.body || {};
    const conversation = Array.isArray(body.conversation) ? body.conversation : [];
    const userMessage = typeof body.message === "string" ? body.message : "";

    if (!userMessage) {
      return res.status(400).json({
        success: false,
        error: "Missing message in request body",
      });
    }

    // Build conversation history for Groq
    const messageHistory = [
      {
        role: "system" as const,
        content: SYSTEM_PROMPT,
      },
      ...conversation.map((m: any) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      {
        role: "user" as const,
        content: userMessage,
      },
    ];

    // Call Groq API
    const groqClient = await getGroqClient();
    const response = await groqClient.chat.completions.create({
      model: MODEL_NAME,
      messages: messageHistory,
      temperature: 0.7,
      max_tokens: 256,
      top_p: 1.0,
    });

    const text =
      response.choices[0]?.message?.content || "Sorry, I did not understand that.";

    // Crisis detection (simple regex)
    const crisisRegex = /\b(suicide|kill myself|harm myself|hurt myself|want to die|kill myself)\b/i;
    const isCrisis = crisisRegex.test(userMessage) || crisisRegex.test(String(text));

    return res.json({
      success: true,
      content: text,
      isCrisis: Boolean(isCrisis),
      model: MODEL_NAME,
    });
  } catch (err: any) {
    console.error("[GroqChat] Unexpected error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details: err?.message || String(err),
    });
  }
};
