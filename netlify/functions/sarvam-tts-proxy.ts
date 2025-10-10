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

    // Call Sarvam TTS API with proper headers and validated input
    const response = await fetch('https://api.sarvmtech.com/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': process.env.SARVAM_API_KEY || '',
      },
      body: JSON.stringify({
        text: body.text,
        language: body.language || 'en',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Sarvam TTS] API error:', error);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: 'TTS API error', details: error }),
      };
    }

    // Forward the audio data with correct headers
    const audioData = await response.arrayBuffer();
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'audio/wav',
        'Content-Length': audioData.byteLength.toString(),
      },
      body: Buffer.from(audioData).toString('base64'),
      isBase64Encoded: true,
    };

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