const GEMINI_ENV_KEYS = [
  'GEMINI_API_KEY',
  'API_KEY',
  'VITE_GEMINI_API_KEY',
  'VITE_API_KEY',
  'GOOGLE_API_KEY',
  'GOOGLEAI_API_KEY',
  '__FURES_TRAVEL_AI_COMPANION_API_KEY__',
  '__FURES_TRAVEL_GEMINI_API_KEY__',
  '__FURES_GEMINI_API_KEY__',
  '__GEMINI_API_KEY__',
];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const jsonHeaders = {
  ...corsHeaders,
  'Content-Type': 'application/json',
};

function resolveGeminiKey() {
  for (const key of GEMINI_ENV_KEYS) {
    const value = process.env[key];
    if (value && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }
  return history.filter((entry) => {
    if (!entry || typeof entry !== 'object') {
      return false;
    }
    const role = entry.role;
    const parts = entry.parts;
    return (
      (role === 'user' || role === 'model') &&
      Array.isArray(parts) &&
      parts.length > 0 &&
      parts.every((part) => part && typeof part === 'object')
    );
  });
}

exports.handler = async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  const apiKey = resolveGeminiKey();
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Missing Gemini API key configuration.' }),
    };
  }

  let requestPayload;
  try {
    requestPayload = event.body ? JSON.parse(event.body) : {};
  } catch (error) {
    return {
      statusCode: 400,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Invalid JSON payload.' }),
    };
  }

  const { prompt, history = [], generationConfig, systemInstruction } = requestPayload;

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return {
      statusCode: 400,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'The prompt field is required.' }),
    };
  }

  const contents = normalizeHistory(history);
  contents.push({ role: 'user', parts: [{ text: prompt }] });

  const body = {
    contents,
  };

  if (generationConfig && typeof generationConfig === 'object') {
    body.generationConfig = generationConfig;
  }

  if (systemInstruction && typeof systemInstruction === 'object') {
    body.systemInstruction = systemInstruction;
  }

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' +
        encodeURIComponent(apiKey),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      const status = response.status || 500;
      return {
        statusCode: status,
        headers: jsonHeaders,
        body: JSON.stringify({ error: data.error || data }),
      };
    }

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Failed to contact Gemini API.', details: error.message }),
    };
  }
};
