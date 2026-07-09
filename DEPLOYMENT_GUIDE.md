# 🚀 Production Deployment Guide (Vercel + Supabase)

## 1. Connect Multi-AI Engine (Free / Cheap LLMs)
To win a hackathon on a budget, I have replaced the strict Claude integration with **OpenRouter**, a Multi-AI router. This allows you to instantly swap between Qwen, Gemini, Claude, and free open-source models using a single API key!

1. Go to [OpenRouter.ai](https://openrouter.ai/) and sign up.
2. Generate an API Key (They have a huge selection of completely free models, so you do not need to add a credit card if you use models labeled "free").
3. Add it to your `slack-app/.env` file:
   ```env
   OPENROUTER_API_KEY=sk-or-v1-...
   ```
*By default, I set the code to use `qwen/qwen-2-72b-instruct` (an extremely powerful and cheap model), but you can swap it to `meta-llama/llama-3-8b-instruct:free` in `index.js` for completely free generation!*

---

## 2. Connect Supabase (PostgreSQL Database)
I have added the `@supabase/supabase-js` client to the `mcp-server`. It will automatically swap from using static "mock" JSON strings to performing real database queries if it finds your Supabase keys.

### A. Set Up the Project
1. Create a free project on [Supabase](https://supabase.com).
2. Go to **Project Settings -> API** and copy the `Project URL` and `anon public` key.
3. Add them to your `slack-app/.env` file (the MCP Server will inherit these from the Node process):
   ```env
   SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiI...
   ```

### B. Create the Tables
In the Supabase SQL Editor, run this script to create the 3 tables the MCP server expects:
```sql
CREATE TABLE orders (
  order_id TEXT PRIMARY KEY,
  status TEXT,
  items JSONB
);

CREATE TABLE tracking (
  order_id TEXT PRIMARY KEY,
  courier TEXT,
  "trackingNumber" TEXT,
  "deliveryDate" TEXT,
  "signedBy" TEXT,
  "proofOfDelivery" TEXT
);

CREATE TABLE payment_risk (
  order_id TEXT PRIMARY KEY,
  "cvcCheck" TEXT,
  "avsCheck" TEXT,
  "ipAddress" TEXT,
  "riskScore" INTEGER,
  "authMethod" TEXT
);

-- Insert dummy data for your demo!
INSERT INTO orders (order_id, status, items) VALUES ('ord_8832', 'Delivered', '["Macbook Pro 14-inch"]');
```

---

## 3. Deploying the Slack Agent to Vercel
Vercel is designed for serverless functions, which are stateless. Slack's "Socket Mode" (which we are using for local development) is a stateful WebSocket connection. To deploy to Vercel, you have two options:

### Option A: The Easy Way (Keep Socket Mode, Use Render/Heroku)
If you just want it hosted live quickly without changing code:
1. Push your code to GitHub.
2. Go to [Render.com](https://render.com) or Heroku.
3. Create a new "Background Worker" or "Web Service" and point it to the `slack-app` folder.
4. Set the Start Command to `npm start`. Add your `.env` variables to the dashboard. 

### Option B: The Vercel Way (Switch to HTTP Endpoints)
If you *must* use Vercel, you need to change how the Slack app receives messages. 
1. In `slack-app/index.js`, remove `socketMode: true`.
2. Wrap your `App` inside the `ExpressReceiver` (provided by `@slack/bolt`).
3. Export the Express app as a serverless function handler in an `api/slack.js` file.
4. In your Slack API Dashboard (api.slack.com), go to **Event Subscriptions** and **Interactivity**, and paste your new Vercel URL (e.g., `https://my-app.vercel.app/api/slack/events`).

*Note: Vercel serverless functions timeout after 10-60 seconds. Because your agent performs complex MCP queries and LLM generation, you may hit Vercel timeout limits. **Option A (Render/Heroku)** is highly recommended for production Slack Agents!*
