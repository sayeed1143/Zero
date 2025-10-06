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
  model?: string;
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

type AIModelCategory = 'chat' | 'vision' | 'quiz' | 'tts' | 'stt';

export type AIModelFeature =
  | 'chat'
  | 'explanations'
  | 'mindmap'
  | 'quiz'
  | 'vision'
  | 'voiceResponse'
  | 'speechCapture';

export interface AIModelOption {
  id: string;
  label: string;
  provider: string;
  via: 'openrouter' | 'external';
  useCases: string[];
  capabilities: string[];
  priceNote?: string;
  documentationUrl?: string;
  notes?: string;
}

export const AI_MODELS: Record<AIModelCategory, AIModelOption[]> = {
  chat: [
    {
      id: 'google/gemini-2.5-flash-lite',
      label: 'Gemini 2.5 Flash Lite',
      provider: 'Google via OpenRouter',
      via: 'openrouter',
      useCases: ['chat', 'drafting', 'summarization'],
      capabilities: ['text'],
      priceNote: 'Optimized for speed and high-volume conversations.',
      documentationUrl: 'https://openrouter.ai/models/google/gemini-2.5-flash-lite',
    },
    {
      id: 'google/gemini-2.0-flash-lite-001',
      label: 'Gemini 2.0 Flash Lite 001',
      provider: 'Google via OpenRouter',
      via: 'openrouter',
      useCases: ['assistants', 'support workflows', 'chat'],
      capabilities: ['text'],
      priceNote: 'Low-latency, cost-effective operations.',
      documentationUrl: 'https://openrouter.ai/models/google/gemini-2.0-flash-lite-001',
    },
    {
      id: 'x-ai/grok-4-fast',
      label: 'Grok-4 Fast',
      provider: 'xAI via OpenRouter',
      via: 'openrouter',
      useCases: ['complex reasoning', 'coding', 'analysis'],
      capabilities: ['text', 'code'],
      priceNote: 'Premium reasoning performance.',
      documentationUrl: 'https://openrouter.ai/models/x-ai/grok-4-fast',
    },
    {
      id: 'google/gemini-2.0-flash-001',
      label: 'Gemini 2.0 Flash 001',
      provider: 'Google via OpenRouter',
      via: 'openrouter',
      useCases: ['creative writing', 'general content'],
      capabilities: ['text'],
      documentationUrl: 'https://openrouter.ai/models/google/gemini-2.0-flash-001',
    },
    {
      id: 'google/gemini-2.5-flash-lite-preview-09-2025',
      label: 'Gemini 2.5 Flash Lite (Preview 09-2025)',
      provider: 'Google via OpenRouter',
      via: 'openrouter',
      useCases: ['experimentation', 'feature testing'],
      capabilities: ['text'],
      notes: 'Latest preview build for early feature testing.',
      documentationUrl: 'https://openrouter.ai/models/google/gemini-2.5-flash-lite-preview-09-2025',
    },
  ],
  vision: [
    {
      id: 'google/gemini-2.5-flash-lite',
      label: 'Gemini 2.5 Flash Lite Vision',
      provider: 'Google via OpenRouter',
      via: 'openrouter',
      useCases: ['image understanding', 'multimodal chat'],
      capabilities: ['image', 'text'],
      priceNote: 'Fast multimodal responses optimized for production.',
      documentationUrl: 'https://openrouter.ai/models/google/gemini-2.5-flash-lite',
      notes: 'Supports multimodal prompts with images and text.',
    },
  ],
  quiz: [
    {
      id: 'x-ai/grok-4-fast',
      label: 'Grok-4 Fast',
      provider: 'xAI via OpenRouter',
      via: 'openrouter',
      useCases: ['quiz generation', 'logic puzzles', 'assessment authoring'],
      capabilities: ['text'],
      priceNote: 'Advanced reasoning tuned for structured content.',
      documentationUrl: 'https://openrouter.ai/models/x-ai/grok-4-fast',
    },
    {
      id: 'google/gemini-2.0-flash-001',
      label: 'Gemini 2.0 Flash 001',
      provider: 'Google via OpenRouter',
      via: 'openrouter',
      useCases: ['creative quizzes', 'adaptive learning content'],
      capabilities: ['text'],
      documentationUrl: 'https://openrouter.ai/models/google/gemini-2.0-flash-001',
    },
  ],
  tts: [
    {
      id: 'elevenlabs/eleven_multilingual_v2',
      label: 'ElevenLabs Multilingual v2',
      provider: 'ElevenLabs',
      via: 'external',
      useCases: ['voice responses', 'multilingual narration'],
      capabilities: ['text-to-speech'],
      documentationUrl: 'https://elevenlabs.io/docs/api-reference/text-to-speech',
      notes: 'Requires ElevenLabs API key configured separately from OpenRouter.',
    },
    {
      id: 'openai/gpt-4o-mini-tts',
      label: 'GPT-4o mini TTS',
      provider: 'OpenAI via OpenRouter',
      via: 'openrouter',
      useCases: ['conversational playback', 'expressive voices'],
      capabilities: ['text-to-speech'],
      documentationUrl: 'https://openrouter.ai/models/openai/gpt-4o-mini-tts',
      notes: 'Contact OpenRouter support if the endpoint is not yet enabled for your account.',
    },
  ],
  stt: [
    {
      id: 'openai/whisper-1',
      label: 'Whisper v1',
      provider: 'OpenAI via OpenRouter',
      via: 'openrouter',
      useCases: ['speech capture', 'transcription'],
      capabilities: ['speech-to-text'],
      documentationUrl: 'https://openrouter.ai/models/openai/whisper-1',
    },
    {
      id: 'deepgram/nova-2-general',
      label: 'Deepgram Nova-2 General',
      provider: 'Deepgram via OpenRouter',
      via: 'openrouter',
      useCases: ['real-time transcription', 'multilingual capture'],
      capabilities: ['speech-to-text'],
      documentationUrl: 'https://openrouter.ai/models/deepgram/nova-2-general',
    },
  ],
};

export const DEFAULT_FEATURE_MODELS: Record<AIModelFeature, string> = {
  chat: 'google/gemini-2.5-flash-lite',
  explanations: 'x-ai/grok-4-fast',
  mindmap: 'x-ai/grok-4-fast',
  quiz: 'x-ai/grok-4-fast',
  vision: 'google/gemini-2.5-flash-lite',
  voiceResponse: 'elevenlabs/eleven_multilingual_v2',
  speechCapture: 'openai/whisper-1',
};
