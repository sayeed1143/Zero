import type { AIMessage, ChatRequest, ChatResponse, VisionRequest, QuizRequest, QuizResponse } from '@/types/ai';

const API_BASE = import.meta.env.PROD ? '' : '';

export class AIService {
  static async chat(messages: AIMessage[], model?: string): Promise<ChatResponse> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          model,
          temperature: 0.7,
          maxTokens: 2000,
        } as ChatRequest),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get AI response');
      }

      return await response.json();
    } catch (error: any) {
      console.error('AI chat error:', error);
      throw new Error(error.message || 'Failed to communicate with AI');
    }
  }

  static async processVision(image: string, prompt: string, model?: string): Promise<string> {
    try {
      const response = await fetch('/api/vision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image,
          prompt,
          model,
        } as VisionRequest),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to process image');
      }

      const data = await response.json();
      return data.content;
    } catch (error: any) {
      console.error('Vision processing error:', error);
      throw new Error(error.message || 'Failed to process image');
    }
  }

  static async generateQuiz(content: string, numQuestions = 5, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<QuizResponse> {
    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          numQuestions,
          difficulty,
        } as QuizRequest),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate quiz');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Quiz generation error:', error);
      throw new Error(error.message || 'Failed to generate quiz');
    }
  }

  static async generateMindMap(content: string, model?: string): Promise<any[]> {
    try {
      const response = await fetch('/api/mindmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          model,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate mind map');
      }

      const data = await response.json();
      return data.nodes;
    } catch (error: any) {
      console.error('Mind map generation error:', error);
      throw new Error(error.message || 'Failed to generate mind map');
    }
  }

  static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
