export const DEFAULT_FEATURE_MODELS = {
  chat: 'openrouter/gpt-4-turbo',
  explanations: 'openrouter/gpt-4-turbo',
  mindmap: 'anthropic/claude-3-opus',
  quiz: 'openrouter/gpt-4-turbo',
  vision: 'openai/gpt-4o-mini',
  voiceResponse: 'elevenlabs/eleven_multilingual_v2',
  speechCapture: 'openai/whisper-1',
};

export const FALLBACK_TEXT_MODEL = 'openai/gpt-4o-mini';
export const FALLBACK_VISION_MODEL = 'openai/gpt-4o-mini';

export const REFERER = (() => {
  const vercelUrl = process.env.VERCEL_URL;
  const siteUrl = process.env.SITE_URL;
  if (siteUrl) return siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`;
  if (vercelUrl) return `https://${vercelUrl}`;
  return 'http://localhost:5173';
})();
