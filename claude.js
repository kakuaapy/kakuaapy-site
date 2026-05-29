// api/claude.js — Vercel Serverless Function
// Proxy para a API Anthropic (resolve CORS do browser)
// Deploy: coloque este arquivo em /api/claude.js no projeto Vercel

export default async function handler(req, res) {
  // Apenas POST permitido
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt obrigatório' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':            'application/json',
        'x-api-key':               process.env.ANTHROPIC_API_KEY,
        'anthropic-version':       '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 400,
        messages:   [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    const text = data.content?.map(i => i.text || '').join('').trim();

    return res.status(200).json({ text });

  } catch (error) {
    console.error('Erro na API Anthropic:', error);
    return res.status(500).json({ error: error.message });
  }
}
