## Inspiration
Every year, small businesses and independent merchants lose over **$100 billion dollars** to "friendly" chargeback fraud. When a customer falsely claims they never received an item, the burden of proof falls entirely on the merchant. To fight a single dispute, an investigator must manually cross-reference shipping tracking from Shopify, IP logs from Stripe, and customer chat history from Zendesk. It takes hours of tedious work, causing many small businesses to simply give up and accept the financial loss. We realized that AI could automate this entirely, but a clunky web dashboard wasn't enough. We wanted to build a solution that lives exactly where modern teams already collaborate. This inspired us to build **Chargebackpilot** for the *"Slack Agent for Good"* track—leveling the playing field for small businesses by automating dispute resolution directly inside Slack.

## What it does
Chargebackpilot is an Enterprise-grade SaaS application that transforms your Slack workspace into an autonomous chargeback investigation command center. 

When a dispute is filed, managers can monitor it via our Next.js web portal. With a single click, they can seamlessly hand-off the investigation to the Slack Agent. Inside Slack, investigators simply type `@Chargebackpilot analyze ord_8832`. 

Instead of a basic chatbot, this triggers an advanced **Multi-Agent Swarm**. The agent securely tunnels into merchant databases using the **Model Context Protocol (MCP)** to fetch Stripe fraud vectors and Shopify shipping data. It also queries the native Slack Search API to find relevant customer service history. 

Three distinct AI personas then debate the evidence in the Slack thread: a Risk Assessor, a Legal Compliance officer, and an Arbiter Lead. They reach a consensus, generate a dynamic "Win Probability" gauge chart using Block Kit, and draft a formal legal rebuttal. Through interactive Slack Modals, the human investigator can approve the draft, which dynamically generates a PDF and securely emails it to the bank's resolution API.

## How we built it
We built a deeply integrated, dual-platform architecture:
* **The Manager Portal:** A polished Next.js 16 web dashboard featuring dynamic animations and a true multi-tenant Slack OAuth flow, allowing any workspace to install the app with one click.
* **The Slack Agent:** A Node.js backend utilizing `@slack/bolt` running via Socket Mode for real-time WebSocket communication.
* **Model Context Protocol (MCP):** We built a custom MCP Server using `@modelcontextprotocol/sdk` to securely expose mock Shopify and Stripe APIs to our LLM without leaking naked API keys.
* **Multi-Agent Orchestration:** We leveraged OpenRouter to route complex logic to advanced reasoning models (like Qwen3.7-Max), creating the conversational "Swarm Debate" mechanic.
* **Slack UI/UX:** We heavily utilized Slack Block Kit, interactive views (Modals), dynamic Unfurling for deep links, and the QuickChart API for embedding live data visualizations directly into messages.
* **PDF Automation:** We used `pdfkit` to compile the final approved text into a stylized legal document.

## Challenges we ran into
Integrating the **Model Context Protocol (MCP)** with a Slack Bolt app was uncharted territory. Because MCP relies on standard IO (stdio) transport layers, managing the asynchronous execution pipeline while keeping the Slack UI responsive required complex Promise management. We had to ensure the Slack thread was constantly updated with "loading" indicators so the user knew the agent hadn't stalled while fetching external API data. Additionally, handling Slack's strict URL encoding requirements for embedding dynamic Block Kit images (like our Win Probability charts) required meticulous string formatting and debugging.

## Accomplishments that we're proud of
We are incredibly proud of the **Multi-Agent Swarm** UI. Watching multiple AI personas actively "debate" the evidence in a Slack thread before reaching a conclusion creates an incredibly transparent, trustworthy, and engaging user experience. We are also proud of our seamless "Handoff" workflow, where the Next.js web portal successfully deep-links the user directly into their native Slack Desktop app, bridging the gap between Web SaaS and internal tooling.

## What we learned
We learned the immense power of **Agentic UX**. A chatbot that spits out a wall of text is boring; an agent that posts interactive checkboxes, dynamic gauge charts, updates its own messages in real-time, and hands you a final PDF via a Modal feels like magic. We also learned how robust the Slack developer ecosystem is, particularly the power of combining interactive views (Modals) with external API webhooks.

## What's next for Chargebackpilot
The immediate next step is integrating live, production APIs for Stripe, Shopify, and Zendesk via our MCP server, moving beyond mock data. We also plan to implement an "Auto-Dispute" threshold, where disputes under $50 with a Win Probability over 95% bypass human review entirely and automatically submit the PDF to the bank, saving merchants even more time. Ultimately, we want to launch Chargebackpilot on the official Slack App Directory as a premium B2B SaaS tool.
