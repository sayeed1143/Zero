import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DEFAULT_FEATURE_MODELS, REFERER, FALLBACK_TEXT_MODEL } from './constants.js';

const SUPPORTED_RELATIONS = new Set(['sequence', 'cycle', 'network', 'hierarchy']);
const SUPPORTED_GRAPH_TYPES = new Set(['mind_map', 'hierarchy', 'flowchart', 'teaching_layout', 'concept_map']);

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

    const systemPrompt = `You are the Insight Mode Engine for Shunya AI. Your ONLY job is to convert the user's concept into two distinct JSON objects. Do NOT include ANY prose, conversation, or surrounding text. Use simple, student-friendly language.

Return a single JSON object with two keys exactly: "Flow_Insight" and "Map_Structure". Follow this STRICT JSON SCHEMA exactly (types shown for clarity):

{
  "Flow_Insight": {
    "title": "string",
    "steps": [
      { "label": "string", "icon": "string", "color": "string" }
    ],
    "explanation": "string"
  },
  "Map_Structure": {
    "title": "string",
    "nodes": [
      { "id": "string", "label": "string", "parent": "string | null", "description": "A very brief, student-friendly example." }
    ]
  }
}

Rules:
- Flow_Insight.steps should contain 3 to 5 items describing the core mechanism (linear flow).
- Map_Structure.nodes should represent a hierarchical mind map (root node parent=null).
- Do NOT include any additional keys, prose, or metadata. Do NOT use Markdown or code fences.
- If the user input lacks structure, infer classroom-ready branches and short examples.

Respond only with the JSON object; nothing else.`;

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
        raw: rawContent,
      });
    }

    // Expect strict schema: Flow_Insight and Map_Structure
    const flow = parsed.Flow_Insight || parsed.Flow || parsed.flow;
    const map = parsed.Map_Structure || parsed.Map || parsed.map;

    if (!flow || typeof flow !== 'object') {
      return res.status(500).json({ error: 'Invalid response', message: 'Flow_Insight object missing or malformed' });
    }

    const flowTitle = typeof flow.title === 'string' ? flow.title.trim() : 'Flow Insight';
    const flowStepsRaw = Array.isArray(flow.steps) ? flow.steps : [];
    const flowSteps = flowStepsRaw
      .map((s: any, i: number) => {
        if (!s || typeof s !== 'object') return null;
        const label = typeof s.label === 'string' ? s.label.trim() : (typeof s === 'string' ? s.trim() : 'Step ' + (i + 1));
        const detail = typeof s.detail === 'string' ? s.detail.trim() : undefined;
        return label ? { title: label, detail } : null;
      })
      .filter((s: any) => s && s.title)
      .slice(0, 8);

    const explanation = typeof flow.explanation === 'string' ? flow.explanation.trim() : '';

    if (flowSteps.length < 1 || !explanation) {
      return res.status(500).json({ error: 'Invalid response', message: 'Flow_Insight missing steps or explanation' });
    }

    const payload: any = {
      diagram: {
        title: flowTitle,
        steps: flowSteps.slice(0, 8),
      },
      explanation,
    };

    if (map && typeof map === 'object' && Array.isArray(map.nodes) && map.nodes.length) {
      const nodes = map.nodes
        .map((n: any, i: number) => {
          if (!n || typeof n !== 'object') return null;
          const id = typeof n.id === 'string' && n.id.trim() ? n.id.trim() : String(i + 1);
          const label = typeof n.label === 'string' ? n.label.trim() : '';
          if (!label) return null;
          const parent = n.parent === null ? null : (typeof n.parent === 'string' && n.parent.trim() ? n.parent.trim() : null);
          const description = typeof n.description === 'string' ? n.description.trim() : undefined;
          return { id, label, parent, ...(description ? { description } : {}) };
        })
        .filter((n: any) => n && n.id && n.label);

      if (nodes.length) {
        payload.graph = {
          type: 'mind_map',
          nodes,
          edges: [],
        };
      }
    }

    return res.status(200).json(payload);
  } catch (error: any) {
    console.error('Visualization API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
