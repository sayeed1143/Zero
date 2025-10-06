import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DEFAULT_FEATURE_MODELS, REFERER, FALLBACK_TEXT_MODEL } from './constants.js';

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
      message: 'Please add OPENROUTER_API_KEY to your environment variables'
    });
  }

  try {
    const { messages, model = DEFAULT_FEATURE_MODELS.chat, temperature = 0.7, maxTokens = 2000 } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request: messages array required' });
    }

    const systemPrompt = `You are Shunya AI, the embodiment of Mindful Intelligence. Tone: serene, precise, minimalist. Values: Lucidity, Stillness, Mastery, Integrity.
Always produce two parts:
A) A brief, tranquil caption summarizing the insight.
B) Immediately after, a JSON Canvas Artifact instruction to render on a chat-based canvas.

JSON must be a single object with keys: artifact_type, action, title, nodes, next_step_prompts. Use artifact_type="Geometric Mind Map" and action="RENDER" when appropriate.
Nodes format: [{"id":"A","label":"Core Concept","parent":null,"color":"monochrome_primary"},{"id":"B","label":"Key Component","parent":"A"}].
Use monochrome colors: monochrome_primary, monochrome_accent (for current focus). Keep output ethical: guide learning, do not write full graded work.
When user triggers phrases like "I don't get it", "Can you test me", "Am I ready", "Help me with this weak area", generate 5–10 diagnostic questions and return an artifact of type "Adaptive Diagnostic" instead, structured similarly with nodes representing concepts assessed.
`;

    const shunyaSystemMessage = { role: 'system' as const, content: systemPrompt };
    const hasSystemAlready = messages.some(m => m.role === 'system');
    const finalMessages = hasSystemAlready ? messages : [shunyaSystemMessage, ...messages];

    let selectedModel = model;
    let response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': REFERER,
        'X-Title': 'SHUNYA AI',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: finalMessages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok && selectedModel !== FALLBACK_TEXT_MODEL) {
      try {
        selectedModel = FALLBACK_TEXT_MODEL;
        response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': REFERER,
            'X-Title': 'SHUNYA AI',
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: finalMessages,
            temperature,
            max_tokens: maxTokens,
          }),
        });
      } catch {}
    }

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status || 500).json({
        error: 'OpenRouter API error',
        details: text
      });
    }

    const data = await response.json();

    return res.status(200).json({
      content: data.choices[0]?.message?.content || '',
      model: data.model || selectedModel,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      } : undefined,
    });

  } catch (error: any) {
    console.error('Chat API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
