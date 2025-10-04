import type { VercelRequest, VercelResponse } from "@vercel/node";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "20mb",
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
    const { audio, mimeType, model = "openai/whisper-1" } = req.body ?? {};

    if (!audio || !mimeType) {
      return res.status(400).json({ error: "Invalid request: audio and mimeType are required" });
    }

    const referer = req.headers.origin || process.env.VERCEL_URL || "http://localhost:5173";
    const audioBuffer = Buffer.from(audio, "base64");
    const fileExtension = mimeType.split("/")[1] || "webm";
    const blob = new Blob([audioBuffer], { type: mimeType });
    const formData = new FormData();

    formData.append("file", blob, `voice-input.${fileExtension}`);
    formData.append("model", model);
    formData.append("response_format", "json");

    const response = await fetch("https://openrouter.ai/api/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": referer,
        "X-Title": "EduVoice AI",
      },
      body: formData,
    });

    if (!response.ok) {
      let errorBody: any = null;
      try {
        errorBody = await response.json();
      } catch (parseError) {
        errorBody = { message: "Failed to parse OpenRouter error response" };
      }
      return res.status(response.status).json({
        error: "OpenRouter STT error",
        details: errorBody,
      });
    }

    const data = await response.json();
    const transcript = data.text || data.data?.[0]?.text || "";

    return res.status(200).json({
      text: transcript,
      model,
    });
  } catch (error: any) {
    console.error("STT API error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}
