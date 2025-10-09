// Netlify Serverless Function: sarvam-tts-proxy
// Standalone handler that proxies TTS requests to Sarvam AI without Express or serverless-http.

exports.handler = async function (event, context) {
  // Allow CORS (adjust origin as needed)
  const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  try {
    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 204,
        headers: CORS_HEADERS,
        body: '',
      };
    }

    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

    // Parse body (client should send JSON)
    let body = {};
    if (!event.body) {
      return {
        statusCode: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing request body' }),
      };
    }

    try {
      body = JSON.parse(event.body);
    } catch (err) {
      // If body is already an object (rare), use it; otherwise fail
      return {
        statusCode: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Request body must be JSON' }),
      };
    }

    const text = String(body.text || body.input || '');
    const speaker = String(body.voice || body.speaker || body.voiceId || 'anushka');
    const target_language_code = String(body.language || body.target_language_code || 'en-IN');

    if (!text.trim()) {
      return {
        statusCode: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing text to synthesize' }),
      };
    }

    const apiKey = process.env.SARVAM_API_KEY || process.env.VITE_SARVAM_API_KEY;
    if (!apiKey) {
      console.error('[sarvam-tts-proxy] SARVAM_API_KEY not configured');
      return {
        statusCode: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Server misconfiguration: SARVAM_API_KEY not set' }),
      };
    }

    // Call Sarvam TTS endpoint
    const sarvamResp = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey,
      },
      body: JSON.stringify({
        text,
        target_language_code,
        speaker,
      }),
    });

    if (!sarvamResp.ok) {
      const errText = await sarvamResp.text().catch(() => '');
      console.error('[sarvam-tts-proxy] Sarvam API error', sarvamResp.status, errText);
      return {
        statusCode: 502,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Sarvam upstream error', status: sarvamResp.status, details: errText }),
      };
    }

    // Sarvam may return JSON with base64 audio in `audios` array, or an audioUrl, or binary audio.
    const contentType = sarvamResp.headers.get('content-type') || '';

    // If JSON
    if (contentType.includes('application/json')) {
      const data = await sarvamResp.json();
      // Prefer `audios` array
      if (Array.isArray(data?.audios) && data.audios.length > 0) {
        const base64 = data.audios[0];
        // Return base64 as binary payload with proper flags
        return {
          statusCode: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'audio/wav' },
          isBase64Encoded: true,
          body: base64,
        };
      }
      // If there's an audioUrl, fetch it
      if (data?.audioUrl) {
        const audioFetch = await fetch(data.audioUrl);
        if (!audioFetch.ok) {
          const txt = await audioFetch.text().catch(() => '');
          console.error('[sarvam-tts-proxy] Failed to fetch audioUrl', audioFetch.status, txt);
          return {
            statusCode: 502,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Failed to retrieve audioUrl', details: txt }),
          };
        }
        const buffer = Buffer.from(await audioFetch.arrayBuffer());
        return {
          statusCode: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': audioFetch.headers.get('content-type') || 'audio/mpeg' },
          isBase64Encoded: true,
          body: buffer.toString('base64'),
        };
      }

      // If data itself is a base64 string
      if (typeof data === 'string' && data.length > 100) {
        return {
          statusCode: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'audio/wav' },
          isBase64Encoded: true,
          body: data,
        };
      }

      // Unknown JSON shape
      console.error('[sarvam-tts-proxy] Unknown JSON response shape', data);
      return {
        statusCode: 502,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unknown Sarvam response shape', data }),
      };
    }

    // If Sarvam returned binary audio directly
    if (contentType.startsWith('audio/')) {
      const arrayBuffer = await sarvamResp.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return {
        statusCode: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': contentType },
        isBase64Encoded: true,
        body: buffer.toString('base64'),
      };
    }

    // Fallback: try parsing JSON then handling
    try {
      const data = await sarvamResp.json();
      if (Array.isArray(data?.audios) && data.audios.length > 0) {
        return {
          statusCode: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'audio/wav' },
          isBase64Encoded: true,
          body: data.audios[0],
        };
      }
      return {
        statusCode: 502,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unhandled Sarvam response', data }),
      };
    } catch (err) {
      console.error('[sarvam-tts-proxy] Could not handle Sarvam response', err);
      return {
        statusCode: 502,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unhandled Sarvam response and failed to parse' }),
      };
    }
  } catch (err) {
    console.error('[sarvam-tts-proxy] Unexpected error', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal server error', details: String(err) }),
    };
  }
};
