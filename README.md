# 🌍 Carbon Coach — AI-Powered Carbon Footprint Awareness

[![Deploy with Vercel](https://vercel.com/button)](https://carbon-coach-three.vercel.app/) 
*(Replace with your live deployment URL if different)*

> **Challenge Vertical:** Individual Carbon Awareness (Challenge 3)  
> **Submission Repository:** [github.com/athmabhiram1/carbon-coach](https://github.com/athmabhiram1/carbon-coach)  
> **Tech Stack:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Recharts + Framer Motion + Supabase + Gemini 1.5 Flash

---

## 🚀 Overview

**Carbon Coach** is a smart, dynamic carbon footprint assistant that goes beyond simple calculators. Most carbon tracking tools show you a flat number. Carbon Coach shows you a future you can actively choose—and gamifies the path to get there.

By combining pure mathematical calculations with a proactive AI Coach (**EcoMind**), scenario simulations, a **Carbon Time Machine™**, and an **Anonymous Leaderboard** backed by a Supabase serverless database, Carbon Coach is built to drive real behavioral change.

---

## 💡 Innovation Features (Our Competitive Edge)

1. **Proactive AI Coach (EcoMind):** Powered by Gemini 1.5 Flash via a secure server-side API. It analyzes the user's carbon footprint on load and proactively starts the chat with highly personalized advice and the highest-impact action first.
2. **Carbon Time Machine™:** Projects the user's carbon footprint 1, 5, and 10 years into the future. It displays "Current Path" vs. "Action Path" side by side, translating abstract carbon weight into visual equivalents like trees saved or car miles avoided.
3. **EcoScore™ Gamification:** Features an interactive leveling system (Seedling, Sprout, Guardian, Champion, Planet Hero) where users earn points, maintain streaks, and unlock milestones by completing footprint assessments and checking off carbon-saving actions.
4. **Anonymous Leaderboard:** Stored persistently on Supabase. Users can see where they rank compared to the community by their EcoScore without needing to create an account, protecting privacy while driving social engagement.
5. **Interactive Scenario Simulator:** Allows users to simulate "What if?" lifestyle shifts (e.g., switching to an EV, going vegan, or adopting renewable energy) and see the instant reduction impact in real-time.
6. **Hybrid Input Calculator:** Let users input their data naturally using human-like descriptions (e.g., *"I drive 30 miles daily, eat meat 3x a week, fly twice a year..."*) parsed with intelligent regex, or tweak it precisely using high-fidelity sliders.
7. **Impact Card Generator:** Dynamically renders a beautiful, downloadable PNG of the user's carbon footprint, EcoScore level, and community rank using `html2canvas` for easy sharing on social media.

---

## 🛠️ Approach & Logic

### 1. Calculation Logic
All calculations run on the client as side-effect-free pure functions (`lib/carbonCalculator.ts`), ensuring sub-millisecond updates as users adjust sliders. The formulas use official EPA and US Energy Information Administration (EIA) emission factors:
- **Transportation:** Car travel (gasoline) emissions are computed at `0.251 kg CO2/km` (EPA average). Public transport averages `0.089 kg CO2/km`. Flights are computed at `255 kg CO2/hour` of travel.
- **Dietary:** Annual diet footprints are baseline-mapped: Vegan (`1,500 kg/year`), Vegetarian (`1,700 kg/year`), Omnivore (`2,500 kg/year`), Heavy Meat-eater (`3,300 kg/year`).
- **Energy:** Electricity emissions are calculated using the US grid average of `0.42 kg CO2/kWh`. Natural gas emits `5.3 kg CO2/therm`.
- **Shopping:** General logistics and packaging are estimated at `3.5 kg CO2/order`.
- **National Baseline:** Compared against the US national average of `16,000 kg/year` per capita.

### 2. Time Projections
The projection engine (`lib/timeMachine.ts`) calculates cumulative emissions over 1, 5, and 10 years. It models the cumulative impact of user-selected actions over time using the carbon absorption capability of a mature tree (`22 kg/year` absorption) as a benchmark.

### 3. Persisted Offline-First Database Layer
A Supabase client-server integration tracks user actions and leaderboard stats anonymously:
- On first visit, a cryptographically secure UUID (`anonymous_id`) is generated and stored in the user's `localStorage`.
- All footprint modifications, checked actions, and EcoScores are synchronized to a Supabase PostgreSQL instance.
- The leaderboard pulls the top 50 users based on their gamified `eco_score`.

---

## 🗄️ Database Schema

The database relies on a flat `footprints` table optimized for fast queries:

```sql
CREATE TABLE footprints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  anonymous_id UUID NOT NULL UNIQUE,
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

-- Index for fast ranking updates
CREATE INDEX idx_footprints_eco_score ON footprints(eco_score DESC);
CREATE INDEX idx_footprints_created_at ON footprints(created_at DESC);
```

---

## 🎯 Assumptions Made

1. **Emission Factors:** EPA and US averages are used as baseline figures. While local carbon intensities vary (e.g., regions with cleaner grids), these averages serve as a robust model for general climate awareness.
2. **Anonymous Sessions:** To maximize onboarding conversion, we assume users prefer immediate, frictionless participation over standard email/password registration. Local storage combined with UUID-based database rows provides persistence.
3. **AI Availability:** Proactive coaching (EcoMind) requires internet connectivity to communicate with Gemini. In offline mode, the dashboard gracefully falls back to static ecological tip carousels.
4. **Off-setting Equivalences:** Tree absorption is modeled at a constant `22 kg CO2/year` based on mature hardwood growth averages.

---

## 📁 Project Structure

```
carbon-coach/
├── app/
│   ├── page.tsx                      # Dynamic Onboarding & Hybrid NLP Input
│   ├── dashboard/
│   │   └── page.tsx                  # Premium Grid Dashboard
│   ├── leaderboard/
│   │   └── page.tsx                  # Public Community Leaderboard
│   ├── layout.tsx                    # Root layout with providers
│   └── api/
│       ├── chat/
│       │   └── route.ts              # Gemini AI Streaming API with Rate Limiter
│       └── footprint/
│           └── route.ts              # Footprint save/retrieve via Supabase
├── components/
│   ├── onboarding/
│   │   ├── HeroCounter.tsx           # Animated landing page counter
│   │   ├── PersonaSelector.tsx       # Framer Motion persona cards
│   │   └── InputForm.tsx             # Precise sliders + live preview
│   ├── dashboard/
│   │   ├── ScoreGauge.tsx            # Animated circular SVG gauge
│   │   ├── BreakdownChart.tsx        # Recharts emission breakdown
│   │   ├── AICoach.tsx               # Gemini streaming chat widget
│   │   ├── CarbonTimeMachine.tsx     # Year-by-year forward projection bars
│   │   ├── EcoScorePanel.tsx         # Streaks, levels, and XP ring
│   │   └── ImpactCard.tsx            # html2canvas PNG exporter
│   └── ui/                           # High-end bespoke shadcn components
├── lib/
│   ├── carbonCalculator.ts           # Pure calculator mathematics
│   ├── ecoScore.ts                   # Gamification metrics & XP levels
│   └── supabase/
│       ├── client.ts                 # Supabase browser client
│       └── server.ts                 # Supabase server client (API routes)
└── __tests__/                        # Jest tests validating logic & engines
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- Supabase Project
- Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/athmabhiram1/carbon-coach.git
   cd carbon-coach
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run local dev server:**
   ```bash
   npm run dev
   ```

5. **Execute Unit Tests:**
   ```bash
   npm test
   ```

---

## 🏆 Challenge Requirements Adherence

- **Repository Size:** Under 3 MB (exceeds the < 10 MB strict rule).
- **Branch Management:** Strictly single-branch repository (`main`).
- **Privacy & Security:** No Personally Identifiable Information (PII) collected. Secure server-side execution of all AI prompts and database credentials.
- **Accessibility:** Fully structured with keyboard navigability, visible focus rings, and proper ARIA labels (WCAG AA level compliance).
