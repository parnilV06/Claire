import { RequestHandler } from "express";

export const handleSarvamGenerate: RequestHandler = async (req, res) => {
  try {
    console.log("[Sarvam Proxy] Incoming request body:", req.body);
    const apiKey = process.env.SARVAM_API_KEY || process.env.VITE_SARVAM_API_KEY;
    if (!apiKey) {
      console.error("[Sarvam Proxy] No API key found");
      return res.status(500).json({ error: "Sarvam API key not configured on server" });
    }
    const body = req.body || {};
    
    // Define a function to attempt quiz generation with retries
    async function generateQuiz(attempt = 1, maxAttempts = 3): Promise<any> {
      const requestBody = {
        model: "sarvam-m",
        messages: [
          {
            role: "system",
            content: `You are a JSON API for quiz generation. Respond ONLY with a JSON object - no other text. Format:
{"questions":[{"question":"Q1?","options":["A","B","C","D"],"answer":0}]}

CRITICAL RULES:
1. Output ONLY valid JSON - no explanations, no extra text
2. Include EXACTLY 5 questions
3. Each question MUST have:
   - "question": short, clear question ending with ?
   - "options": array of EXACTLY 4 short answers
   - "answer": number 0-3 only
4. Keep answers short (1-4 words)
5. Total response must be under 800 characters
6. Test your JSON is valid before sending
7. If you cannot generate valid JSON, respond with: {"error":"Failed to generate quiz"}

Example of a good question:
{"questions":[{"question":"What is photosynthesis?","options":["Food making","Breathing","Growing","Moving"],"answer":0}]}` 
          },
          {
            role: "user",
            content: `Generate a 5-question quiz about: ${body.prompt}`
          }
        ],
        temperature: 0.3,
        max_tokens: 512,
        presence_penalty: 0,
        frequency_penalty: 0,
        reasoning_effort: "high"
      };

      console.log(`[Sarvam Proxy] Attempt ${attempt}/${maxAttempts} - Sending request to API`);
      
      const response = await fetch("https://api.sarvam.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-subscription-key": apiKey
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }

      const text = await response.text();
      console.log("[Sarvam Proxy] Raw API response:", text);
      
      const chatResponse = JSON.parse(text);
      if (!chatResponse.choices?.[0]?.message?.content) {
        throw new Error("No content in API response");
      }

      const content = chatResponse.choices[0].message.content.trim();
      console.log("[Sarvam Proxy] AI content:", content);

      // Try to find and parse JSON in the content
      const firstBrace = content.indexOf('{');
      const lastBrace = content.lastIndexOf('}');
      if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
        throw new Error("No JSON object found in response");
      }

      // Extract the most-likely JSON substring
      let jsonString = content.slice(firstBrace, lastBrace + 1).trim();

      // Strip common assistant annotations like <think>...</think> and other markup
      jsonString = jsonString.replace(/<[^>]+>/g, '');

      // Remove trailing commas before closing arrays/objects which often break JSON
      jsonString = jsonString.replace(/,(\s*[\]}])/g, '$1');

      // Normalize fancy quotes to straight quotes
      jsonString = jsonString.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');

      let quizData;
      try {
        quizData = JSON.parse(jsonString);
      } catch (e: any) {
        const errMsg = e?.message || String(e);
        // include a short snippet to help debugging the invalid JSON
        const snippet = jsonString.length > 500 ? jsonString.slice(0, 500) + '...' : jsonString;
        throw new Error("Invalid JSON: " + errMsg + " - snippet: " + snippet);
      }

      // Validate quiz structure
      if (!quizData?.questions?.length) {
        throw new Error("Missing questions array");
      }

      if (quizData.questions.length !== 5) {
        throw new Error(`Expected 5 questions, got ${quizData.questions.length}`);
      }

      // Validate each question
      quizData.questions.forEach((q: any, i: number) => {
        if (!q.question?.trim()) {
          throw new Error(`Question ${i + 1} is empty`);
        }
        if (!Array.isArray(q.options) || q.options.length !== 4) {
          throw new Error(`Question ${i + 1} must have exactly 4 options`);
        }
        if (q.options.some((opt: any) => typeof opt !== "string" || !opt.trim())) {
          throw new Error(`Question ${i + 1} has invalid options`);
        }
        if (typeof q.answer !== "number" || q.answer < 0 || q.answer > 3) {
          throw new Error(`Question ${i + 1} answer must be 0-3`);
        }
      });

      return quizData;
    }

    // Try to generate quiz with retries
    let lastError = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const quiz = await generateQuiz(attempt);
        console.log("[Sarvam Proxy] Successfully generated quiz on attempt", attempt);
        return res.json(quiz);
      } catch (err: any) {
        lastError = err;
        console.error(`[Sarvam Proxy] Attempt ${attempt} failed:`, err.message);
        if (attempt < 3) {
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // If we get here, all attempts failed
    console.error("[Sarvam Proxy] All quiz generation attempts failed");
    return res.status(400).json({
      error: "Failed to generate quiz",
      details: lastError?.message || "Unknown error",
      tip: "Please try again with a different prompt"
    });

  } catch (err: any) {
    console.error("[Sarvam Proxy] Unexpected error:", err);
    return res.status(500).json({
      error: "Internal server error",
      details: err.message
    });
  }
};
