import { Handler } from '@netlify/functions';

// Common response headers for CORS and content type
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

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

export const handler: Handler = async (event, context) => {
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  // Ensure this is a POST request
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Safely parse the request body
    const body = event.body ? JSON.parse(event.body) : {};
    
    // Validate required fields
    if (!body.message || typeof body.message !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing or invalid message in request body' }),
      };
    }

    const conversation = Array.isArray(body.conversation) ? body.conversation : [];
    const userMessage = body.message;

    // Build the conversation history + user prompt
    const historyText = conversation
      .map((m: any) => (m.role === "user" ? "User: " + m.content : "Assistant: " + m.content))
      .join("\n");
    const fullPrompt = `${SYSTEM_PROMPT}\n\n${historyText}\nUser: ${userMessage}\nAssistant:`;

    // Call Gemini API
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCz6wiaJRMeTkR7-oC86rU6Cke747nqSzE';
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[OpenRouter Chat] Gemini API error:', error);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: 'Gemini API error', details: error }),
      };
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I did not understand that.";

    // Crisis detection (very simple)
    const crisisRegex = /\b(suicide|kill myself|harm myself|hurt myself|want to die|kill)\b/i;
    const isCrisis = crisisRegex.test(userMessage) || crisisRegex.test(String(text));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        content: text,
        isCrisis: Boolean(isCrisis),
        model: "gemini-2.5-flash",
      }),
    };

  } catch (error) {
    console.error('[OpenRouter Chat] Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      }),
    };
  }
};
