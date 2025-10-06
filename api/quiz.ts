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
    const { content, numQuestions = 5, difficulty = 'medium', model = DEFAULT_FEATURE_MODELS.quiz } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Invalid request: content required' });
    }

    const systemPrompt = `You are an educational quiz generator. Create ${numQuestions} ${difficulty} difficulty multiple-choice questions based on the provided content. 

Format your response as a JSON array with this structure:
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of the correct answer"
  }
]

The correctAnswer should be the index (0-3) of the correct option.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Generate a quiz based on this content:\n\n${content}` },
    ];

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
        messages,
        temperature: 0.8,
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
            'X-Title': 'SHUNYA AI',
          },
          body: JSON.stringify({
            model: selectedModel,
            messages,
            temperature: 0.8,
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
    const questions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    
    return res.status(200).json({
      questions,
    });

  } catch (error: any) {
    console.error('Quiz API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
