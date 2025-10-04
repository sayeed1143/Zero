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

export type AIModelCategory = 'chat' | 'mindmap' | 'vision' | 'quiz' | 'tts' | 'stt' | 'explanations';

export type AIModelIntegration = 'openrouter' | 'external' | 'browser';

export interface AIModelOption {
  id: string;
  label: string;
  provider: string;
  slug: string;
  description: string;
  bestFor: string[];
  pricing: string;
  integration: AIModelIntegration;
}

export const AI_MODELS: Record<AIModelCategory, AIModelOption[]> = {
  chat: [
    {
      id: 'openrouter/gpt-4-turbo',
      label: 'GPT-4 Turbo',
      provider: 'OpenAI via OpenRouter',
      slug: 'openrouter/gpt-4-turbo',
      description: 'High-accuracy tutoring, explanations, and reasoning with fast responses.',
      bestFor: ['chat', 'explanations', 'logic'],
      pricing: '≈ $0.01 / 1K tokens',
      integration: 'openrouter',
    },
    {
      id: 'anthropic/claude-3-opus',
      label: 'Claude 3 Opus',
      provider: 'Anthropic via OpenRouter',
      slug: 'anthropic/claude-3-opus',
      description: 'Best-in-class reasoning depth for complex instruction and tutoring.',
      bestFor: ['chat', 'explanations', 'mindmap'],
      pricing: '≈ $0.015 / 1K tokens',
      integration: 'openrouter',
    },
    {
      id: 'google/gemini-1.5-pro-latest',
      label: 'Gemini 1.5 Pro',
      provider: 'Google via OpenRouter',
      slug: 'google/gemini-1.5-pro-latest',
      description: 'Long-context multi-modal tutor with strong code and reasoning support.',
      bestFor: ['chat', 'vision', 'analysis'],
      pricing: '≈ $0.0075 / 1K tokens',
      integration: 'openrouter',
    },
  ],
  mindmap: [
    {
      id: 'anthropic/claude-3-opus',
      label: 'Claude 3 Opus',
      provider: 'Anthropic via OpenRouter',
      slug: 'anthropic/claude-3-opus',
      description: 'Creates structured mind maps and knowledge graphs from dense content.',
      bestFor: ['mindmap', 'explanations', 'planning'],
      pricing: '≈ $0.015 / 1K tokens',
      integration: 'openrouter',
    },
    {
      id: 'google/gemini-1.5-pro-latest',
      label: 'Gemini 1.5 Pro',
      provider: 'Google via OpenRouter',
      slug: 'google/gemini-1.5-pro-latest',
      description: 'Excels at combining documents, images, and video frames into concept maps.',
      bestFor: ['mindmap', 'vision', 'analysis'],
      pricing: '≈ $0.01 / 1K tokens',
      integration: 'openrouter',
    },
  ],
  vision: [
    {
      id: 'anthropic/claude-3-opus:vision',
      label: 'Claude 3 Opus Vision',
      provider: 'Anthropic via OpenRouter',
      slug: 'anthropic/claude-3-opus:vision',
      description: 'Vision-enabled Claude for image, video, and diagram analysis with narration.',
      bestFor: ['vision', 'multimodal explanations'],
      pricing: '≈ $0.02 / 1K tokens',
      integration: 'openrouter',
    },
    {
      id: 'google/gemini-1.5-pro-latest',
      label: 'Gemini 1.5 Pro Vision',
      provider: 'Google via OpenRouter',
      slug: 'google/gemini-1.5-pro-latest',
      description: 'Processes images, PDFs, and video frames with strong reasoning.',
      bestFor: ['vision', 'analysis', 'ocr'],
      pricing: '≈ $0.01 / 1K tokens',
      integration: 'openrouter',
    },
  ],
  quiz: [
    {
      id: 'openrouter/gpt-4-turbo',
      label: 'GPT-4 Turbo',
      provider: 'OpenAI via OpenRouter',
      slug: 'openrouter/gpt-4-turbo',
      description: 'Creates nuanced formative assessments with thorough explanations.',
      bestFor: ['quiz', 'logic', 'explanations'],
      pricing: '≈ $0.01 / 1K tokens',
      integration: 'openrouter',
    },
    {
      id: 'mistral/mixtral-8x22b',
      label: 'Mixtral 8x22B',
      provider: 'Mistral via OpenRouter',
      slug: 'mistral/mixtral-8x22b',
      description: 'Efficient mixture-of-experts model for fast quiz and logic generation.',
      bestFor: ['quiz', 'logic', 'classification'],
      pricing: '≈ $0.003 / 1K tokens',
      integration: 'openrouter',
    },
  ],
  tts: [
    {
      id: 'openai/tts-1',
      label: 'OpenAI TTS-1',
      provider: 'OpenAI via OpenRouter',
      slug: 'openai/tts-1',
      description: 'Neural text-to-speech with streaming, multilingual voice output.',
      bestFor: ['tts', 'voice responses'],
      pricing: '$15 / 1M characters',
      integration: 'openrouter',
    },
    {
      id: 'external/elevenlabs',
      label: 'ElevenLabs Neural Voices',
      provider: 'ElevenLabs',
      slug: 'external/elevenlabs',
      description: 'External API for expressive, branded voices and fine-tuned speech.',
      bestFor: ['tts', 'brand voice'],
      pricing: 'See ElevenLabs pricing',
      integration: 'external',
    },
  ],
  stt: [
    {
      id: 'openai/whisper-1',
      label: 'Whisper Large V3',
      provider: 'OpenAI via OpenRouter',
      slug: 'openai/whisper-1',
      description: 'Robust multilingual speech-to-text with translation support.',
      bestFor: ['stt', 'transcription', 'translation'],
      pricing: '≈ $0.006 / minute',
      integration: 'openrouter',
    },
    {
      id: 'browser/speech-recognition',
      label: 'Browser Speech Recognition',
      provider: 'On-device',
      slug: 'browser/speech-recognition',
      description: 'Web Speech API fallback that stays on-device when available.',
      bestFor: ['stt', 'fallback'],
      pricing: 'Included',
      integration: 'browser',
    },
  ],
  explanations: [
    {
      id: 'anthropic/claude-3-opus',
      label: 'Claude 3 Opus',
      provider: 'Anthropic via OpenRouter',
      slug: 'anthropic/claude-3-opus',
      description: 'Detailed, step-by-step explanations with voice-ready formatting.',
      bestFor: ['explanations', 'chat'],
      pricing: '≈ $0.015 / 1K tokens',
      integration: 'openrouter',
    },
    {
      id: 'openrouter/gpt-4-turbo',
      label: 'GPT-4 Turbo',
      provider: 'OpenAI via OpenRouter',
      slug: 'openrouter/gpt-4-turbo',
      description: 'Balanced tutor for explanations, examples, and follow-up Q&A.',
      bestFor: ['explanations', 'chat'],
      pricing: '≈ $0.01 / 1K tokens',
      integration: 'openrouter',
    },
  ],
};

export const AI_MODEL_DEFAULTS = {
  chat: 'openrouter/gpt-4-turbo',
  explanations: 'anthropic/claude-3-opus',
  mindmap: 'anthropic/claude-3-opus',
  vision: 'anthropic/claude-3-opus:vision',
  quiz: 'mistral/mixtral-8x22b',
  tts: 'openai/tts-1',
  stt: 'openai/whisper-1',
} as const;

export interface SpeechToTextRequest {
  audio: string;
  mimeType: string;
  model?: string;
}

export interface SpeechToTextResponse {
  text: string;
  model: string;
}

export interface TextToSpeechRequest {
  text: string;
  voice?: string;
  model?: string;
  format?: 'mp3' | 'wav' | 'ogg';
}

export interface TextToSpeechResponse {
  audio: string;
  mimeType: string;
  voice: string;
  model: string;
  format: string;
}
