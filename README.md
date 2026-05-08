# Community Copilot AI 🚀

AI-powered multi-agent workflow assistant that helps MSMEs, startups, and local entrepreneurs discover and navigate government funding opportunities in India.

## Features

- **Scheme Discovery** — AI searches 15+ government funding schemes
-  **Eligibility Interview** — Smart follow-up questions to determine eligibility
-  **Eligibility Validation** — Transparent reasons for eligibility status
-  **AI Simplification** — Complex government language → simple English
-  **Document Checklist** — Personalized required documents with alerts
-  **Action Roadmap** — Step-by-step application plan with timelines
-  **Real-time Agent Visualization** — Watch 7 AI agents collaborate live

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + Vite + TailwindCSS v4 + Framer Motion |
| Backend | Node.js + Express |
| AI | Google Gemini 2.5 Flash |
| Real-time | Server-Sent Events (SSE) |
| State | Zustand |

## Quick Start

### Backend
```bash
cd server
npm install
cp .env.example .env  # Add your GEMINI_API_KEY
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173

## AI Agent Architecture

```
User Input → Intent Agent → Research Agent → Interview Agent
                                                    ↓
Dashboard ← Roadmap Agent ← Document Agent ← Validation Agent ← Simplification Agent
```

## Team

Built with love for Google AI Hackathon 2025

## License

MIT
