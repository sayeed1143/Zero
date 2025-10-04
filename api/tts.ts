import type { VercelRequest, VercelResponse } from "@vercel/node";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "2mb",
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "OpenRouter API key not configured",
      message: "Please add OPENROUTER_API_KEY to your environment variables",
    });
  }

  try {
    const {
      text,
      voice = "alloy",
      model = "openai/tts-1",
      format = "mp3",
    }: { text?: string; voice?: string; model?: string; format?: "mp3" | "wav" | "ogg" } = req.body ?? {};

    if (!text) {
      return res.status(400).json({ error: "Invalid request: text is required" });
    }

    const referer = req.headers.origin || process.env.VERCEL_URL || "http://localhost:5173";

    const response = await fetch("https://openrouter.ai/api/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": referer,
        "X-Title": "EduVoice AI",
      },
      body: JSON.stringify({
        model,
        input: text,
        voice,
        format,
      }),
    });

    if (!response.ok) {
      let errorBody: any = null;
      try {
        errorBody = await response.json();
      } catch (parseError) {
        errorBody = { message: "Failed to parse OpenRouter error response" };
      }
      return res.status(response.status).json({
        error: "OpenRouter TTS error",
        details: errorBody,
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    const mimeType = response.headers.get("content-type") || `audio/${format}`;
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    return res.status(200).json({
      audio: base64,
      mimeType,
      model,
      voice,
      format,
    });
  } catch (error: any) {
    console.error("TTS API error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}
