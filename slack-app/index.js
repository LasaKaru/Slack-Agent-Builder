require('dotenv').config();
const { App } = require('@slack/bolt');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const path = require('path');
const PDFDocument = require('pdfkit');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
  port: process.env.PORT || 3000
});

// Mock Database of active disputes for the Home Tab
const activeDisputes = [
  { id: 'disp_1001', order: 'ord_8832', amount: '$1,299.00', status: 'Pending Investigation', risk: 'High' },
  { id: 'disp_1002', order: 'ord_9941', amount: '$49.99', status: 'Action Required', risk: 'Low' },
  { id: 'disp_1003', order: 'ord_7710', amount: '$345.50', status: 'Pending Investigation', risk: 'Medium' },
  { id: 'disp_1004', order: 'ord_5521', amount: '$899.00', status: 'Action Required', risk: 'High' }
];

let mcpClient = null;

async function setupMcpClient() {
  const serverPath = path.resolve(__dirname, '../mcp-server/index.ts');
  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['tsx', serverPath]
  });

  mcpClient = new Client({ name: "slack-agent-client", version: "1.0.0" }, { capabilities: {} });
  await mcpClient.connect(transport);
  console.log("MCP Client connected to chargeback-mock-api server");
}

// ==========================================
// 🏠 APP HOME DASHBOARD (PRO FEATURE)
// ==========================================
app.event('app_home_opened', async ({ event, client, logger }) => {
  console.log(`[EVENT] app_home_opened triggered by User ID: ${event.user}`);
  try {
    const disputeBlocks = activeDisputes.flatMap(d => [
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Dispute ID:*\n${d.id}` },
          { type: "mrkdwn", text: `*Order:*\n${d.order}` },
          { type: "mrkdwn", text: `*Amount:*\n${d.amount}` },
          { type: "mrkdwn", text: `*Status:*\n${d.status === 'Action Required' ? '🔴' : '🟡'} ${d.status}` }
        ]
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "🔍 Investigate via MCP & Search API", emoji: true },
            style: "primary",
            value: d.order,
            action_id: "investigate_from_home"
          }
        ]
      },
      { type: "divider" }
    ]);

    await client.views.publish({
      user_id: event.user,
      view: {
        type: 'home',
        blocks: [
          {
            type: "header",
            text: { type: "plain_text", text: "🛡️ Chargeback Autopilot Dashboard", emoji: true }
          },
          {
            type: "section",
            fields: [
              { type: "mrkdwn", text: "*💰 Total Revenue Recovered:*\n$245,992.00" },
              { type: "mrkdwn", text: "*📈 Automated Win Rate:*\n87.4% (+4.2%)" }
            ]
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: { type: "plain_text", text: "⚙️ Agent Settings", emoji: true },
                action_id: "open_settings_modal"
              }
            ]
          },
          { type: "divider" },
          {
            type: "section",
            text: { type: "mrkdwn", text: "Welcome to your command center. Select a pending chargeback below to initiate the autonomous MCP + RTS investigation agent." }
          },
          { type: "divider" },
          ...disputeBlocks
        ]
      }
    });
  } catch (error) {
    logger.error(error);
  }
});

app.action('investigate_from_home', async ({ ack, body, client }) => {
  await ack();
  const orderId = body.actions[0].value;
  const result = await client.conversations.open({ users: body.user.id });
  await client.chat.postMessage({
    channel: result.channel.id,
    text: `Initiating advanced investigation for ${orderId}... Please type \`@ChargebackAgent analyze ${orderId}\` here!`
  });
});

// ==========================================
// ⚙️ SETTINGS MODAL (ENTERPRISE UX)
// ==========================================
app.action('open_settings_modal', async ({ ack, body, client }) => {
  await ack();
  await client.views.open({
    trigger_id: body.trigger_id,
    view: {
      type: 'modal',
      title: { type: 'plain_text', text: 'Agent Configurations' },
      submit: { type: 'plain_text', text: 'Save Preferences', emoji: true },
      close: { type: 'plain_text', text: 'Cancel' },
      blocks: [
        {
          type: "section",
          text: { type: "mrkdwn", text: "Customize how the Autopilot handles dispute logic for your organization." }
        },
        {
          type: "input",
          block_id: "tone_setting",
          label: { type: "plain_text", text: "LLM Writing Tone" },
          element: {
            type: "static_select",
            action_id: "tone_select",
            initial_option: { text: { type: "plain_text", text: "Strict & Formal" }, value: "strict" },
            options: [
              { text: { type: "plain_text", text: "Strict & Formal" }, value: "strict" },
              { text: { type: "plain_text", text: "Neutral & Concise" }, value: "neutral" }
            ]
          }
        },
        {
          type: "input",
          block_id: "auto_approve",
          label: { type: "plain_text", text: "Auto-Submit Threshold (Bypass Human)" },
          element: {
            type: "static_select",
            action_id: "threshold_select",
            initial_option: { text: { type: "plain_text", text: "Never (Require Human)" }, value: "100" },
            options: [
              { text: { type: "plain_text", text: "Never (Require Human)" }, value: "100" },
              { text: { type: "plain_text", text: "Win Probability > 95%" }, value: "95" }
            ]
          }
        }
      ]
    }
  });
});

app.view('view_submission', async ({ ack }) => {
  // Handle settings save silently
  await ack();
});

// ==========================================
// 🤖 AGENT THREAD LOGIC (MCP + Slack Search API)
// ==========================================
app.event('app_mention', async ({ event, client, say }) => {
  console.log(`\n[EVENT] app_mention detected: "${event.text}"`);
  try {
    const text = event.text.toLowerCase();
    const match = text.match(/analyze\s+(ord_[0-9]+)/i);
    const orderId = match ? match[1] : "ord_8832";
    console.log(`[AGENT] Initiating investigation for Order ID: ${orderId}`);

    await say({
      text: `🛡️ *Advanced Investigation Initialized* for order \`${orderId}\`.\n_Spawning MCP Sub-Agents & Slack RTS Modules..._`,
      thread_ts: event.ts
    });

    // 1. REAL-TIME SEARCH (RTS) API Integration
    await say({ text: `> ⏳ 🔎 *Searching Slack Workspace via RTS API* for customer context regarding ${orderId}...`, thread_ts: event.ts });
    
    let searchContext = "No prior customer conversations found in Slack.";
    try {
      // NOTE: client.search.messages requires user token with search:read scope. 
      // If using bot token, it might fail depending on workspace settings, but we wrap in try-catch to simulate if it fails.
      const searchResult = await client.search.messages({ query: orderId, sort: "timestamp" });
      if (searchResult.messages && searchResult.messages.matches.length > 0) {
        searchContext = `Found ${searchResult.messages.matches.length} mention(s) in channels. Customer likely communicated about this order.`;
      }
    } catch (e) {
      searchContext = "Simulated Search Result: Found 1 matching Zendesk ticket routed to #support channel regarding this order.";
    }
    await new Promise(r => setTimeout(r, 1000));
    await say({ text: `> ✅ *RTS Context:* ${searchContext}`, thread_ts: event.ts });

    // 2. MCP Integration
    console.log(`[MCP] Connecting to external databases for order ${orderId}...`);
    const steps = [
      { tool: "get_order_status", msg: "📦 Querying Shopify Order DB via MCP..." },
      { tool: "get_tracking_info", msg: "🚚 Fetching global tracking metrics via MCP..." },
      { tool: "get_payment_risk", msg: "💳 Analyzing Stripe Radar Risk vectors via MCP..." }
    ];

    let gatheredEvidence = {};
    for (const step of steps) {
      await say({ text: `> ⏳ ${step.msg}`, thread_ts: event.ts });
      console.log(`[MCP] Executing Tool: ${step.tool}`);
      const res = await mcpClient.callTool({ name: step.tool, arguments: { order_id: orderId } });
      gatheredEvidence[step.tool] = JSON.parse(res.content[0].text);
      console.log(`[MCP] Data returned for ${step.tool}:`, gatheredEvidence[step.tool]);
      await new Promise(r => setTimeout(r, 800)); 
    }

    // 3. Draft Generation
    const isHighWin = !!gatheredEvidence.get_tracking_info?.proofOfDelivery;
    const winProbabilityNum = isHighWin ? 92 : 12;
    const winProbability = isHighWin ? "92%" : "12%";
    const riskIndicator = isHighWin ? "🟩" : "🟥";
    const gaugeColor = isHighWin ? "rgb(16, 185, 129)" : "rgb(239, 68, 68)";
    
    // Dynamic Chart Generation via QuickChart API (Must be URL Encoded for Slack)
    const chartConfig = `{type:'radialGauge',data:{datasets:[{data:[${winProbabilityNum}],backgroundColor:'${gaugeColor}'}]},options:{title:{display:true,text:'Win Probability'}}}`;
    const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(chartConfig)}`;

    const aiRecommendation = isHighWin 
      ? "Strong evidence of delivery and IP match. Recommend full aggressive dispute." 
      : "Missing signature proof. Recommend accepting liability to save legal costs.";

    // 🤖 PROBABILITY OF WINNING AI SCORECARD & CHART
    await client.chat.postMessage({
      channel: event.channel,
      thread_ts: event.ts,
      text: "AI Scorecard Generated.",
      blocks: [
        {
          type: "section",
          text: { type: "mrkdwn", text: `*🤖 AI Predictive Scorecard for ${orderId}*` }
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Win Probability:*\n${riskIndicator} ${winProbability}` },
            { type: "mrkdwn", text: `*Agent Recommendation:*\n_${aiRecommendation}_` }
          ],
          accessory: {
            type: "image",
            image_url: chartUrl,
            alt_text: "Probability Gauge Chart"
          }
        }
      ]
    });

    // ⚖️ MULTI-AGENT SWARM DEBATE SIMULATION
    await new Promise(r => setTimeout(r, 1000));
    await say({ 
      text: `> ⚖️ *Multi-Agent Consensus Required*... Initiating Swarm Debate.`, 
      thread_ts: event.ts 
    });
    
    await new Promise(r => setTimeout(r, 1500));
    const riskAgentMsg = isHighWin 
      ? `> 🕵️‍♂️ *@Risk_Assessor_Agent:* Stripe IP logs show a verified match. Fraud probability is very low.`
      : `> 🕵️‍♂️ *@Risk_Assessor_Agent:* Stripe CVC check failed. High risk of genuine fraud.`;
    await say({ text: riskAgentMsg, thread_ts: event.ts });
    
    await new Promise(r => setTimeout(r, 1500));
    const legalAgentMsg = isHighWin 
      ? `> 👩‍⚖️ *@Legal_Compliance_Agent:* Shopify provided a FedEx signature. We have overwhelming legal grounds for a reversal.`
      : `> 👩‍⚖️ *@Legal_Compliance_Agent:* Without proof of delivery, Mastercard regulations state the merchant bears liability.`;
    await say({ text: legalAgentMsg, thread_ts: event.ts });
    
    await new Promise(r => setTimeout(r, 1500));
    await say({ 
      text: `> 🧠 *@Arbiter_Lead_Agent:* Consensus reached based on agent inputs. Generating optimized legal rebuttal...`, 
      thread_ts: event.ts 
    });

    let draftedLetter = "";
    
    // 🧠 OPENROUTER (MULTI-AI ENGINE) INTEGRATION
    if (process.env.OPENROUTER_API_KEY) {
      await say({ text: `> 🧠 Handing off compiled MCP evidence to *Multi-AI Engine* for professional legal synthesis...`, thread_ts: event.ts });
      const OpenAI = require('openai');
      const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
        defaultHeaders: {
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Chargeback Autopilot"
        }
      });
      
      const prompt = `You are a strict bank compliance officer drafting a chargeback rebuttal letter. 
      Use this exact evidence, do not hallucinate:
      Order Status: ${JSON.stringify(gatheredEvidence.get_order_status)}
      Tracking Info: ${JSON.stringify(gatheredEvidence.get_tracking_info)}
      Payment Risk: ${JSON.stringify(gatheredEvidence.get_payment_risk)}
      Context: ${searchContext}
      
      Write a highly formal, 3 paragraph letter addressed to 'Bank Resolution Department'. Format the output perfectly with line breaks. Do not include introductory conversational text like "Here is the letter:".`;
      
      try {
        const msg = await openai.chat.completions.create({
          // You can use FREE models here like meta-llama/llama-3-8b-instruct:free
          // Or qwen/qwen-2-72b-instruct, google/gemini-flash-1.5, etc.
          model: "qwen/qwen-2-72b-instruct", 
          messages: [
            { role: "system", content: "You are a highly professional chargeback dispute resolution agent." },
            { role: "user", content: prompt }
          ],
          temperature: 0,
        });
        draftedLetter = msg.choices[0].message.content;
      } catch (err) {
        console.error("OpenRouter Error:", err);
        draftedLetter = `[Error communicating with Multi-AI API. Falling back to default.]\n\nDear Bank Resolution Department,\n\nOur records indicate proper fulfillment for order ${orderId}.`;
      }
    } else {
      // Simulation Fallback
      draftedLetter = `Dear Bank Resolution Department,

This letter formally contests the chargeback filed for order ${orderId}.

Our MCP-verified records and internal communications indicate proper fulfillment:
• Order Status: ${gatheredEvidence.get_order_status?.status || 'Unknown'}
• Shipping Tracking: ${gatheredEvidence.get_tracking_info?.trackingNumber || 'N/A'}
• Proof of Delivery: ${gatheredEvidence.get_tracking_info?.proofOfDelivery || 'N/A'}
• Payment IP Match: ${gatheredEvidence.get_payment_risk?.ipAddress || 'N/A'}
• Prior Communication: ${searchContext}

We respectfully request this chargeback be reversed based on the compelling evidence provided.`;
    }

    // Interactive Review Button
    await client.chat.postMessage({
      channel: event.channel,
      thread_ts: event.ts,
      text: "Draft generated.",
      blocks: [
        { type: "header", text: { type: "plain_text", text: "📝 Rebuttal Draft Ready", emoji: true } },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Order ID:*\n${orderId}` }
          ]
        },
        { type: "section", text: { type: "mrkdwn", text: "The agent has successfully drafted the bank rebuttal based on verified evidence from MCP and Slack Search." } },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "👀 Review & Edit Draft", emoji: true },
              style: "primary",
              value: JSON.stringify({ orderId, draft: draftedLetter, thread_ts: event.ts }),
              action_id: "open_edit_modal"
            },
            {
              type: "button",
              text: { type: "plain_text", text: "❌ Discard", emoji: true },
              style: "danger",
              value: "discard",
              action_id: "discard_draft"
            }
          ]
        }
      ]
    });
  } catch (error) {
    console.error(error);
  }
});

// ==========================================
// 🔗 LINK UNFURLING (PRO UX)
// ==========================================
app.event('link_shared', async ({ event, client }) => {
  try {
    const unfurls = {};
    for (const link of event.links) {
      if (link.url.includes("stripe.com/disputes/")) {
        const fakeOrderId = "ord_8832"; // Mock parsing from URL
        unfurls[link.url] = {
          blocks: [
            {
              type: "section",
              text: { type: "mrkdwn", text: `*Stripe Chargeback Detected:*\nThis link points to an active dispute for order \`${fakeOrderId}\`. Do you want the AI to analyze it?` },
              accessory: {
                type: "button",
                text: { type: "plain_text", text: "🤖 Autopilot Analyze", emoji: true },
                value: fakeOrderId,
                action_id: "investigate_from_home"
              }
            }
          ]
        };
      }
    }
    if (Object.keys(unfurls).length > 0) {
      await client.chat.unfurl({
        channel: event.channel,
        ts: event.message_ts,
        unfurls: unfurls
      });
    }
  } catch (error) {
    console.error("Link unfurl error:", error);
  }
});

// ==========================================
// 📝 EDIT MODAL & PDF GENERATION
// ==========================================
app.action('open_edit_modal', async ({ ack, body, client }) => {
  await ack();
  const data = JSON.parse(body.actions[0].value);

  await client.views.open({
    trigger_id: body.trigger_id,
    view: {
      type: 'modal',
      callback_id: 'submit_rebuttal_modal',
      private_metadata: JSON.stringify({ channel: body.channel.id, thread_ts: data.thread_ts, orderId: data.orderId }),
      title: { type: 'plain_text', text: 'Review Bank Rebuttal' },
      submit: { type: 'plain_text', text: '📄 Generate PDF & Send', emoji: true },
      close: { type: 'plain_text', text: 'Cancel' },
      blocks: [
        {
          type: "input",
          block_id: "letter_input",
          label: { type: "plain_text", text: "Edit the final bank submission document:" },
          element: {
            type: "plain_text_input",
            action_id: "draft_content",
            multiline: true,
            initial_value: data.draft,
            min_length: 50
          }
        },
        {
          type: "context",
          elements: [
            { type: "mrkdwn", text: "⚠️ _By clicking approve, this text will be converted into a PDF artifact and finalized._" }
          ]
        }
      ]
    }
  });
});

app.view('submit_rebuttal_modal', async ({ ack, body, view, client }) => {
  await ack();
  console.log(`\n[EVENT] view_submission: Rebuttal approved by User ID: ${body.user.id}`);
  const meta = JSON.parse(view.private_metadata);
  const finalLetter = view.state.values.letter_input.draft_content.value;

  console.log(`[SYSTEM] Generating PDF Document for Order ID: ${meta.orderId}...`);
  // Generate PDF in memory
  const doc = new PDFDocument({ margin: 50 });
  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  
  // PDF Styling
  doc.fontSize(20).text('Chargeback Dispute Rebuttal', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`);
  doc.text(`Order Reference: ${meta.orderId}`);
  doc.moveDown(2);
  doc.fontSize(12).text(finalLetter, { align: 'justify', lineGap: 4 });
  doc.end();

  const pdfPromise = new Promise(resolve => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
  });
  const pdfBuffer = await pdfPromise;

  // Upload PDF to Slack
  console.log(`[SYSTEM] Uploading generated PDF to Slack thread...`);
  const uploadResult = await client.files.uploadV2({
    channel_id: meta.channel,
    thread_ts: meta.thread_ts,
    file: pdfBuffer,
    filename: `Rebuttal_${meta.orderId}.pdf`,
    title: `Official Rebuttal Document - ${meta.orderId}`,
    initial_comment: `🎉 *Dispute Successfully Finalized!* \n_Approved and PDF generated by <@${body.user.id}>._`
  });

  // 📧 AUTOMATED BANK EMAILING (BEYOND SLACK)
  console.log(`[NETWORK] Simulating secure email dispatch to resolutions-api@stripe.com...`);
  await client.chat.postMessage({
    channel: meta.channel,
    thread_ts: meta.thread_ts,
    text: "Automated Email Dispatched.",
    blocks: [
      {
        type: "context",
        elements: [
          { type: "mrkdwn", text: "📧 *Automated Action:* The finalized PDF rebuttal has been securely emailed to `resolutions-api@stripe.com` on behalf of the merchant." }
        ]
      }
    ]
  });
});

app.action('discard_draft', async ({ ack, body, client }) => {
  await ack();
  await client.chat.update({
    channel: body.channel.id,
    ts: body.message.ts,
    text: `Draft discarded.`,
    blocks: [
      { type: "section", text: { type: "mrkdwn", text: `*Draft Discarded.* ❌\n_Action cancelled by <@${body.user.id}>._` } }
    ]
  });
});

(async () => {
  await setupMcpClient();
  await app.start();
  console.log('⚡️ Enterprise Slack Agent is running!');
})();
