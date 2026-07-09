# 🎬 Chargebackpilot: Final Hackathon Demo Script

**Goal:** ~3 Minutes. Read this naturally like you are having a conversation. 

### Pre-Flight Checklist (Before hitting record):
1. **Terminals:** Have both `npm run dev` and `npm start` running side-by-side.
2. **Browser:** Open `http://localhost:3001` (Dashboard) and `http://localhost:3001/login` (Login Page).
3. **Image:** Have your `Architecture_Diagram.png` or `.md` open in an image viewer or browser tab so you can quickly switch to it.
4. **Slack:** Have your Slack desktop app open in the background.

---

## 🕒 [0:00 - 0:45] Phase 1: The Intro & The Impact ("Agent for Good")
*Start screen recording. Show the `http://localhost:3001/login` page.*

**Speaker:** 
"Hi everyone, I'm Lasantha, and this is **Chargebackpilot**. We built this for the 'Slack Agent for Good' track. 

Every year, small businesses and independent merchants lose over $100 billion dollars to friendly chargeback fraud. To fight a single fraudulent dispute, a merchant has to manually cross-reference tracking numbers from Shopify, payment IP logs from Stripe, and customer chats from Zendesk. It takes hours, and small businesses simply can't keep up. 

So, we built an Enterprise SaaS that brings the entire investigation securely into the place where teams already live: **Slack.** Let me show you how it works."

*Click the "Add to Slack" button. Briefly show the OAuth screen, then go to the `http://localhost:3001/dashboard` page.*

**Speaker:** 
"Because we built a true multi-tenant OAuth flow, merchants can install this agent into their workspace with one click. Managers can monitor active disputes on our web dashboard. But the real magic happens for the investigators."

## 🕒 [0:45 - 1:15] Phase 2: The Architecture 
*Switch your screen to show the Architecture Diagram.*

**Speaker:**
"Before we jump into Slack, here is a quick look at our architecture. 
Our Slack Agent doesn't just hallucinate answers. It is powered by the new **Model Context Protocol (MCP)**. 
When a dispute occurs, our Bolt.js app spawns an MCP Client that securely tunnels into our external mock databases—Stripe for Risk vectors, and Shopify for tracking metrics. We also use OpenRouter to orchestrate a Multi-Agent Swarm for decision-making. 

Let's see this in action."

## 🕒 [1:15 - 2:00] Phase 3: The Handoff & MCP Execution
*Switch back to the Web Dashboard. Click on the first dispute (`ord_8832`).*
*Click the "Hand-off to Slack Workspace" button. Wait for the terminal to animate and Slack to open natively.*

**Speaker:**
"When an investigator is ready, they hand the ticket off to Slack. 
*(Wait for Slack to pop open).*
Now we are in our Slack Command Center. Let's ask our agent to investigate."

*In a Slack channel, type: `@Chargebackpilot analyze ord_8832` and hit Enter.*

**Speaker (while the bot is loading/fetching):**
"Right now, the agent is using MCP to securely fetch Stripe IP data and FedEx delivery signatures. It's also using the Slack Search API to find any past customer service tickets in our workspace. 

Look at that—it instantly generated a dynamic Win Probability Gauge chart right inside Block Kit based on the evidence."

## 🕒 [2:00 - 2:30] Phase 4: The Multi-Agent Swarm Debate
*Point to the screen as the three AI personas debate in the thread.*

**Speaker:**
"This is where we go beyond a basic chatbot. We built an advanced **Multi-Agent Swarm**. 
Instead of one AI making a blind guess, three distinct personas debate in the Slack thread. The Risk Assessor analyzes Stripe fraud vectors, the Legal Compliance Agent verifies the FedEx signature, and the Arbiter Lead reaches a consensus before drafting the final legal letter."

## 🕒 [2:30 - 3:00] Phase 5: Human-in-the-Loop & PDF Automation
*Scroll down to the generated letter and the green/red buttons.*

**Speaker:**
"AI should assist, not replace. So we implemented a strict Human-in-the-Loop workflow. The manager must review the draft."

*Click **"Review & Edit Draft"**. The interactive modal pops up. Click **"Generate PDF & Send"**.*

**Speaker:**
"Once approved, our Node.js backend dynamically generates a formatted PDF document, uploads it back to the Slack channel for our records, and automatically dispatches it to the Bank's resolution API.

We just turned a 4-hour manual investigation into a 30-second automated workflow. Chargebackpilot levels the playing field for small businesses. Thank you!"

*Stop recording.*
