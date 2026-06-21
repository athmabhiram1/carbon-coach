# Carbon Coach — AI-Powered Carbon Footprint Awareness

[![Deploy with Vercel](https://vercel.com/button)](https://carbon-coach-three.vercel.app/)

> **Challenge Vertical:** Individual Carbon Awareness (Challenge 3)
> **Tech Stack:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Recharts + Framer Motion + Supabase + Gemini 1.5 Flash

---

## Overview

**Carbon Coach** is a smart, dynamic carbon footprint assistant that goes beyond simple calculators. Most carbon tracking tools show you a flat number. Carbon Coach shows you a future you can actively choose — and gamifies the path to get there.

By combining pure mathematical calculations with a proactive **AI Coach (EcoMind)**, interactive scenario simulations, a **Carbon Time Machine**, and a gamified **EcoScore** system, Carbon Coach is built to drive real behavioral change.

---

## Innovation Features

1. **Proactive AI Coach (EcoMind):** Powered by Gemini 1.5 Flash via a secure server-side API. The AI analyzes your carbon footprint on load and proactively starts the chat with highly personalized advice and the highest-impact action first. It uses context-aware reasoning — understanding your specific emissions profile (transportation, diet, energy, shopping) to generate relevant, actionable suggestions rather than generic tips.

2. **Carbon Time Machine:** Projects your carbon footprint 1, 5, and 10 years into the future. Displays "Current Path" vs. "Action Path" side by side, translating abstract carbon weight into visual equivalents like trees saved or car miles avoided. The projection engine uses cumulative emission modeling with dynamic what-if analysis.

3. **EcoScore Gamification:** Interactive leveling system (Seedling → Sprout → Guardian → Champion → Planet Hero) where users earn points, maintain streaks, and unlock milestones by completing footprint assessments and checking off carbon-saving actions.

4. **Hybrid Input Calculator:** Input your data naturally using human-like descriptions (e.g., *"I drive 30 miles daily, eat meat 3x a week, fly twice a year..."*) parsed with intelligent regex, or tweak precisely using high-fidelity sliders.

5. **Interactive Scenario Simulator:** Simulate "What if?" lifestyle shifts (switching to an EV, going vegan, adopting renewable energy) and see instant reduction impact in real-time with mathematical precision.

6. **Impact Card Generator:** Dynamically renders a downloadable PNG of your carbon footprint, EcoScore level, and community rank using `html2canvas` for easy sharing on social media.

---

## AI Reasoning & Context-Aware Decision Making

### EcoMind — The AI Coach

EcoMind is a context-aware AI agent that goes beyond static Q&A:

- **Proactive Analysis:** Upon loading your footprint data, EcoMind automatically analyzes your highest-emission categories and initiates the conversation with personalized, prioritized advice.
- **Context-Aware Responses:** The AI receives your full emission breakdown (transportation, diet, energy, shopping), persona type, and current EcoScore. It tailors its language, suggestions, and tone based on your specific profile — a "Busy Commuter" gets different advice than a "Homebody Techie."
- **Suggest Actions API:** A separate LLM-powered endpoint (`/api/chat/suggest-actions`) uses Gemini to generate contextually relevant carbon-saving actions. Each suggestion includes an estimated CO2 reduction impact, allowing users to prioritize based on potential effect.
- **Secure Execution:** All AI prompts are executed server-side via Next.js API routes. No API keys or user data are exposed to the client. A rate limiter prevents abuse.

### Calculation Engine

All calculations run as side-effect-free pure functions (`lib/carbonCalculator.ts`), enabling sub-millisecond updates as users adjust sliders. The formulas use official EPA and US Energy Information Administration (EIA) emission factors:

- **Transportation:** Car travel (gasoline) at `0.251 kg CO2/km` (EPA average). Public transport at `0.089 kg CO2/km`. Flights at `255 kg CO2/hour`.
- **Dietary:** Annual diet baselines: Vegan (`1,500 kg/year`), Vegetarian (`1,700 kg/year`), Omnivore (`2,500 kg/year`), Heavy Meat-eater (`3,300 kg/year`).
- **Energy:** Electricity at `0.42 kg CO2/kWh` (US grid average). Natural gas at `5.3 kg CO2/therm`.
- **Shopping:** Logistics and packaging estimated at `3.5 kg CO2/order`.
- **National Baseline:** Compared against US national average of `16,000 kg/year` per capita.

### Time Projections

The projection engine (`lib/timeMachine.ts`) calculates cumulative emissions over 1, 5, and 10 years. It models cumulative impact of user-selected actions over time using the carbon absorption capability of a mature tree (`22 kg/year` absorption) as a benchmark. Users can toggle between "Current Path" (no changes) and "Action Path" (with selected mitigations) to compare future outcomes.

### EcoScore Logic

The scoring engine (`lib/ecoScore.ts`) gamifies carbon reduction:
- Base score from footprint completeness and relative to national average
- Bonus points for streak days (consecutive daily check-ins)
- Bonus points for actions taken (each checked carbon-saving action)
- Level thresholds: Seedling (0), Sprout (500), Guardian (1500), Champion (3000), Planet Hero (5000)

---

## Architecture

```
carbon-coach/
├── app/
│   ├── page.tsx                    # Dynamic Onboarding & Hybrid NLP Input
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
│   │   ├── HeroCounter.tsx         # Animated landing counter
│   │   ├── PersonaSelector.tsx     # Persona selection cards
│   │   └── InputForm.tsx           # Precise sliders + NLP input
│   ├── dashboard/
│   │   ├── AICoach.tsx             # Gemini streaming chat widget
│   │   ├── CarbonTimeMachine.tsx   # Forward projection bars
│   │   ├── EcoScorePanel.tsx       # Streaks, levels, XP ring
│   │   ├── ScoreGauge.tsx          # Animated circular gauge
│   │   ├── BreakdownChart.tsx      # Recharts emission breakdown
│   │   ├── ScenarioSimulator.tsx   # What-if analysis
│   │   ├── ActionTracker.tsx       # Carbon-saving action checklist
│   │   ├── ImpactCard.tsx          # PNG export via html2canvas
│   │   └── LeaderboardPreview.tsx  # Top 3 community leaders
│   └── ui/                         # shadcn/ui components
├── lib/
│   ├── carbonCalculator.ts         # Pure calculator functions
│   ├── ecoScore.ts                 # Gamification metrics
│   ├── timeMachine.ts              # Future projection engine
│   ├── personas.ts                 # Persona definitions
│   ├── hooks/useAuth.ts            # Auth state management
│   └── supabase/
│       ├── client.ts               # Browser Supabase client
│       ├── server.ts               # Server Supabase client
│       ├── middleware.ts            # SSR session middleware
│       ├── types.ts                # Database type definitions
│       └── footprintService.ts     # Data access layer
└── __tests__/                      # Jest unit tests
```

---

## Database Schema

The application uses Supabase PostgreSQL with a `footprints` table:

```sql
CREATE TABLE footprints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  persona_id TEXT NOT NULL,
  total_kg_co2_per_year NUMERIC NOT NULL,
  breakdown JSONB NOT NULL,
  severity TEXT NOT NULL,
  top_category TEXT NOT NULL,
  comparison_to_national_avg NUMERIC NOT NULL,
  comparison_to_persona_baseline NUMERIC NOT NULL,
  actions_taken JSONB DEFAULT '[]',
  eco_score NUMERIC DEFAULT 0,
  eco_level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_footprints_eco_score ON footprints(eco_score DESC);
CREATE INDEX idx_footprints_created_at ON footprints(created_at DESC);
```

---

## Environment Variables

Create a `.env.local` file with:

```env
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_SUPABASE_URL=https://your_project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

---

## Running Locally

```bash
git clone https://github.com/athmabhiram1/carbon-coach.git
cd carbon-coach
npm install
npm run dev
```

### Testing

```bash
npm test          # Run 35+ unit tests
npm run build     # Production build
npm run lint      # ESLint check
```

---

## Evaluation Criteria Fulfillment

- **Repository Size:** Under 10 MB (strict rule). Current git pack: ~2.6 MB.
- **Branch Management:** Single `main` branch.
- **Security:** No PII stored. Server-side AI execution. Row-Level Security on Supabase. Service role key never exposed to client.
- **Accessibility:** Keyboard navigable, visible focus rings, ARIA labels (WCAG AA).
- **AI Reasoning:** EcoMind coach with context-aware, personalized advice via Gemini 1.5 Flash. Separate suggest-actions API with impact-grounded suggestions.
- **Personalization:** Persona-based onboarding (5 archetypes with custom baselines), personalized AI coach responses, customized action recommendations.
