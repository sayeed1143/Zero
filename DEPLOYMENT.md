# EduVoice AI - Deployment Guide

## Environment Variables

### Required Environment Variables

Add the following environment variable to your Vercel project:

| Variable Name | Description | Where to Get It |
|--------------|-------------|-----------------|
| `OPENROUTER_API_KEY` | OpenRouter API key for AI features | https://openrouter.ai/keys |

### Setting Up on Vercel

1. **Create OpenRouter Account**
   - Visit https://openrouter.ai/
   - Sign up and create an account
   - Navigate to "Keys" and create a new API key
   - Add credits to your account

2. **Deploy to Vercel**
   - Push your code to GitHub
   - Import the repository to Vercel
   - In Vercel project settings, go to "Environment Variables"
   - Add `OPENROUTER_API_KEY` with your API key value
   - Deploy the project

3. **Verify Deployment**
   - Visit your deployed URL
   - Go to the Workspace page
   - Try the chat feature or upload an image
   - Check that AI responses are working

## AI Models Used

### Chat & Explanations
- **GPT-4 Turbo** (`openai/gpt-4-turbo`) - Best for detailed explanations
- **Claude 3 Opus** (`anthropic/claude-3-opus`) - Great for educational content
- **Gemini 1.5 Pro** (`google/gemini-1.5-pro-latest`) - Good for summaries

### Vision Processing
- **Claude 3 Opus** (`anthropic/claude-3-opus`) - Default for image analysis
- **Gemini 1.5 Pro** (`google/gemini-1.5-pro-latest`) - Alternative vision model

### Quiz Generation
- **GPT-4 Turbo** (`openai/gpt-4-turbo`) - Default for quiz creation
- **Mixtral 8x22B** (`mistralai/mixtral-8x22b`) - Alternative for logic-heavy quizzes

## API Endpoints

The application includes the following Vercel serverless functions:

- `/api/chat` - Chat and explanations
- `/api/vision` - Image and video processing
- `/api/quiz` - Quiz generation
- `/api/mindmap` - Mind map creation

## Cost Considerations

OpenRouter pricing varies by model:
- **Chat Models**: ~$0.003-$0.01 per 1K tokens
- **Vision Models**: ~$0.01-$0.03 per 1K tokens
- **Quiz/Mind Map**: ~$0.005-$0.015 per generation

Monitor your usage on the OpenRouter dashboard.

## Local Development

For local testing with Vercel functions:

```bash
# Install Vercel CLI
npm i -g vercel

# Run development server
vercel dev
```

This will run both the Vite dev server and Vercel serverless functions locally.

## Troubleshooting

### "OpenRouter API key not configured" error
- Ensure you've added the `OPENROUTER_API_KEY` environment variable in Vercel
- Redeploy your application after adding the variable

### AI responses not working
- Check your OpenRouter account has sufficient credits
- Verify the API key is correct in environment variables
- Check Vercel function logs for detailed error messages

### Images not processing
- Ensure images are in supported formats (JPG, PNG, WebP)
- Check that the image size is under 5MB
- Verify Vision models are enabled on your OpenRouter account
