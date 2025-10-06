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

    const systemPrompt = `You are Shunya AI operating in Insight Mode as a visual knowledge designer. Produce a teaching-quality visualization.
Respond ONLY with JSON following this schema:
{
  "diagram": {
    "title": string,
    "relation": "sequence" | "cycle" | "network" | "hierarchy",
    "steps": Array<{ "title": string, "detail"?: string }>
  },
  "graph": {
    "type": "mind_map" | "hierarchy" | "flowchart" | "teaching_layout" | "concept_map",
    "nodes": Array<{ "id": string, "label": string, "parent": string | null, "relation_type"?: "cause" | "effect" | "example" | "prerequisite" | "step" | "note", "color_theme"?: string }>,
    "edges": Array<{ "from": string, "to": string, "label"?: string, "relation_type"?: string }>
  },
  "explanation": string
}
Guidance:
- Prompt 1 (mind map): main branches, sub-branches, and examples — classroom-ready.
- Prompt 2 (concept hierarchy): clear levels with short descriptors at each node.
- Prompt 3 (flowchart): process with labeled arrows showing cause -> effect -> outcome.
- Prompt 4 (teaching layout): whiteboard-friendly, top-to-bottom clarity, concise points.
- Prompt 5 (professional concept map): ensure nodes/edges can be rendered cleanly.
Constraints:
- Keep diagram.steps to 3–8 main steps capturing the flow.
- Use precise, human-friendly language.
- Output plain JSON only; no Markdown symbols or code fences.
- If input lacks structure, infer a coherent structure before responding.
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

    // Normalize optional advanced graph schema
    const graphRaw = parsed.graph || {};
    const typeRaw = typeof graphRaw.type === 'string' ? graphRaw.type.toLowerCase().trim() : undefined;
    const graphType = typeRaw && SUPPORTED_GRAPH_TYPES.has(typeRaw) ? typeRaw : undefined;

    const nodesInput = Array.isArray(graphRaw.nodes) ? graphRaw.nodes : [];
    const nodes = nodesInput
      .map((n: any, i: number) => {
        if (!n || typeof n !== 'object') return null;
        const id = typeof n.id === 'string' && n.id.trim() ? n.id.trim() : String(i + 1);
        const label = typeof n.label === 'string' ? n.label.trim() : '';
        if (!label) return null;
        const parent = typeof n.parent === 'string' ? n.parent.trim() : null;
        const relation_type = typeof n.relation_type === 'string' ? n.relation_type.trim() : undefined;
        const color_theme = typeof n.color_theme === 'string' ? n.color_theme.trim() : undefined;
        return { id, label, parent, ...(relation_type ? { relation_type } : {}), ...(color_theme ? { color_theme } : {}) };
      })
      .filter((n: any) => n && n.id && n.label);

    const edgesInput = Array.isArray(graphRaw.edges) ? graphRaw.edges : [];
    const edges = edgesInput
      .map((e: any) => {
        if (!e || typeof e !== 'object') return null;
        const from = typeof e.from === 'string' ? e.from.trim() : '';
        const to = typeof e.to === 'string' ? e.to.trim() : '';
        if (!from || !to) return null;
        const label = typeof e.label === 'string' ? e.label.trim() : undefined;
        const relation_type = typeof e.relation_type === 'string' ? e.relation_type.trim() : undefined;
        return { from, to, ...(label ? { label } : {}), ...(relation_type ? { relation_type } : {}) };
      })
      .filter((e: any) => e && e.from && e.to);

    if (!steps.length || !explanation) {
      return res.status(500).json({
        error: 'Invalid response',
        message: 'Visualization missing required fields',
      });
    }

    const payload: any = {
      diagram: {
        title,
        steps: steps.slice(0, 8),
        ...(relation ? { relation } : {}),
      },
      explanation,
    };

    if (nodes.length) {
      payload.graph = {
        ...(graphType ? { type: graphType } : {}),
        nodes,
        edges,
      };
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
