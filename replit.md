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

### October 4, 2025 - Initial Import & Setup
- Imported project from GitHub (Lovable.dev export)
- Installed dependencies using npm (bun timed out)
- Configured Vite for Replit environment (already had correct config)
- Set up workflow to run dev server on port 5000
- Configured deployment settings for autoscale
- Verified app runs correctly in Replit

## User Preferences
**To be updated as preferences are expressed**

## Future Development Plans
User has requested:
- GitHub workflow setup for CI/CD automation
- Vercel deployment configuration
- Futuristic UI/UX with glassmorphism design
- PWA features
- OpenRouter API integration for AI features
- Dark/light mode toggle
- Responsive mobile-first design with touch gestures

## Notes
- The app currently shows "EduVoice AI" branding
- Uses Lovable tagger in development mode
- Some React Router v7 future flag warnings (non-critical)
- Dependencies are managed through npm (not bun)
