import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DEFAULT_FEATURE_MODELS, REFERER } from './constants.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).send('OK');
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const hasKey = Boolean(process.env.OPENROUTER_API_KEY);

  return res.status(200).json({
    ok: true,
    hasOpenRouterKey: hasKey,
    referer: REFERER,
    defaults: DEFAULT_FEATURE_MODELS,
    runtime: {
      node: process.version,
      vercelUrl: process.env.VERCEL_URL || null,
      siteUrl: process.env.SITE_URL || null,
    },
  });
}
