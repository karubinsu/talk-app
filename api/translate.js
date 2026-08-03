// api/translate.js
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  const { system, userText, provider } = req.body || {};

  if (!userText) {
    return res.status(400).json({ error: 'Missing userText parameter.' });
  }

  // ---- Model registry ----
  const MODELS = {
    'gemini-3.6-flash':        { type: 'gemini', model: 'gemini-3.6-flash' },
    'gemini-3.5-flash-lite':   { type: 'gemini', model: 'gemini-3.5-flash-lite' },
    'gemini-3.5-flash':        { type: 'gemini', model: 'gemini-3.5-flash' },
    'llama-3.3-70b-versatile': { type: 'groq',   model: 'llama-3.3-70b-versatile' },
    'llama-3.1-8b-instant':    { type: 'groq',   model: 'llama-3.1-8b-instant' },
  };

  // Order used when provider === 'auto'
  const FALLBACK_CHAIN = [
    'gemini-3.6-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
  ];

  async function callGemini(modelName, system, userText) {
    if (!GEMINI_API_KEY) {
      const err = new Error('GEMINI_API_KEY is missing on server.');
      err.status = 500;
      throw err;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: system ? { parts: [{ text: system }] } : undefined,
          contents: [{ parts: [{ text: userText }] }],
          generationConfig: { temperature: 0.3 }
        })
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const err = new Error(errData.error?.message || `Gemini API error ${response.status}`);
      err.status = response.status;
      throw err;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    if (!text) {
      const err = new Error('Empty response from Gemini');
      err.status = 502;
      throw err;
    }
    return text;
  }

  async function callGroq(modelName, system, userText) {
    if (!GROQ_API_KEY) {
      const err = new Error('GROQ_API_KEY is missing on server.');
      err.status = 500;
      throw err;
    }

    const messages = [];
    if (system) messages.push({ role: 'system', content: system });
    messages.push({ role: 'user', content: userText });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: modelName,
        messages,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const err = new Error(errData.error?.message || `Groq API error ${response.status}`);
      err.status = response.status;
      throw err;
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim() || '';
    if (!text) {
      const err = new Error('Empty response from Groq');
      err.status = 502;
      throw err;
    }
    return text;
  }

  async function callModel(key, system, userText) {
    const cfg = MODELS[key];
    if (!cfg) {
      const err = new Error(`Unknown provider: ${key}`);
      err.status = 400;
      throw err;
    }
    return cfg.type === 'gemini'
      ? await callGemini(cfg.model, system, userText)
      : await callGroq(cfg.model, system, userText);
  }

  try {
    // ---- Explicit provider: force that model, no fallback ----
    if (provider && provider !== 'auto') {
      if (!MODELS[provider]) {
        return res.status(400).json({ error: `Unknown provider: ${provider}` });
      }
      const text = await callModel(provider, system, userText);
      return res.status(200).json({ text, usedModel: provider });
    }

    // ---- Auto mode: sequential fallback chain ----
    let lastError = null;
    for (const key of FALLBACK_CHAIN) {
      try {
        const text = await callModel(key, system, userText);
        return res.status(200).json({ text, usedModel: key });
      } catch (err) {
        lastError = err;
        // try next model in the chain on any error (429, 4xx, 5xx, empty response, etc.)
        continue;
      }
    }

    return res.status(502).json({
      error: lastError ? lastError.message : 'All providers failed.'
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
};
