import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DEFAULT_FEATURE_MODELS, REFERER, FALLBACK_VISION_MODEL } from './constants.js';

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
    const { image, prompt, model = DEFAULT_FEATURE_MODELS.vision } = req.body;

    if (!image || !prompt) {
      return res.status(400).json({ error: 'Invalid request: image and prompt required' });
    }

    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt,
          },
          {
            type: 'image_url',
            image_url: {
              url: image,
            },
          },
        ],
      },
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
        max_tokens: 2000,
      }),
    });

    if (!response.ok && selectedModel !== FALLBACK_VISION_MODEL) {
      try {
        selectedModel = FALLBACK_VISION_MODEL;
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
    
    return res.status(200).json({
      content: data.choices[0]?.message?.content || '',
      model: data.model,
    });

  } catch (error: any) {
    console.error('Vision API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
