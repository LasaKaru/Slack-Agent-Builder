'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  };

  const handleSlackLogin = () => {
    // Try to launch the native app directly without opening a blank tab
    window.location.href = 'slack://open';
    
    // Fallback: Open the Slack Web URL which reliably triggers the native app prompt
    setTimeout(() => {
      window.open('https://app.slack.com/client', '_blank');
    }, 1500);
  };

  return (
    <div className="login-page-wrapper">
      
      {/* LEFT PANEL - BRANDING */}
      <div className="login-left-panel">
        <div className="login-glowing-orb-1" />
        <div className="login-glowing-orb-2" />
        
        <div className="login-brand-content">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="login-logo-row">
              <div className="login-logo-box">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="login-brand-text">Chargeback<span>OS</span></span>
            </div>

            <h1 className="login-headline">
              Automate disputes.<br/>
              <span className="login-headline-highlight">Recover revenue.</span>
            </h1>
            <p className="login-subheadline">
              The only Model Context Protocol (MCP) powered agent that lives directly inside your Slack workspace, completely automating the bank rebuttal lifecycle.
            </p>

            <div className="login-pills">
              <span className="login-pill">⚡️ Real-time Search API</span>
              <span className="login-pill">🤖 Multi-AI Agent Swarm</span>
              <span className="login-pill">📄 Auto PDF Generation</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT PANEL - LOGIN */}
      <div className="login-right-panel">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="login-form-container"
        >
          <div>
            <h2 className="login-form-title">Welcome back</h2>
            <p className="login-form-subtitle">Sign in to access the Executive Dashboard.</p>
          </div>

          <form onSubmit={handleStandardLogin}>
            <div className="login-input-group">
              <label className="login-label">Work Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@company.com"
                className="login-input"
                required
              />
            </div>
            
            <div className="login-input-group">
              <label className="login-label">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="login-input"
                required
              />
              <p className="login-test-creds">Test credentials: manager@company.com / admin</p>
            </div>

            <div className="login-actions">
              <div className="login-checkbox-wrapper">
                <input type="checkbox" />
                <label>Remember me</label>
              </div>
              <a href="#" className="login-forgot">Forgot password?</a>
            </div>

            <button type="submit" disabled={isLoggingIn} className="login-submit-btn">
              {isLoggingIn ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <div className="login-divider">
            <span>Or continue as Investigator</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button onClick={handleSlackLogin} className="login-slack-btn">
              <svg className="login-slack-icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.523-2.522v-2.522h2.523zM15.165 17.688a2.527 2.527 0 0 1-2.523-2.523 2.526 2.526 0 0 1 2.523-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.52h-6.313z"/>
              </svg>
              <span>Open Slack Workspace</span>
            </button>
            
            <a 
              href={`https://slack.com/oauth/v2/authorize?client_id=${process.env.NEXT_PUBLIC_SLACK_CLIENT_ID || 'YOUR_CLIENT_ID_HERE'}&scope=app_mentions:read,chat:write,commands,links:read,links:write&user_scope=search:read&redirect_uri=http://localhost:3001`} 
              target="_blank" 
              rel="noreferrer" 
              style={{ textDecoration: 'none' }}
              onClick={(e) => {
                if (!process.env.NEXT_PUBLIC_SLACK_CLIENT_ID) {
                  e.preventDefault();
                  alert("Hackathon Note: To make the 'Add to Slack' button work, please add NEXT_PUBLIC_SLACK_CLIENT_ID to your chargeback-dispute/.env file with your Slack App's Client ID.");
                }
              }}
            >
              <div style={{ backgroundColor: '#ffffff', color: '#000000', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', border: '1px solid #e2e8f0', transition: 'all 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}>
                <svg viewBox="0 0 122.8 122.8" width="20" height="20" style={{ marginRight: '10px' }}>
                  <path d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z" fill="#e01e5a"/>
                  <path d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z" fill="#36c5f0"/>
                  <path d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z" fill="#2eb67d"/>
                  <path d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z" fill="#ecb22e"/>
                </svg>
                Add to Slack
              </div>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
