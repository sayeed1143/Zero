import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DEFAULT_FEATURE_MODELS, REFERER, FALLBACK_TEXT_MODEL } from './constants.js';

const SUPPORTED_RELATIONS = new Set(['sequence', 'cycle', 'network', 'hierarchy']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).send('OK');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'OpenRouter API key not configured',
      message: 'Please add OPENROUTER_API_KEY to your environment variables',
    });
  }

  try {
    const { message, model = DEFAULT_FEATURE_MODELS.explanations } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'message is required',
      });
    }

    const systemPrompt = `You are Shunya AI operating in Insight Mode. Transform the learner's most recent explanation into a minimal diagram.
Respond ONLY with JSON following this schema:
{
  "diagram": {
    "title": string,
    "relation": "sequence" | "cycle" | "network" | "hierarchy",
    "steps": Array<{ "title": string, "detail"?: string }>
  },
  "explanation": string // concise (<=120 words)
}
Rules:
- Keep 3 to 6 steps that describe the conceptual flow.
- Use precise, human-friendly language.
- Do not wrap the JSON in Markdown fences or add commentary.
- If the learner's content lacks structure, infer a coherent flow before responding.
`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: message.trim() },
    ];

    let selectedModel = model;

    let response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': REFERER,
        'X-Title': 'SHUNYA AI',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages,
        temperature: 0.4,
        max_tokens: 600,
      }),
    });

    if (!response.ok && selectedModel !== FALLBACK_TEXT_MODEL) {
      try {
        selectedModel = FALLBACK_TEXT_MODEL;
        response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': REFERER,
            'X-Title': 'SHUNYA AI',
          },
          body: JSON.stringify({
            model: selectedModel,
            messages,
            temperature: 0.4,
            max_tokens: 600,
          }),
        });
      } catch {}
    }

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status || 500).json({
        error: 'OpenRouter API error',
        details: text,
      });
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '';

    let parsed: any;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      const match = rawContent.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {}
      }
    }

    if (!parsed || typeof parsed !== 'object') {
      return res.status(500).json({
        error: 'Invalid response',
        message: 'Visualization payload could not be parsed',
      });
    }

    const diagram = parsed.diagram || {};
    const stepsInput = Array.isArray(diagram.steps) ? diagram.steps : [];
    const steps = stepsInput
      .map((step: any) => {
        if (typeof step === 'string') {
          return { title: step.trim() };
        }
        if (step && typeof step === 'object') {
          const title = typeof step.title === 'string' ? step.title.trim() : '';
          const detail = typeof step.detail === 'string' ? step.detail.trim() : undefined;
          return title ? { title, detail } : null;
        }
        return null;
      })
      .filter((step: any) => step && step.title) as Array<{ title: string; detail?: string }>;

    const relationRaw = typeof diagram.relation === 'string' ? diagram.relation.toLowerCase().trim() : undefined;
    const relation = relationRaw && SUPPORTED_RELATIONS.has(relationRaw) ? relationRaw : undefined;
    const title = typeof diagram.title === 'string' ? diagram.title.trim() : 'Visualization';
    const explanation = typeof parsed.explanation === 'string' ? parsed.explanation.trim() : '';

    if (!steps.length || !explanation) {
      return res.status(500).json({
        error: 'Invalid response',
        message: 'Visualization missing required fields',
      });
    }

    return res.status(200).json({
      diagram: {
        title,
        steps: steps.slice(0, 8),
        ...(relation ? { relation } : {}),
      },
      explanation,
    });
  } catch (error: any) {
    console.error('Visualization API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
