import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase if keys are provided
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const server = new Server(
  {
    name: "chargeback-mock-api",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_order_status",
        description: "Fetch Shopify order status and items.",
        inputSchema: {
          type: "object",
          properties: {
            order_id: { type: "string", description: "The order ID" },
          },
          required: ["order_id"],
        },
      },
      {
        name: "get_tracking_info",
        description: "Fetch Shopify shipping tracking information.",
        inputSchema: {
          type: "object",
          properties: {
            order_id: { type: "string", description: "The order ID" },
          },
          required: ["order_id"],
        },
      },
      {
        name: "get_payment_risk",
        description: "Fetch Stripe payment risk data (IP, CVC match, Score).",
        inputSchema: {
          type: "object",
          properties: {
            order_id: { type: "string", description: "The order ID" },
          },
          required: ["order_id"],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args || typeof args.order_id !== "string") {
    throw new Error("order_id is required and must be a string");
  }

  const orderId = args.order_id;

  if (name === "get_order_status") {
    let result = { status: "Unknown", items: [] as string[] };
    if (supabase) {
      const { data } = await supabase.from('orders').select('*').eq('order_id', orderId).single();
      if (data) result = { status: data.status, items: data.items || [] };
    } else {
      // Fallback Mock
      if (orderId === "ord_8832") {
        result = { status: "Delivered", items: ["Macbook Pro 14-inch"] };
      } else if (orderId === "ord_9941") {
        result = { status: "Fulfilled (Digital)", items: ["Premium SaaS Subscription"] };
      } else if (orderId === "ord_7710") {
        result = { status: "Delivered", items: ["Wireless Headphones"] };
      } else if (orderId === "ord_5521") {
        result = { status: "Processing", items: ["Office Desk"] };
      }
    }
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }

  if (name === "get_tracking_info") {
    let result: any = { error: "No tracking found" };
    if (supabase) {
      const { data } = await supabase.from('tracking').select('*').eq('order_id', orderId).single();
      if (data) result = data;
    } else {
      // Fallback Mock
      if (orderId === "ord_8832") {
        result = {
          courier: "FedEx",
          trackingNumber: "FX-883299102",
          deliveryDate: "2023-10-13T16:45:00Z",
          signedBy: "A. WONDERLAND",
          proofOfDelivery: "Signature Matched",
        };
      } else if (orderId === "ord_9941") {
        result = {
          courier: "Digital Delivery API",
          trackingNumber: "TOKEN-9941-XYZ",
          deliveryDate: "2023-10-15T09:00:00Z",
          signedBy: "Automated System Access",
          proofOfDelivery: "IP Access Log Confirmed",
        };
      } else if (orderId === "ord_7710") {
        result = {
          courier: "UPS",
          trackingNumber: "1Z9999999999999999",
          deliveryDate: "2023-10-10T12:00:00Z",
          signedBy: "Front Desk (J. SMITH)",
          proofOfDelivery: "Photo Uploaded by Driver",
        };
      }
    }
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }

  if (name === "get_payment_risk") {
    let result: any = { error: "No payment data" };
    if (supabase) {
      const { data } = await supabase.from('payment_risk').select('*').eq('order_id', orderId).single();
      if (data) result = data;
    } else {
      // Fallback Mock
      if (orderId === "ord_9941") {
        result = {
          cvcCheck: "Match",
          avsCheck: "Match",
          ipAddress: "192.168.1.1 (Customer Known IP)",
          riskScore: 12,
          authMethod: "3D Secure Verified",
        };
      } else if (orderId === "ord_8832") {
        result = {
          cvcCheck: "Match",
          avsCheck: "Match",
          ipAddress: "10.0.0.5",
          riskScore: 5,
          authMethod: "Standard",
        };
      } else if (orderId === "ord_7710") {
        result = {
          cvcCheck: "Fail",
          avsCheck: "Match",
          ipAddress: "172.16.254.1 (Proxy Detected)",
          riskScore: 88,
          authMethod: "Standard",
        };
      } else if (orderId === "ord_5521") {
        result = {
          cvcCheck: "Match",
          avsCheck: "Fail",
          ipAddress: "192.168.0.1",
          riskScore: 45,
          authMethod: "Standard",
        };
      }
    }
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }

  throw new Error(`Unknown tool: ${name}`);
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Chargeback MCP Server running on stdio");
}

run().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
