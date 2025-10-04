import type { VercelRequest, VercelResponse } from '@vercel/node';

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
    const { content, numQuestions = 5, difficulty = 'medium', model = 'mistral/mixtral-8x22b' } = req.body;

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
        temperature: 0.8,
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
