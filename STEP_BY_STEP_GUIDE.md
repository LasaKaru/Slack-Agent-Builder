# 🧑‍🏫 Step-by-Step Guide: Running Your Slack Agent

Hello! I have designed this app so that **you do not need to configure complex AI tools (like LangGraph or Qwen API)** just to test it. I built a seamless "simulation mode" right into the code so it works out-of-the-box. 

The **ONLY** thing you need to do is connect your Slack Workspace to the code. 

Follow this tutorial step-by-step, exactly as written, and you'll have it running in 5 minutes!

---

## Step 1: Create the Slack App
1. Go to [https://api.slack.com/apps](https://api.slack.com/apps) and sign in.
2. Click the green **Create New App** button.
3. Select **"From scratch"**.
4. Name your app (e.g., *Chargeback Autopilot*) and select your free test workspace from the dropdown. Click **Create App**.

---

## Step 2: Get the App-Level Token (Socket Mode)
Since we are running this on your local computer, we need "Socket Mode" so Slack can securely talk to your local code.
1. On the left sidebar, click **Socket Mode**.
2. Toggle **Enable Socket Mode** to **ON**.
3. A popup will ask you to generate a token. Name it `socket-token` and click generate.
4. Copy the token that starts with `xapp-`.
5. Open the `slack-app/.env` file in your code editor. Paste this token next to `SLACK_APP_TOKEN=`.

---

## Step 3: Turn on Interactivity (For Buttons & Modals)
We added "Pro" features like clicking the "Approve" button and opening editing Modals. We must tell Slack to allow this.
1. On the left sidebar, click **Interactivity & Shortcuts**.
2. Toggle **Interactivity** to **ON**. 
*(Note: Because you have Socket Mode enabled, you do not need to enter a Request URL! Just turn it on).*
3. Click **Save Changes** at the bottom.

---

## Step 4: Turn on Event Subscriptions (For Mentions, Home Tab & Unfurling)
We need to tell Slack to notify your code when someone mentions the bot, opens its Home tab, or shares a Stripe link.
1. On the left sidebar, click **Event Subscriptions**.
2. Toggle **Enable Events** to **ON**.
3. Scroll down to **Subscribe to bot events**. Click **Add Bot User Event**.
4. Add these three specific events:
   - `app_mention` (Allows the bot to hear when you tag it)
   - `app_home_opened` (Allows the bot to show the dashboard)
   - `link_shared` (Allows the bot to beautifully unfurl links into actionable cards)
5. Scroll further down to **App Unfurl Domains**. Click **Add Domain** and type: `stripe.com`.
6. Click **Save Changes** at the bottom.

---

## Step 5: Add Permissions (Scopes) & Install
We need to give the bot permission to write messages and read links.
1. On the left sidebar, click **OAuth & Permissions**.
2. Scroll down to the **Scopes** -> **Bot Token Scopes** section.
3. You should already see `app_mentions:read`. Click **Add an OAuth Scope** and add:
   - `chat:write` (Allows the bot to send messages)
   - `links:read` (Allows the bot to read Stripe links for unfurling)
4. Scroll back up to the top of the **OAuth & Permissions** page and click the green **Install to Workspace** button.
5. Click **Allow**.
6. You will be brought back to the page. Copy the **Bot User OAuth Token** (starts with `xoxb-`).
7. Open the `slack-app/.env` file in your code editor. Paste this token next to `SLACK_BOT_TOKEN=`.

---

## Step 6: Get the Signing Secret
1. On the left sidebar, click **Basic Information**.
2. Scroll down to **App Credentials**.
3. Click "Show" next to **Signing Secret** and copy it.
4. Open the `slack-app/.env` file in your code editor. Paste this token next to `SLACK_SIGNING_SECRET=`.

---

## 🎉 Step 7: Run the App!
You are completely done with configuration. Your `.env` file should now have all 3 keys.

1. Open your computer's terminal.
2. Navigate into the `slack-app` folder:
   ```bash
   cd "d:\helao2 projects\Chargeback Dispute\slack-app"
   ```
3. Run the application:
   ```bash
   npm start
   ```
4. You should see `⚡️ Advanced Slack Agent is running!` and `MCP Client connected` in the terminal.

### How to Test It in Slack:
1. Open your Slack Workspace.
2. Go to a channel (like `#general`) and invite the bot by typing `@Chargeback Autopilot` and pressing Enter. Slack will ask if you want to invite them; click Yes.
3. Click on the Bot's name in the sidebar to view the **App Home Dashboard**.
4. In a channel, type `@Chargeback Autopilot analyze ord_8832` to watch the AI gather evidence, draft the letter, and present the editing modal!
