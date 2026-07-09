"use client";

import { useEffect, useState, useRef } from "react";
import { Play, CheckCircle, ShieldAlert, FileText, Cpu } from "lucide-react";

export default function Home() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  
  const [agentState, setAgentState] = useState<string>("idle"); // idle, running, pending_review, submitted
  const [logs, setLogs] = useState<string[]>([]);
  const [draft, setDraft] = useState<string>("");
  
  const [animatedLogs, setAnimatedLogs] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/disputes")
      .then(r => r.json())
      .then(data => setDisputes(data));
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [animatedLogs]);

  const selectDispute = async (d: any) => {
    setSelected(d);
    setAgentState("idle");
    setLogs([]);
    setAnimatedLogs([]);
    setDraft("");
    
    // Check if agent was already run
    const res = await fetch(`/api/agent?disputeId=${d.id}`);
    const data = await res.json();
    if (data && data.status) {
      if (data.status === "pending_review" || data.status === "submitted") {
        setAgentState(data.status);
        setLogs(data.logs || []);
        setAnimatedLogs(data.logs || []);
        setDraft(data.draft_letter || "");
      }
    }
  };

  const runAgent = async () => {
    if (!selected) return;
    setAgentState("running");
    setLogs([]);
    setAnimatedLogs([
      `[SYSTEM] Linking Web Portal to Slack Workspace...`,
      `[NETWORK] Establishing secure MCP tunnel for ${selected.orderId}...`
    ]);
    setDraft("");

    // Simulate the bridge to Slack
    setTimeout(() => {
        setAnimatedLogs(prev => [
          ...prev, 
          `[SUCCESS] Tunnel connected.`,
          `[AGENT] Handoff complete. Opening Slack for real-time Swarm Debate...`
        ]);
        
        // Open Slack natively
        setTimeout(() => {
          window.location.href = 'slack://open';
          setAgentState("idle");
        }, 1500);

        // Fallback for browsers blocking custom protocols
        setTimeout(() => {
          window.open('https://app.slack.com/client', '_blank');
        }, 3000);

    }, 2000);
  };

  const approveAndSubmit = async () => {
    if (!selected) return;
    setAgentState("submitting");
    
    const res = await fetch(`/api/agent?action=approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disputeId: selected.id })
    });
    
    const data = await res.json();
    setAnimatedLogs(prev => [...prev, ...(data.logs || []).map((l: string) => l.replace("\n", ""))]);
    setAgentState(data.status); // submitted
  };

  return (
    <div className="container">
      <div className="header">
        <ShieldAlert size={28} color="#3b82f6" />
        <h1>Chargeback Dispute Autopilot</h1>
        <div className="header-badge">LangGraph + Qwen3.7-Max</div>
      </div>

      <div className="sidebar glass-panel">
        <h2 style={{ fontSize: 14, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 16, letterSpacing: 1 }}>
          Incoming Disputes ({disputes.length})
        </h2>
        
        {disputes.map(d => (
          <div 
            key={d.id} 
            className={`dispute-card ${selected?.id === d.id ? 'active' : ''}`}
            onClick={() => selectDispute(d)}
          >
            <div className="dispute-id">{d.id}</div>
            <div className="dispute-title">{d.customerName} - {d.amount}</div>
            <div className="dispute-meta">
              <span>{d.orderId}</span>
              <span className="dispute-claim">{d.claimType}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="workspace">
        <div className="terminal" ref={terminalRef}>
          <div className="terminal-header">
            <div className="dot dot-red"></div>
            <div className="dot dot-yellow"></div>
            <div className="dot dot-green"></div>
            <span style={{ marginLeft: 8 }}><Cpu size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }}/> Agent Execution Trace</span>
          </div>
          
          {!selected && (
            <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              Select a dispute to view the agent workflow.
            </div>
          )}

          {animatedLogs.map((log, idx) => (
            <div key={idx} className="log-line">
              <span style={{ color: '#60a5fa' }}>{new Date().toISOString().split('T')[1].substring(0,8)}</span> {log}
            </div>
          ))}

          {agentState === "running" && (
            <div className="log-line" style={{ color: '#f59e0b', animation: 'pulse 1s infinite' }}>
               Working...
            </div>
          )}
        </div>

        <div className="letter-area glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={20} /> Generated Rebuttal Letter
            </h2>
            <div className="actions">
              {agentState === "idle" && selected && (
                <button onClick={runAgent}>
                  <Play size={16} /> Hand-off to Slack Workspace
                </button>
              )}
              {agentState === "pending_review" && (
                <button className="btn-success" onClick={approveAndSubmit}>
                  <CheckCircle size={16} /> Approve & Submit
                </button>
              )}
              {agentState === "submitted" && (
                <button disabled>
                  <CheckCircle size={16} /> Submitted Successfully
                </button>
              )}
            </div>
          </div>

          <div className="letter-content">
            {draft ? (
              draft
            ) : (
              <div className="empty-state">
                <FileText size={48} opacity={0.2} />
                <p>No draft generated yet.</p>
                <p style={{ fontSize: 13, opacity: 0.6 }}>Click "Run Autopilot Agent" to fetch evidence and draft a response.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
