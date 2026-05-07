# ReviewForge X

ReviewForge X is an advanced and unique GitHub code review intelligence dashboard.
You provide a GitHub repository URL, and it generates a deep analysis profile with:

- Quantum Review Score (0-100)
- Risk Signals (ownership, volatility, collaboration, docs drift)
- Review DNA graph values
- Code Hotspot detection from recent commit file change patterns
- Strategic recommendations for engineering leads

The UI is designed with a GitHub-inspired black + dark green color system.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- GitHub REST API

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Optional GitHub Token

For higher API rate limits, add a `.env.local` file:

```bash
GITHUB_TOKEN=your_token_here
```

The app works without a token for light usage.

## Core Endpoints

- `POST /api/analyze`
  - Body: `{ "repoUrl": "https://github.com/owner/repo" }`
  - Response: review score, risks, DNA values, hotspots, recommendations
