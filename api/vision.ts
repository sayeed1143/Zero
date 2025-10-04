import type { VercelRequest, VercelResponse } from '@vercel/node';

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DEFAULT_FEATURE_MODELS } from '../src/types/ai';

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

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.VERCEL_URL || 'http://localhost:5000',
        'X-Title': 'EduVoice AI',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ 
        error: 'OpenRouter API error',
        details: error 
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
