import { NextResponse } from "next/server";
import { graph } from "@/lib/agent";

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  
  try {
    const body = await req.json();
    const { disputeId, rawEmail, claimType } = body;
    
    if (!disputeId) {
      return NextResponse.json({ error: "Dispute ID is required" }, { status: 400 });
    }

    const config = { configurable: { thread_id: disputeId } };

    if (action === "approve") {
      // Resume the graph from the interrupted state
      // Provide no input to let it just run the node
      const stream = await graph.stream(null, config);
      let finalState = {};
      
      for await (const chunk of stream) {
        // Collect chunks
      }
      
      const state = await graph.getState(config);
      return NextResponse.json(state.values);
    } 
    
    // Default action: Start the graph
    const initialState = {
      dispute_id: disputeId,
      raw_email: rawEmail || "",
      claim_type: claimType || "",
      status: "started"
    };

    // We can use graph.stream to get partial updates, but for simplicity of the API 
    // let's just invoke it, it will stop at interruptBefore
    const stream = await graph.stream(initialState, config);
    let logs = [];
    
    // We can iterate the stream to ensure it runs
    for await (const chunk of stream) {
      // We can collect updates here
    }

    // Now get the current state
    const state = await graph.getState(config);
    return NextResponse.json(state.values);

  } catch (error) {
    console.error("Agent Error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const disputeId = searchParams.get("disputeId");
  
  if (!disputeId) {
    return NextResponse.json({ error: "Dispute ID is required" }, { status: 400 });
  }

  const config = { configurable: { thread_id: disputeId } };
  const state = await graph.getState(config);
  
  return NextResponse.json(state.values || { status: "not_started" });
}
