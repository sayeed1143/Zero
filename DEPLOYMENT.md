# Deployment Guide

## Environment Variables

### Required Environment Variables

Add the following environment variable to your Vercel project:

| Variable Name | Description | Where to Get It |
|--------------|-------------|-----------------|
| `OPENROUTER_API_KEY` | OpenRouter API key for AI features | https://openrouter.ai/keys |

> **Important:** If you plan to reference a Vercel secret (for example `@openrouter-api-key`), create it first with `vercel secrets add openrouter-api-key YOUR_KEY_VALUE`. Otherwise, enter the raw key value directly in the Environment Variables screen. Missing secrets will cause the build to fail before deployment.

### Optional Environment Variables

| Variable Name | Description |
|---------------|-------------|
| `ELEVENLABS_API_KEY` | Enables high-quality text-to-speech playback through ElevenLabs (external API). |

### Setting Up on Vercel

1. **Create OpenRouter Account**
   - Visit https://openrouter.ai/
   - Sign up, create an API key, and add credits
2. **Configure Environment Variables**
   - In Vercel dashboard go to **Settings → Environment Variables**
   - Add `OPENROUTER_API_KEY` (and `ELEVENLABS_API_KEY` if you will use ElevenLabs voices)
   - If using secrets, add them via the Vercel CLI *before* referencing them in the dashboard
3. **Deploy to Vercel**
   - Push your code to GitHub
   - Import the repository into Vercel and trigger a deployment
4. **Verify Deployment**
   - Open the deployed URL and visit `/workspace`
   - Send a chat prompt, generate a quiz, and upload an image to confirm API access

## AI Models Used (via OpenRouter)

### Chat & Explanations
- **GPT-4 Turbo** (`openrouter/gpt-4-turbo`)
- **Claude 3 Opus** (`anthropic/claude-3-opus`)
- **Gemini 1.5 Pro** (`google/gemini-1.5-pro-latest`)

### Vision / Image / Video
- **Claude 3 Opus Vision** (`anthropic/claude-3-opus:vision`)
- **Gemini 1.5 Pro Vision** (`google/gemini-1.5-pro-latest` with vision enabled)

### Quizzes & Logic
- **GPT-4 Turbo** (`openrouter/gpt-4-turbo`)
- **Mixtral 8x22B** (`mistral/mixtral-8x22b`)

### Text-to-Speech
- **ElevenLabs Multilingual v2** (`elevenlabs/eleven_multilingual_v2`, external API key required)
- **GPT-4o mini TTS** (`openai/gpt-4o-mini-tts` via OpenRouter; request access if not enabled)

### Speech-to-Text
- **Whisper v1** (`openai/whisper-1`)
- **Deepgram Nova-2 General** (`deepgram/nova-2-general`)

## API Endpoints

The application includes the following Vercel serverless functions:

- `/api/chat` — chat, explanations, and general assistance
- `/api/vision` — image and video analysis
- `/api/quiz` — adaptive quiz generation
- `/api/mindmap` — mind-map creation and visual structuring

## Cost Considerations

OpenRouter pricing varies by model:
- **Chat models:** ~\$0.003–\$0.01 per 1K tokens
- **Vision models:** ~\$0.01–\$0.03 per 1K tokens
- **Quiz/Mind map requests:** ~\$0.005–\$0.015 per generation
- **Audio (TTS/STT):** follow the provider’s rate card (ElevenLabs or OpenRouter audio endpoints)

Monitor usage from the OpenRouter dashboard and the ElevenLabs console if enabled.

## Local Development

```bash
# Install dependencies
npm install

# Start Vite + serverless endpoints locally
npm run dev
```

For full parity with Vercel functions you can also use the Vercel CLI:

```bash
npm i -g vercel
vercel dev
```

Set `OPENROUTER_API_KEY` (and optional audio keys) in a `.env.local` file before starting the dev server.

## Troubleshooting

### “OpenRouter API key not configured” error
- Ensure `OPENROUTER_API_KEY` is present in the current environment
- Redeploy after adding or updating the variable
- For Vercel secrets, confirm `vercel secrets ls` shows the referenced secret name

### Build fails with “Secret … does not exist”
- Create the secret using `vercel secrets add` or replace the reference with the raw key value
- Trigger a new deployment once the secret exists

### AI responses not working
- Verify your OpenRouter account has sufficient credits and the selected models are enabled
- Check Vercel function logs for the failing endpoint

### Images not processing or speech not working
- Confirm the uploaded file type/size is supported (≤5 MB for images)
- Ensure vision models are enabled for your key
- For TTS/STT, confirm the relevant provider key and model are configured
