export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface VisionRequest {
  image: string;
  prompt: string;
  model?: string;
}

export interface QuizRequest {
  content: string;
  numQuestions?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizResponse {
  questions: QuizQuestion[];
}

export const AI_MODELS = {
  chat: {
    gpt4: 'openai/gpt-4-turbo',
    claude: 'anthropic/claude-3-opus',
    gemini: 'google/gemini-1.5-pro-latest',
  },
  vision: {
    claudeVision: 'anthropic/claude-3-opus',
    geminiVision: 'google/gemini-1.5-pro-latest',
  },
  quiz: {
    gpt4: 'openai/gpt-4-turbo',
    mixtral: 'mistralai/mixtral-8x22b',
  },
} as const;
