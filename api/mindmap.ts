import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DEFAULT_FEATURE_MODELS, REFERER, FALLBACK_TEXT_MODEL } from './constants.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    const { content, model = DEFAULT_FEATURE_MODELS.mindmap } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Invalid request: content required' });
    }

    const systemPrompt = `You are a mind map generator. Analyze the content and create a structured mind map with main topics and subtopics.

Format your response as a JSON array with this structure:
[
  {
    "id": "unique-id",
    "title": "Main Topic",
    "type": "text",
    "children": ["child-id-1", "child-id-2"]
  },
  {
    "id": "child-id-1",
    "title": "Subtopic 1",
    "type": "text",
    "children": []
  }
]

Create a hierarchical structure that represents the key concepts and their relationships.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Create a mind map for this content:\n\n${content}` },
    ];

    let selectedModel = model;
    let response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': REFERER,
        'X-Title': 'EduVoice AI',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
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
            'X-Title': 'EduVoice AI',
          },
          body: JSON.stringify({
            model: selectedModel,
            messages,
            temperature: 0.7,
            max_tokens: 2000,
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
    const content_response = data.choices[0]?.message?.content || '';
    
    const jsonMatch = content_response.match(/\[[\s\S]*\]/);
    const nodes = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    
    return res.status(200).json({
      nodes,
    });

  } catch (error: any) {
    console.error('Mind map API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
