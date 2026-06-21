# Carbon Coach — AI-Powered Carbon Footprint Awareness

[![Deploy with Vercel](https://vercel.com/button)](https://carbon-coach-three.vercel.app/)

> **Challenge Vertical:** Individual Carbon Awareness (Challenge 3)
> **Tech Stack:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Recharts + Framer Motion + Supabase + Gemini 1.5 Flash

---

## Problem Statement
Most existing carbon footprint tracking tools fail to drive lasting behavioral change because:
1. **Static Flat Calculations:** They show users a static flat number (e.g. "8.4 tons CO₂e") without context, leaving them overwhelmed and unsure what practical steps to take.
2. **One-Size-Fits-All Advice:** They output generic tips (e.g. "eat less meat, drive less") that don't reflect the user's actual lifestyle or target their highest emission sectors.
3. **Lack of Gamification:** There are no feedback loops, streaks, or levels to incentivize daily engagement or sustain motivation over time.

## Solution
**Carbon Coach** solves this problem by combining mathematical precision with **EcoMind**, a proactive, context-aware AI Coach powered by Gemini. Carbon Coach translates abstract numbers into a dynamic, gamified path toward a zero-carbon future:
* It analyzes user footprints on load and prioritizes actions with the single highest emission savings.
* It projects long-term cumulative savings over 30 years using the **Carbon Time Machine**.
* It rewards ecological stewardship through the **EcoScore** leveling system.

---

## Core Innovations

1. **Proactive AI Coach (EcoMind):** Powered by Gemini 1.5 Flash via a secure server-side API. EcoMind analyzes your carbon footprint on load and initiates the conversation with prioritized, category-focused advice. It outputs a dedicated decision trace detailing the estimated annual savings (kg CO₂) and explainable reasoning for every action.
2. **Carbon Time Machine:** Projects your carbon footprint 10, 20, and 30 years into the future. Displays "Current Path" vs. "Action Path" side by side, translating abstract carbon weight into visual equivalents like mature trees saved or gasoline car miles avoided.
3. **EcoScore Gamification:** Interactive leveling system (Seedling → Sprout → Guardian → Champion → Planet Hero) where users earn points, maintain streaks, and unlock milestones by completing assessments and checking off carbon-saving actions.
4. **Interactive Scenario Simulator:** Simulate "What if?" lifestyle shifts (switching to an EV, going vegan, adopting renewable energy) and see instant reduction impact in real-time with mathematical precision.
5. **Hybrid Input Assessment:** Input data naturally using human-like descriptions (parsed using intelligent regular expression parsing), or tweak precise values using high-fidelity sliders.
6. **Community Leaderboard:** Peer-to-peer competition that lets users see where they stand globally, driving collective accountability.

---

## AI Workflow
```text
      User Input (NLP / Sliders)
                  ↓
       Carbon Footprint Calculation
                  ↓
       Category Impact Analysis
                  ↓
        EcoScore Generation
                  ↓
     AI Recommendation Prioritization
                  ↓
     AI Reasoning & Decision Trace Output
                  ↓
      Future Carbon Time Projections
                  ↓
          Action Plan Adopted
```

---

## Architecture
```text
            Next.js (Frontend)
                  ↓
         API Routes (Backend)
            ↙            ↘
    Gemini AI (LLM)    Supabase (Database)
```

### Folder Structure
```text
carbon-coach/
├── app/
│   ├── page.tsx                    # Onboarding & Hybrid NLP Input
│   ├── auth/
│   │   ├── sign-in/page.tsx        # Email/password sign-in
│   │   └── sign-up/page.tsx        # Email/password registration
│   ├── dashboard/page.tsx          # Premium Grid Dashboard
│   ├── leaderboard/page.tsx        # Community Leaderboard
│   ├── layout.tsx                  # Root layout
│   └── api/
│       ├── chat/
│       │   └── route.ts            # Gemini AI streaming endpoint
│       └── footprint/
│           └── route.ts            # Footprint CRUD via Supabase
├── components/
│   ├── onboarding/
│   │   ├── NLPInput.tsx            # NLP textbox
│   │   ├── PreciseSliders.tsx      # Interactive sliders
│   │   └── PreviewSidebar.tsx      # Live score preview
│   ├── leaderboard/
│   │   ├── StatChips.tsx           # Stat summaries
│   │   ├── SortControls.tsx        # Leaderboard filter tab
│   │   └── LeaderboardTable.tsx    # Scrollable user standings
│   ├── dashboard/
│   │   ├── AICoach.tsx             # Gemini streaming chat widget
│   │   ├── CarbonTimeMachine.tsx   # Forward projection bars
│   │   ├── EcoScorePanel.tsx       # Streaks, levels, XP ring
│   │   ├── ScoreGauge.tsx          # Circular gauge
│   │   ├── BreakdownChart.tsx      # Recharts breakdown
│   │   ├── ScenarioSimulator.tsx   # What-if simulator
│   │   ├── ActionTracker.tsx       # checklist
│   │   └── LeaderboardPreview.tsx  # Top 3 preview
├── services/
│   ├── footprintService.ts         # Footprint DB service
│   ├── leaderboardService.ts       # Leaderboard DB service
│   └── authService.ts              # Client auth helper
├── config/
│   ├── carbon.ts                   # Emission coefficients
│   └── scoring.ts                  # Scoring coefficients
└── __tests__/                      # Jest unit tests
```

---

## Security
* **Environment Variable Protection:** Sensitive API keys (`GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are stored purely on the server and are never exposed to client-side bundles.
* **Server-Side AI Resolution:** AI recommendations and prompts are executed in Next.js Server Route Handlers. Client applications receive only clean JSON streams.
* **Secure Authentication:** Standard Supabase Auth SSR middleware handles session cookie verification and enforces server-side route protection.
* **Database Access Security:** Supabase Row-Level Security (RLS) is configured on all tables, ensuring users can only read or write their own footprint logs.

---

## Testing
We maintain 100% test suite reliability:
* **Automated Unit Tests:** 35+ Jest unit tests validate carbon footprint calculations, score level changes, and time-machine projections.
* **Build Verification:** Compiles to a production-ready bundle with zero TypeScript warnings or module failures.
* **Lint Verification:** ESLint passes with zero warnings or errors.

To run tests:
```bash
npm install
npm test
```

To build production bundle:
```bash
npm run build
```
