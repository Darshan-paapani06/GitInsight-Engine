# ReviewForge X

<p align="center">
  <img src="./public/crazy-logo.png" alt="ReviewForge X Logo" width="140" />
</p>

<p align="center">
  <b>Advanced GitHub Code Review Intelligence Dashboard</b><br/>
  PR analysis, AI review comments, audit exports, trends, and multi-language code fixing.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/GitHub-OAuth-181717?style=for-the-badge&logo=github" alt="GitHub OAuth" />
</p>

---

## Why ReviewForge X

ReviewForge X converts GitHub repository and pull request activity into a clear, visual intelligence report.  
Instead of manually scanning every file, you get an instant quality/risk overview with hotspot-level review guidance.

---

## Feature Highlights

### 1) Repo + PR Direct Analysis
- Accepts both repository URLs and pull request URLs.
- Auto-detects analysis mode (`repo` or `pr`).
- Evaluates commit behavior, collaboration, ownership concentration, and docs drift.

### 2) Quantum Review Score
- Generates a score from `0-100`.
- Classifies result into `Elite`, `Healthy`, `Watch`, or `Critical`.

### 3) Risk Signals + Review DNA
- Risk signals:
  - Ownership Concentration
  - Volatility Pressure
  - Collaboration Fragility
  - Documentation Drift
- Review DNA categories:
  - Complexity
  - Resilience
  - Collaboration
  - Documentation

### 4) Hotspot File Intelligence
- Detects high-risk files from change patterns.
- Ranks hotspots by risk index.
- Produces AI-assisted review comments per hotspot:
  - severity
  - rationale
  - actionable review notes

### 5) GitHub OAuth + Private Repo Support
- Sign in with GitHub using OAuth.
- Uses session token for private repo and private PR access.

### 6) Downloadable Audit Reports
- Export each run as:
  - PDF
  - JSON
- Includes score, signals, insights, hotspots, and recommendations.

### 7) Team Leaderboard + Trends
- Tracks code-health trends over saved analysis runs.
- Shows average score and trend delta per team key.

### 8) Multi-Language "Fix Pasted Code"
- Supported languages:
  - TypeScript
  - JavaScript
  - Python
  - C
  - C++
  - C#
  - Ruby
  - SQL
  - MySQL
  - PostgreSQL
- TS/JS includes local diagnostics.
- LLM-powered fixing works with provider keys.

### 9) Multi-Provider LLM Support
- OpenRouter and OpenAI support.
- Auto-routing for OpenRouter-style keys (`sk-or-v1-...`).
- Graceful fallback with clear messages when quota/key is missing.

### 10) Branded Animated UI
- GitHub-inspired dark neon theme.
- Glass cards, glowing accents, animated logo presentation.

---

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- NextAuth (GitHub OAuth)
- GitHub REST API
- PDFKit (PDF report generation)
- OpenAI/OpenRouter Chat Completions API

---

## API Endpoints

### `POST /api/analyze`
Analyze repo or PR.

**Body**
```json
{
  "inputUrl": "https://github.com/owner/repo OR https://github.com/owner/repo/pull/123"
}
```

### `POST /api/fix-code`
Fix pasted code with diagnostics + LLM assistance.

**Body**
```json
{
  "code": "your code here",
  "language": "typescript"
}
```

### `GET /api/reports/export?analysisId=<id>&format=pdf|json`
Download saved report.

### `GET /api/leaderboard`
Get team leaderboard and trend data.

### `GET/POST /api/auth/[...nextauth]`
GitHub OAuth auth handlers.

---

## Local Setup

```bash
npm install
npm run dev
```

Open: `http://localhost:3000`

---

## Environment Variables

Create `.env.local` in project root:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXTAUTH_SECRET=your_random_secret

# Optional: direct GitHub token for API limits
GITHUB_TOKEN=your_github_token

# LLM Provider (recommended: OpenRouter)
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_APP_NAME=ReviewForge X

# Optional OpenAI fallback
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o-mini
```

---

## Project Structure (Important Paths)

- `app/page.tsx` - main dashboard UI
- `app/leaderboard/page.tsx` - trend leaderboard UI
- `app/api/analyze/route.ts` - repo/PR analysis pipeline
- `app/api/fix-code/route.ts` - pasted code fixer API
- `app/api/reports/export/route.ts` - PDF/JSON export API
- `app/api/leaderboard/route.ts` - leaderboard API
- `app/api/auth/[...nextauth]/route.ts` - OAuth handler

---

## Roadmap Ideas

- Inline diff-level comment generation per PR file chunk
- Team/org-level dashboards with richer ownership maps
- CI integration for automatic PR gate checks
- Cached analytics for large repositories

---

## Author

**Darshan Paapni**

