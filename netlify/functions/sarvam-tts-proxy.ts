import { Handler } from '@netlify/functions';

// Common response headers for CORS and content type
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

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
    if (!body.text || typeof body.text !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing or invalid text in request body' }),
      };
    }

    const apiKey = process.env.SARVAM_API_KEY || process.env.VITE_SARVAM_API_KEY;
    if (!apiKey) {
      console.error('[Sarvam TTS] No API key configured on server');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Sarvam API key not configured on server' }),
      };
    }

    // Call Sarvam text-to-speech with proper parameters
    const response = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey
      },
      body: JSON.stringify({
        text: body.text,
        target_language_code: body.target_language_code || body.language || 'en-IN',
        speaker: body.speaker || body.voice || 'anushka'
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[Sarvam TTS] API error', response.status, errText);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: 'Sarvam TTS upstream error', details: errText }),
      };
    }

    // Handle different response types from Sarvam
    const contentType = response.headers.get('content-type') || '';

    // If JSON response (contains base64 audio)
    if (contentType.includes('application/json')) {
      const data = await response.json();
      
      // Handle audios array format
      if (Array.isArray(data?.audios) && data.audios.length > 0) {
        return {
          statusCode: 200,
          headers: {
            ...headers,
            'Content-Type': 'audio/wav',
          },
          isBase64Encoded: true,
          body: data.audios[0],
        };
      }
      
      // Handle audioUrl format
      if (data?.audioUrl) {
        const audioResponse = await fetch(data.audioUrl);
        if (!audioResponse.ok) {
          throw new Error('Failed to fetch audio from URL');
        }
        const audioData = await audioResponse.arrayBuffer();
        return {
          statusCode: 200,
          headers: {
            ...headers,
            'Content-Type': 'audio/wav',
          },
          isBase64Encoded: true,
          body: Buffer.from(audioData).toString('base64'),
        };
      }

      // If data itself is a base64 string
      if (typeof data === 'string' && data.length > 100) {
        return {
          statusCode: 200,
          headers: {
            ...headers,
            'Content-Type': 'audio/wav',
          },
          isBase64Encoded: true,
          body: data,
        };
      }

      // Unknown JSON format
      console.error('[Sarvam TTS] Unknown JSON response format:', data);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'Unknown Sarvam response format', data }),
      };
    }

    // If binary audio response
    if (contentType.startsWith('audio/')) {
      const audioData = await response.arrayBuffer();
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': contentType,
        },
        isBase64Encoded: true,
        body: Buffer.from(audioData).toString('base64'),
      };
    }

    // Fallback: try to parse as JSON
    try {
      const data = await response.json();
      if (Array.isArray(data?.audios) && data.audios.length > 0) {
        return {
          statusCode: 200,
          headers: {
            ...headers,
            'Content-Type': 'audio/wav',
          },
          isBase64Encoded: true,
          body: data.audios[0],
        };
      }
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'Unhandled Sarvam response format', data }),
      };
    } catch (parseErr) {
      console.error('[Sarvam TTS] Could not parse response:', parseErr);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'Failed to parse Sarvam response' }),
      };
    }

  } catch (error) {
    console.error('[Sarvam TTS] Error:', error);
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