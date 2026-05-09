# 🐾 Corgi Memory — Your AI Cafe Companion

> Most AI forgets you the moment you close the tab. Corgi Memory doesn't — it's a cafe companion that remembers every visit, every drink, every conversation, and uses 1M+ tokens to find connections you forgot you made.

Built at the [AI Valley x Corgi Cafe Hackathon](https://thecorgi.cafe) — a 1M+ token hackathon at San Francisco's first 24/7 cafe.

---

## What is Corgi Memory?

Corgi Memory is a personal AI cafe companion embodied as a pixel art corgi. It lives at Corgi Cafe and does three things no other AI assistant does:

1. **Remembers everything** — every visit, every drink, every conversation, every mood. Not summaries. The full history.
2. **Reasons across your entire relationship** — using 1M+ token context windows, it reads your complete cafe history and finds cross-session patterns, forgotten tasks, and connections you didn't know existed.
3. **Pairs you with the perfect drink** — based on your mood, energy, work context, time of day, caffeine intake, and historical preferences.

Walk into the cafe. The corgi already knows you had an iced matcha last Tuesday, that you crash on coffee after 2pm, and that you still haven't followed up on that PR from three visits ago.

## How It Works

### The Three-Stage Pipeline

Every message goes through a "Single-Pass Parallel ReAct" architecture:

```
USER MESSAGE
     │
     ▼
┌─────────────┐
│   ASSESS    │  Rule-based intent classification (~0ms)
│   casual?   │  work? upload? drink? memory?
│   upload?   │
└──────┬──────┘
       │
       ├──────────────┬──────────────┐
       ▼              ▼              ▼
┌────────────┐ ┌────────────┐ ┌────────────┐
│  Memory    │ │  Energy    │ │  Context   │  Parallel tool
│  Retrieval │ │  Analysis  │ │  Surfacing │  execution (~50ms)
└─────┬──────┘ └─────┬──────┘ └─────┬──────┘
       │              │              │
       └──────────────┼──────────────┘
                      ▼
            ┌──────────────────┐
            │ CONTEXT ASSEMBLY │  Up to 1M tokens:
            │   system prompt  │  semantic memory + episodic
            │   + memory       │  history + tool outputs +
            │   + history      │  uploaded documents +
            │   + document     │  current conversation
            │   + conversation │
            └────────┬─────────┘
                     ▼
            ┌──────────────────┐
            │    SYNTHESIZE    │  Kimi 2.6 / Claude
            │  Cross-session   │  reasons across the
            │  reasoning       │  full context window
            └────────┬─────────┘
                     ▼
         ┌───────────┼───────────┐
         ▼           ▼           ▼
    ┌─────────┐ ┌─────────┐ ┌─────────┐
    │ Corgi   │ │ Drink   │ │ Memory  │
    │ Response│ │ Pairing │ │ Update  │
    └─────────┘ └─────────┘ └─────────┘
```

### Five-Layer Memory System

| Layer | What It Stores | Where |
|-------|---------------|-------|
| **Episodic** | Raw conversation logs from every visit | HydraDB |
| **Semantic** | Extracted facts, preferences, patterns | HydraDB |
| **Procedural** | Learned rules ("never suggest dairy") | HydraDB |
| **Prospective** | Things to surface next visit ("ask about the interview") | HydraDB |
| **Working** | Current session context | Context window only |

### Seven Agent Tools

| Tool | Purpose |
|------|---------|
| `retrieveSemanticMemory` | Get user's full profile and preferences |
| `analyzeAndCrossReference` | Cross-reference documents with visit history |
| `getEnergyContext` | Analyze caffeine intake, time patterns, crash prediction |
| `surfaceForgottenContext` | Find unresolved tasks and callback opportunities |
| `searchThineContext` | Pull structured context from external conversations |
| `evaluateDrinkFit` | Match drinks to mood, energy, and work context |
| `updateMemory` | Write new observations back to memory |

## Tech Stack

| Layer | Technology | Role |
|-------|-----------|------|
| **Frontend** | React + Vite + Tailwind | Pixel-art retro UI with PixiJS corgi |
| **Backend** | Node.js + Express | Three-stage agent pipeline |
| **Memory** | [HydraDB](https://hydradb.com) | Context layer for AI — stores all five memory layers |
| **Inference** | [Pipeshift](https://pipeshift.com) | Serves Kimi 2.6 with 1M+ token context windows |
| **Context** | [Thine](https://thine.com) | Personal AI for structured conversation context |
| **Deployment** | [Render](https://render.com) | Web Service + Static Site + Postgres |
| **Fallback LLM** | Anthropic Claude | Automatic failover if Pipeshift is unavailable |

## Features

- **Pixel Art Corgi** — 7 animated states (idle, listening, thinking, excited, serving, sleepy, reading) built with PixiJS
- **Cross-Session Memory** — references specific past visits unprompted ("you mentioned PR #42 two visits ago")
- **Context Sommelier** — upload a document and get a drink pairing based on its vibe + your energy patterns
- **Thinking Drawer** — see the agent's tools executing in real-time with a live token counter
- **Proactive Nudges** — the corgi surfaces forgotten tasks and unresolved items from past conversations
- **Drink Recommendations** — personalized to your caffeine history, mood patterns, and time of day
- **Mood Tracking** — emotional continuity across visits ("you've been stressed 4 visits in a row")
- **Three-Tier Storage Fallback** — HydraDB → Postgres → local JSON, automatic failover

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/MirandaCavalie/corgi-cafe.git
cd corgi-cafe

# Install backend dependencies
cd server
npm install
cp .env.example .env

# Install frontend dependencies
cd ../client
npm install
```

### Configuration

Edit `server/.env` with your API keys:

```env
# LLM — set at least one
PIPESHIFT_API_KEY=your-key
PIPESHIFT_BASE_URL=https://api.pipeshift.com/v1
PIPESHIFT_MODEL=moonshot-kimi-k2.6

# Fallback LLM (optional but recommended)
ANTHROPIC_API_KEY=your-key
ANTHROPIC_MODEL=claude-sonnet-4-20250514

# Memory — HydraDB (primary)
HYDRADB_API_URL=your-hydradb-url
HYDRADB_TENANT_ID=corgicafe

# Memory — Postgres (fallback, optional)
DATABASE_URL=your-postgres-connection-string
```

### Running Locally

```bash
# Terminal 1 — backend
cd server
node index.js
# 🐾 Corgi Memory server running on :3001

# Terminal 2 — frontend
cd client
npm run dev
# Open http://localhost:5174
```

### Deploying to Render

The project includes a `render.yaml` Blueprint that creates all three services:

1. Go to [dashboard.render.com](https://dashboard.render.com) → **New → Blueprint**
2. Connect the GitHub repo
3. Render creates: Postgres database + Web Service (API) + Static Site (frontend)
4. Add your API keys in the Web Service's Environment tab
5. Deploy

## Project Structure

```
corgi-cafe/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── PixelCorgi.jsx        # PixiJS animated corgi (7 states)
│   │   │   ├── CorgiSpeechBubble.jsx # Typewriter speech bubble
│   │   │   ├── ChatInterface.jsx     # Chat UI + message thread
│   │   │   ├── ContextCards.jsx      # Drink / Work / Memory cards
│   │   │   └── ThinkingDrawer.jsx    # Agent tool execution UI
│   │   ├── hooks/
│   │   │   ├── useCorgiState.js      # Corgi animation state machine
│   │   │   └── useMemory.js          # Memory data fetching
│   │   └── utils/
│   │       └── api.js                # API client
│   └── .env.production               # Production API URL
├── server/                     # Express backend
│   ├── services/
│   │   ├── pipeshift.js              # LLM client (Pipeshift + Anthropic fallback)
│   │   ├── hydradb.js                # HydraDB adapter (3-tier fallback)
│   │   ├── database.js               # Postgres connection
│   │   ├── tools.js                  # 7 agent tools
│   │   ├── classifier.js             # Intent classification
│   │   └── contextBuilder.js         # 1M token context assembly
│   ├── routes/
│   │   ├── chat.js                   # Three-stage agent pipeline
│   │   ├── upload.js                 # Document upload + analysis
│   │   └── memory.js                 # Memory CRUD
│   ├── prompts/
│   │   └── corgiPersona.js           # Corgi system prompt
│   ├── data/
│   │   └── memory.json               # Demo seed data (8 visits)
│   └── .env.example                  # Environment variable template
└── render.yaml                 # Render Blueprint (3 services)
```

## Demo

The app comes pre-seeded with 8 visits of demo data telling a coherent story — a user named Alex who goes from debugging NaN bugs to designing auth architecture to applying to AI research labs. The cross-session callbacks are real: the corgi references specific dates, past conversations, and unresolved tasks.

**Try these in order:**
1. `"hey rough morning"` — watch the corgi reference past visits and recommend a drink
2. Upload a technical document — watch the token counter climb as it cross-references with history
3. `"what did I have last time?"` — memory recall from past visits
4. Wait — the corgi proactively surfaces forgotten tasks

## Prize Tracks

This project targets:
- **Best Use of 1M+ Tokens** — full episodic history loaded into context, no RAG, no chunking
- **Best Agent Workflow** — three-stage pipeline with parallel tool execution
- **Best Use of Memory / Context** — five-layer memory architecture with cross-session reasoning
- **Most Creative Build** — a pixel art corgi that remembers your coffee soul

## Team
Dons,
Built at Corgi Cafe
