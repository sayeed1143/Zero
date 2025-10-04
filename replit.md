# EduVoice AI - Project Documentation

## Overview
EduVoice AI is a talking visual learning platform built with React, TypeScript, Vite, and shadcn-ui components. It provides an AI-powered educational experience where students can upload PDFs, images, and videos to get instant mind maps, explanations, and personalized quizzes.

**Project Type:** Frontend Web Application  
**Framework:** Vite + React + TypeScript  
**UI Library:** shadcn-ui with Radix UI components  
**Styling:** Tailwind CSS  
**Date Imported:** October 4, 2025

## Project Architecture

### Tech Stack
- **Build Tool:** Vite 5.4.19
- **Framework:** React 18.3.1
- **Language:** TypeScript 5.8.3
- **UI Components:** shadcn-ui with Radix UI primitives
- **Styling:** Tailwind CSS 3.4.17 with animations
- **Routing:** React Router DOM 6.30.1
- **State Management:** TanStack React Query 5.83.0
- **Form Handling:** React Hook Form with Zod validation
- **Icons:** Lucide React
- **Charts:** Recharts

### Directory Structure
```
/src
  /components - Reusable UI components
    /ui - shadcn-ui component library
    /workspace - Workspace-specific components (Canvas, Chat, Nav)
  /pages - Page components (Index, Workspace, NotFound)
  /hooks - Custom React hooks
  /lib - Utility functions
  /assets - Images and static assets
/public - Static public assets
```

## Replit Configuration

### Development Server
- **Host:** 0.0.0.0 (required for Replit proxy)
- **Port:** 5000
- **Package Manager:** npm (bun install times out)
- **Dev Command:** `npm run dev`

### Vite Configuration
The vite.config.ts is properly configured for Replit:
- `host: "0.0.0.0"` - Binds to all interfaces
- `port: 5000` - Required port for Replit frontend
- `allowedHosts: true` - Critical for Replit's proxy/iframe setup
- `hmr.clientPort: 443` - Hot module replacement through Replit proxy

### Deployment
- **Target:** Autoscale (stateless frontend)
- **Build:** `npm run build` (creates production bundle)
- **Preview:** Vite preview server on port 5000

## Recent Changes

### October 4, 2025 - Initial Import & Setup ✅
- Imported project from GitHub (Lovable.dev export)
- Installed dependencies using npm (381 packages installed successfully)
- Verified Vite configuration for Replit environment (already properly configured)
- Workflow "Start application" running successfully on port 5000
- Configured deployment settings for autoscale with build and preview commands
- Verified application loads correctly with EduVoice AI landing page displaying

### October 4, 2025 - OpenRouter AI Integration ✅
- **Created Vercel Serverless API Functions**:
  - `/api/chat` - Chat and explanations (GPT-4 Turbo, Claude 3 Opus, Gemini 1.5 Pro)
  - `/api/vision` - Image/video processing with Claude 3 Vision & Gemini Vision
  - `/api/quiz` - Quiz generation with GPT-4 Turbo and Mixtral
  - `/api/mindmap` - Mind map creation from AI responses

- **Integrated AI Service Layer**:
  - Client-side API service (`src/services/ai.ts`)
  - Type definitions for AI requests/responses (`src/types/ai.ts`)
  - Secure environment variable handling (OPENROUTER_API_KEY server-side only)

- **Enhanced Workspace Features**:
  - Real-time AI chat with conversation history
  - Image upload and AI vision analysis
  - Mind map generation that creates visual node graphs on canvas
  - Quiz generation with formatted questions and answers
  - Quick command buttons (Summarize, Explain, Mind Map, Quiz)
  - Processing states and error handling with toast notifications

- **Canvas Improvements**:
  - Proper node lifecycle management (manual vs AI-generated nodes)
  - Connection normalization for rendering links between nodes
  - File upload integration with vision processing
  - Preserves user-created nodes while updating AI nodes

- **Branding & Assets**:
  - Created professional EduVoice AI logo (SVG with brain/network design)
  - Updated favicon with new logo
  - Updated navigation with logo image
  - Updated page metadata and Open Graph tags

- **Deployment Configuration**:
  - `vercel.json` with API routing and CORS headers
  - `.env.example` with environment variable template
  - `DEPLOYMENT.md` with complete deployment guide
  - Configured for Vercel autoscale deployment

## AI Models Integrated

### Chat & Explanations
- GPT-4 Turbo (`openai/gpt-4-turbo`)
- Claude 3 Opus (`anthropic/claude-3-opus`)
- Gemini 1.5 Pro (`google/gemini-1.5-pro-latest`)

### Vision Processing
- Claude 3 Opus (`anthropic/claude-3-opus`) - Image analysis
- Gemini 1.5 Pro (`google/gemini-1.5-pro-latest`) - Alternative vision model

### Quiz Generation
- GPT-4 Turbo (`openai/gpt-4-turbo`) - Default quiz generator
- Mixtral 8x22B (`mistralai/mixtral-8x22b`) - Alternative for logic-heavy quizzes

## Deployment Instructions

### Vercel Deployment
1. Push code to GitHub repository
2. Import repository to Vercel
3. Add environment variable: `OPENROUTER_API_KEY` (get from https://openrouter.ai/keys)
4. Deploy

The app will work without the API key in Replit (shows error messages), but requires the key in Vercel for AI features to function.

## Future Enhancements
- Voice input (STT) and output (TTS) integration
- Enhanced quiz UI with interactive answer validation
- PDF text extraction for mind maps
- Video analysis capabilities
- Real-time collaboration features
- PWA with offline support

## Notes
- API key is kept secure on server-side (Vercel functions)
- Development mode works without API key (shows graceful errors)
- Dependencies managed through npm (not bun)
- React Router v7 future flag warnings (non-critical)
