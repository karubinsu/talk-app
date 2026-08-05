// api/translate.js
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GEMINI_KEYS = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
  ].filter(Boolean);

  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  const { system, userText, provider } = req.body || {};

  if (!userText) {
    return res.status(400).json({ error: 'Missing userText parameter.' });
  }

  async function callGemini(modelName, system, userText, apiKey) {
    if (!apiKey) {
      const err = new Error('No Gemini API key available.');
      err.status = 500;
      throw err;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
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

  // Build a labeled "attempt" for every key we have on a given Gemini model,
  // so the dev drawer can show exactly which model+key answered.
  function geminiAttempts(modelName) {
    return GEMINI_KEYS.map((key, i) => ({
      type: 'gemini',
      model: modelName,
      apiKey: key,
      label: `${modelName} (key ${i + 1})`
    }));
  }

  const KNOWN_MODELS = [
    'gemini-3.6-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
  ];

  // Auto chain: exhaust every Gemini key on 3.5-flash-lite first (it's the
  // cheapest/fastest), then fall through to the other models, one key each.
  const AUTO_CHAIN = [
    ...geminiAttempts('gemini-3.5-flash-lite'),
    ...geminiAttempts('gemini-3.6-flash').slice(0, 1),
    ...geminiAttempts('gemini-3.5-flash').slice(0, 1),
    { type: 'groq', model: 'llama-3.3-70b-versatile', label: 'llama-3.3-70b-versatile' },
    { type: 'groq', model: 'llama-3.1-8b-instant', label: 'llama-3.1-8b-instant' },
  ];

  async function runAttempt(attempt, system, userText) {
    return attempt.type === 'gemini'
      ? await callGemini(attempt.model, system, userText, attempt.apiKey)
      : await callGroq(attempt.model, system, userText);
  }

  try {
    let chain;

    if (provider && provider !== 'auto') {
      if (!KNOWN_MODELS.includes(provider)) {
        return res.status(400).json({ error: `Unknown provider: ${provider}` });
      }
      // Explicit model choice: no falling through to other models, but still
      // rotate across all available keys for that one model (Gemini only —
      // Groq has a single key).
      chain = provider.startsWith('gemini')
        ? geminiAttempts(provider)
        : [{ type: 'groq', model: provider, label: provider }];
    } else {
      chain = AUTO_CHAIN;
    }

    let lastError = null;
    for (const attempt of chain) {
      try {
        const text = await runAttempt(attempt, system, userText);
        return res.status(200).json({ text, usedModel: attempt.label });
      } catch (err) {
        lastError = err;
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