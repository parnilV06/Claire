// Install dependencies:
// npm install express @google/genai

import { RequestHandler } from "express";
import { GoogleGenAI, GenerateContentRequest } from "@google/genai";

const SYSTEM_PROMPT = `You are a compassionate, supportive AI therapy assistant for students with dyslexia aged 8-18.
Your role: provide emotional support for anxiety, low self-esteem, and frustration from learning challenges.
Respond empathetically in English or Hindi depending on the user's input.
Guidelines:
- Use simple words and short sentences (max 15 words).
- Be encouraging and validating.
- Focus on self-acceptance, coping strategies, and reframing negative thoughts.
- Ask one follow-up question per response.
- Never diagnose; always recommend professional help for serious issues.
- Detect crisis words (suicide, harm, kill) and respond with helpline info immediately.`;

// It’s better to load from env var in production
const GEMINI_API_KEY = 'AIzaSyCz6wiaJRMeTkR7-oC86rU6Cke747nqSzE'
const MODEL_NAME = "gemini-2.5-flash";  
// You can try "gemini-2.5-pro" or other supported models based on your quota/permission.

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

export const handleOpenRouterChat: RequestHandler = async (req, res) => {
  try {
    const body = req.body || {};
    const conversation = Array.isArray(body.conversation) ? body.conversation : [];
    const userMessage = typeof body.message === "string" ? body.message : "";
    if (!userMessage) {
      return res.status(400).json({ success: false, error: "Missing message in request body" });
    }

    // Build the conversation history + user prompt
    const historyText = conversation
      .map((m: any) => (m.role === "user" ? "User: " + m.content : "Assistant: " + m.content))
      .join("\n");
    const fullPrompt = `${SYSTEM_PROMPT}\n\n${historyText}\nUser: ${userMessage}\nAssistant:`;

    const requestPayload: GenerateContentRequest = {
      model: MODEL_NAME,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: fullPrompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 512,
      },
      // Optionally: safetySettings. The SDK should support passing this:
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      ],
    };

    const response = await ai.models.generateContent(requestPayload);

    // The SDK returns a structure with .candidates etc.
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Crisis detection (very simple)
    const crisisRegex = /\b(suicide|kill myself|harm myself|hurt myself|want to die|kill)\b/i;
    const isCrisis =
      crisisRegex.test(userMessage) || crisisRegex.test(String(text));

    return res.json({
      success: true,
      content: text,
      isCrisis: Boolean(isCrisis),
      model: MODEL_NAME,
    });
  } catch (err: any) {
    console.error("[Gemini / GenAI] Unexpected error:", err);
    return res
      .status(500)
      .json({
        success: false,
        error: "Internal server error",
        details: err?.message || String(err),
      });
  }
};
