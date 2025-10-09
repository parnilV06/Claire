import { RequestHandler } from "express";

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

export const handleOpenRouterChat: RequestHandler = async (req, res) => {
  try {
    // Use Hugging Face Inference API instead of OpenRouter
    const hfKey = process.env.HF_API_KEY;
    // Debug log to help determine if the key is available in the runtime
    try {
      const masked = hfKey ? `${String(hfKey).slice(0, 4)}...${String(hfKey).slice(-4)}` : null;
      console.info('[HuggingFace] HF_API_KEY present:', Boolean(hfKey), masked ? `masked:${masked}` : '');
    } catch (e) {
      console.info('[HuggingFace] HF_API_KEY present:', Boolean(hfKey));
    }
    if (!hfKey) {
      console.error('[HuggingFace] HF_API_KEY is not configured');
      return res.status(500).json({ error: 'Hugging Face API key not configured on server' });
    }

    const body = req.body || {};
    const conversation = Array.isArray(body.conversation) ? body.conversation : [];
    const userMessage = typeof body.message === 'string' ? body.message : '';
    if (!userMessage) {
      return res.status(400).json({ error: 'Missing message in request body' });
    }

    // Build a single prompt string for HF Inference API. We include the system
    // prompt then the recent conversation and the latest user message.
    const historyText = conversation.map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
    const prompt = `${SYSTEM_PROMPT}

${historyText}
User: ${userMessage}
Assistant:`;

    try {
      const hfResp = await fetch('https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${hfKey}`
        },
        body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 512, temperature: 0.2, top_p: 0.95 } })
      });

      if (!hfResp.ok) {
        const errText = await hfResp.text();
        console.error('[HuggingFace] upstream error', hfResp.status, errText);
        return res.status(502).json({ error: 'Hugging Face upstream error', details: errText });
      }

      // Hugging Face inference responses vary. Try to parse common shapes.
      const data = await hfResp.json();
      let aiText: string | undefined;

      // Common HF output: { generated_text: '...' }
      if (typeof data === 'string') {
        aiText = data;
      } else if (data?.generated_text) {
        aiText = data.generated_text;
      } else if (Array.isArray(data) && data[0]?.generated_text) {
        aiText = data[0].generated_text;
      } else if (data?.error) {
        // model error
        console.error('[HuggingFace] model error object', data.error);
        return res.status(502).json({ error: 'Hugging Face model error', details: data.error });
      } else if (data?.[0]?.error) {
        console.error('[HuggingFace] model error', data[0].error);
        return res.status(502).json({ error: 'Hugging Face model error', details: data[0].error });
      } else {
        // Fallback: try to stringify any returned field
        aiText = String(data?.generated_text || data?.[0]?.generated_text || JSON.stringify(data));
      }

      // Basic crisis detection on server side (in addition to model instructions)
      const crisisRegex = /\b(suicide|kill myself|harm myself|hurt myself|want to die|kill)\b/i;
      const isCrisis = crisisRegex.test(userMessage) || crisisRegex.test(String(aiText));

      return res.json({ content: aiText, isCrisis: Boolean(isCrisis) });
    } catch (err: any) {
      console.error('[HuggingFace] Unexpected error', err);
      return res.status(500).json({ error: 'Internal server error', details: err?.message || String(err) });
    }
  } catch (err: any) {
    console.error('[HuggingFace] Unexpected error', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};
