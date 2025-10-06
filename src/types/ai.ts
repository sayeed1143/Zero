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
      id: 'openrouter/gpt-4-turbo',
      label: 'GPT-4 Turbo',
      provider: 'OpenAI via OpenRouter',
      via: 'openrouter',
      useCases: ['chat', 'explanations', 'teaching'],
      capabilities: ['text'],
      priceNote: '$0.003–$0.01 per 1K tokens',
      documentationUrl: 'https://openrouter.ai/models/openrouter/gpt-4-turbo',
    },
    {
      id: 'anthropic/claude-3-opus',
      label: 'Claude 3 Opus',
      provider: 'Anthropic via OpenRouter',
      via: 'openrouter',
      useCases: ['deep reasoning', 'complex explanations'],
      capabilities: ['text'],
      priceNote: '$0.01 per 1K tokens (approx.)',
      documentationUrl: 'https://openrouter.ai/models/anthropic/claude-3-opus',
    },
    {
      id: 'google/gemini-1.5-pro-latest',
      label: 'Gemini 1.5 Pro',
      provider: 'Google via OpenRouter',
      via: 'openrouter',
      useCases: ['chat', 'analysis', 'code review'],
      capabilities: ['text', 'code'],
      priceNote: '$0.01 per 1K tokens (approx.)',
      documentationUrl: 'https://openrouter.ai/models/google/gemini-1.5-pro-latest',
    },
  ],
  vision: [
    {
      id: 'openai/gpt-4o-mini',
      label: 'GPT-4o mini (Vision)',
      provider: 'OpenAI via OpenRouter',
      via: 'openrouter',
      useCases: ['image understanding', 'diagram interpretation'],
      capabilities: ['image'],
      documentationUrl: 'https://openrouter.ai/models/openai/gpt-4o-mini',
    },
    {
      id: 'anthropic/claude-3-opus:vision',
      label: 'Claude 3 Opus Vision',
      provider: 'Anthropic via OpenRouter',
      via: 'openrouter',
      useCases: ['image understanding', 'video key-frame analysis'],
      capabilities: ['image', 'video'],
      priceNote: '$0.02–$0.03 per 1K tokens',
      documentationUrl: 'https://openrouter.ai/models/anthropic/claude-3-opus:vision',
    },
    {
      id: 'google/gemini-1.5-pro-latest',
      label: 'Gemini 1.5 Pro Vision',
      provider: 'Google via OpenRouter',
      via: 'openrouter',
      useCases: ['image reasoning', 'diagram interpretation'],
      capabilities: ['image', 'video'],
      priceNote: '$0.01–$0.02 per 1K tokens',
      documentationUrl: 'https://openrouter.ai/models/google/gemini-1.5-pro-latest',
      notes: 'Enable vision capability via OpenRouter request payload.',
    },
  ],
  quiz: [
    {
      id: 'openrouter/gpt-4-turbo',
      label: 'GPT-4 Turbo',
      provider: 'OpenAI via OpenRouter',
      via: 'openrouter',
      useCases: ['quiz generation', 'logic puzzles'],
      capabilities: ['text'],
      priceNote: '$0.003–$0.01 per 1K tokens',
      documentationUrl: 'https://openrouter.ai/models/openrouter/gpt-4-turbo',
    },
    {
      id: 'mistral/mixtral-8x22b',
      label: 'Mixtral 8x22B',
      provider: 'Mistral via OpenRouter',
      via: 'openrouter',
      useCases: ['structured quizzes', 'reasoning tasks'],
      capabilities: ['text'],
      priceNote: '$0.005 per 1K tokens (approx.)',
      documentationUrl: 'https://openrouter.ai/models/mistral/mixtral-8x22b',
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
