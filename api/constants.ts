export const DEFAULT_FEATURE_MODELS = {
  chat: 'google/gemini-2.5-flash-lite',
  explanations: 'x-ai/grok-4-fast',
  mindmap: 'x-ai/grok-4-fast',
  quiz: 'x-ai/grok-4-fast',
  vision: 'google/gemini-2.5-flash-lite',
  voiceResponse: 'elevenlabs/eleven_multilingual_v2',
  speechCapture: 'openai/whisper-1',
};

export const FALLBACK_TEXT_MODEL = 'google/gemini-2.0-flash-lite-001';
export const FALLBACK_VISION_MODEL = 'google/gemini-2.5-flash-lite';

export const REFERER = (() => {
  const vercelUrl = process.env.VERCEL_URL;
  const siteUrl = process.env.SITE_URL;
  if (siteUrl) return siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`;
  if (vercelUrl) return `https://${vercelUrl}`;
  return 'http://localhost:5173';
})();
