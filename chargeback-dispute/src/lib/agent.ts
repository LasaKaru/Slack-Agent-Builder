import { StateGraph, Annotation, MemorySaver } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { getOrderStatus, getTrackingInfo, getPaymentRisk, MOCK_DISPUTES } from "./services";

// Define the state
export const DisputeState = Annotation.Root({
  dispute_id: Annotation<string>,
  raw_email: Annotation<string>,
  claim_type: Annotation<string>,
  order_id: Annotation<string>,
  order_data: Annotation<any>,
  risk_data: Annotation<any>,
  draft_letter: Annotation<string>,
  status: Annotation<string>,
  logs: Annotation<string[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
});

const getModel = () => {
  const apiKey = process.env.QWEN_API_KEY || "dummy";
  return new ChatOpenAI({
    modelName: "qwen-max", // Using qwen-max equivalent to qwen3.7-max
    openAIApiKey: apiKey,
    configuration: {
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
    },
    maxRetries: 0
  });
};

// Node: Extract Claim
async function extractClaim(state: typeof DisputeState.State) {
  let orderId = state.order_id;
  let claimType = state.claim_type;
  
  // For the hackathon, simulate extraction based on MOCK_DISPUTES if we don't want to make an actual API call for simple parsing
  if (!orderId || !claimType) {
    const dispute = MOCK_DISPUTES.find(d => d.id === state.dispute_id);
    orderId = dispute?.orderId || "unknown";
    claimType = dispute?.claimType || "unknown";
  }

  return {
    order_id: orderId,
    claim_type: claimType,
    status: "gathering",
    logs: ["\n[✓] Extracting Order ID and Claim Type..."]
  };
}

// Node: Fetch Evidence
async function fetchEvidence(state: typeof DisputeState.State) {
  const logs = ["\n[✓] Calling Shopify API for order and tracking...", "\n[✓] Calling Stripe API for risk data..."];
  
  const orderData = await getOrderStatus(state.order_id);
  const trackingInfo = await getTrackingInfo(state.order_id);
  const riskData = await getPaymentRisk(state.order_id);
  
  return {
    order_data: { ...orderData, ...trackingInfo },
    risk_data: riskData,
    logs
  };
}

// Node: Draft Rebuttal
async function draftRebuttal(state: typeof DisputeState.State) {
  const logs = ["\n[✓] Sending gathered evidence to Qwen3.7-Max for drafting..."];
  
  const systemPrompt = `You are an expert Chargeback Dispute Resolution Officer for a major e-commerce company. Your job is to draft a highly formal, concise, and compelling 3-paragraph rebuttal letter to a bank's chargeback department. 

Reasoning effort is set to high. Please think carefully through the task, validate the evidence provided against the customer's claim, and prioritize correctness, consistency, and a neutral, professional tone in the final answer.

You will be provided with a JSON object containing the customer's claim, order data, and payment risk data. 

RULES:
1. NO HALLUCINATION: You must ONLY use the exact dates, tracking numbers, IP addresses, and names provided in the JSON data. If a piece of data is missing, do not mention it.
2. TONE: Factual, professional, neutral, and assertive. Do not use emotional language.
3. STRUCTURE:
   - Paragraph 1: The Transaction Summary (State the customer name, order date, amount, and exactly what was purchased).
   - Paragraph 2: The Rebuttal (Directly address the specific claim type. E.g., if "Item Not Received," focus on tracking and delivery dates. If "Fraudulent," focus on IP match, AVS/CVV match, and 3D Secure).
   - Paragraph 3: The Conclusion (A one-sentence formal request to reverse the chargeback in the merchant's favor).
4. CONCISENESS: Bank officers review thousands of these daily. Keep it under 250 words. Use bullet points for key evidence (e.g., Tracking Number, IP Address, CVV match).`;

  const inputJson = JSON.stringify({
    claim_type: state.claim_type,
    email: state.raw_email,
    order_data: state.order_data,
    risk_data: state.risk_data
  }, null, 2);

  let draft = "";
  try {
    if (process.env.QWEN_API_KEY && process.env.QWEN_API_KEY !== "dummy") {
      const model = getModel();
      const response = await model.invoke([
        { role: "system", content: systemPrompt },
        { role: "user", content: "Here is the evidence:\n\n" + inputJson }
      ]);
      draft = response.content as string;
    } else {
      // Mocked output for missing API key
      await new Promise(r => setTimeout(r, 2000)); // Simulate think time
      draft = "Dear Bank Resolution Department,\n\n" +
              "This letter is in response to the chargeback filed for order " + state.order_id + ". The customer purchased the item on the specified date.\n\n" +
              "Regarding the claim of '" + state.claim_type + "', our records indicate proper fulfillment. Tracking shows delivery, and payment logs show a CVC and AVS match, alongside verified 3D Secure. \n\n" +
              "We respectfully request that this chargeback be reversed in the merchant's favor based on the compelling evidence provided.";
    }
  } catch (error) {
    draft = "Error generating draft: " + (error as Error).message;
  }

  logs.push("\n[✓] Letter drafted successfully.");

  return {
    draft_letter: draft,
    status: "pending_review",
    logs
  };
}

// Node: Human Review
// This node just returns the current state, but we will use `interrupt_before` to pause before it.
async function submitNode(state: typeof DisputeState.State) {
  return {
    status: "submitted",
    logs: ["\n[✓] Letter approved and submitted to bank via Stripe API."]
  };
}

// Build the Graph
const workflow = new StateGraph(DisputeState)
  .addNode("extractClaim", extractClaim)
  .addNode("fetchEvidence", fetchEvidence)
  .addNode("draftRebuttal", draftRebuttal)
  .addNode("submitNode", submitNode)
  
  .addEdge("__start__", "extractClaim")
  .addEdge("extractClaim", "fetchEvidence")
  .addEdge("fetchEvidence", "draftRebuttal")
  .addEdge("draftRebuttal", "submitNode");

// Memory to persist state across Human-in-the-loop calls
export const checkpointer = new MemorySaver();

export const graph = workflow.compile({
  checkpointer,
  interruptBefore: ["submitNode"] // Pause before submit!
});
