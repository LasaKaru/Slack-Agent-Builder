# 🚀 Chargeback Dispute Autopilot

An intelligent, autonomous AI agent built to automate the tedious and costly process of e-commerce chargeback dispute investigations.

This project was built to meet the requirements of **Track 4: The "Chargeback Dispute" Autopilot** hackathon challenge.

## 🌟 Architecture & Tech Stack

This project is built using a modern, scalable, and low-resource tech stack:

- **Frontend & Backend Framework**: [Next.js (App Router)](https://nextjs.org/) & [Node.js](https://nodejs.org/)
- **Agent Orchestration**: [LangGraph.js](https://github.com/langchain-ai/langgraphjs) (The JS equivalent of LangGraph Python, perfect for Next.js API integration)
- **LLM Engine**: [Qwen 3.7 Max](https://help.aliyun.com/document_detail/2712169.html) (via Alibaba Cloud Model Studio API)
- **UI/UX**: Custom-built Glassmorphism Dark Mode dashboard using pure CSS and React `lucide-react` icons.

## 🧠 How The Agent Works (LangGraph Workflow)

The AI agent executes a state machine (defined in `src/lib/agent.ts`) with the following nodes:

1. **`extractClaim`**: Parses the incoming unstructured dispute (e.g., from a customer email) to extract the Order ID and the exact claim type (e.g., "Item Not Received").
2. **`fetchEvidence`**: Automatically invokes external tools (mocked in `src/lib/services.ts`) to fetch:
   - Shopify Order Status & Tracking Info
   - Stripe Payment IP Address & Risk Score
3. **`draftRebuttal`**: Injects the fetched JSON data into a massive system prompt. Qwen 3.7 Max acts as a strict financial compliance officer to draft a highly formal, bulleted, 3-paragraph rebuttal letter.
4. **`Human-in-the-Loop (Pause)`**: The LangGraph state freezes using `interruptBefore=["submitNode"]` and a memory checkpointer. It waits for the human reviewer.
5. **`submitNode`**: Once the user clicks "Approve & Submit", the graph resumes and Finalizes the submission.

## ✨ "Pro" UI / UX Features

- **Dynamic Execution Trace**: To satisfy the core observability requirement, the Next.js UI features a live "terminal" that visually animates the agent's thought process step-by-step.
- **Glassmorphic Design**: A premium, visually stunning aesthetic utilizing subtle gradients, backdrop blurs, and hover micro-animations.
- **Seamless Human-in-the-Loop**: The UI clearly transitions from "Running" to "Pending Review", revealing the generated letter and an "Approve & Submit" button.

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure the LLM (Optional but Recommended)
The application includes a fallback simulation mechanism so you can demo it instantly without an API key. 

However, to use the real **Qwen 3.7 Max** model:
1. Open the `.env` file at the root of the project.
2. Add your Alibaba Cloud API Key:
   ```env
   QWEN_API_KEY=your_alibaba_cloud_api_key_here
   ```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or whichever port Next.js assigns) in your browser to view the application.

## 📂 Project Structure

- `src/app/page.tsx`: The main dashboard UI.
- `src/app/globals.css`: The premium UI/UX styles.
- `src/lib/agent.ts`: The LangGraph state machine and Qwen LLM integration.
- `src/lib/services.ts`: The mock Shopify and Stripe external tool APIs.
- `src/app/api/agent/route.ts`: The backend endpoint controlling the agent execution and pausing.
