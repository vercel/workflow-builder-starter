# Visual Workflow Builder Starter

A visual workflow builder for learning durable workflow patterns on Vercel.

## Quick Start

### Option 1: Deploy to Vercel (Recommended)

Click the deploy button in the course to deploy instantly. Database is provisioned automatically.

### Option 2: Local Development

After deploying, clone for local development:

```bash
# Clone your deployed repo
git clone <your-repo-url>
cd workflow-builder-starter

# Pull environment variables from Vercel
vercel env pull

# Setup and run
pnpm setup && pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## What You'll See

- **Visual workflow canvas** — Drag-and-drop nodes connected by edges
- **Pre-seeded workflow** — "Operations Bridge" scenario loads automatically
- **Execution logs** — Watch each step run with timing and output
- **Integration nodes** — Preview mode (no API keys needed for Stage 0)

## Run the Workflow

1. Open the app
2. See the seeded workflow on the canvas
3. Click **Run** to execute
4. Watch the logs show step-by-step execution

## Course Progression

This starter is **Stage 0**. The course guides you through:

| Stage | What You'll Build |
|-------|-------------------|
| 0 | Deploy + Run + See (this starter) |
| 1 | Trigger customization (webhooks, schedules) |
| 2 | Data persistence (Neon/Postgres) |
| 3 | Real integrations (Resend, etc.) |
| 4 | Observability and AI assist |

## Development Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production (runs migrations)
pnpm db:push      # Push schema to database
pnpm db:studio    # Open Drizzle Studio
```

## Learn More

- [Visual Workflow Builder Course](https://vercel.com/docs)
- [Vercel Workflow Documentation](https://useworkflow.dev/docs/introduction)
