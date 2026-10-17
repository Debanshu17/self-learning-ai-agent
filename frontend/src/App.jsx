import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './index.css';

const DEFAULT_API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000/api'
  : '';

// Default knowledge items for standalone/demo exploration
const INITIAL_KNOWLEDGE = [
  { id: '1', category: 'ARCHITECTURE', content: 'Agentic RAG decouples planning from retrieval, routing queries to specialized vector spaces based on sub-goal decomposition.' },
  { id: '2', category: 'EVALUATION', content: 'Self-reflection loops should limit maximum retry iterations to prevent token runaway on strict Pydantic JSON schemas.' },
  { id: '3', category: 'SECURITY', content: 'Autonomous tools that execute arbitrary Python scripts or file system operations must enforce Human-in-the-Loop approval checkpoints.' }
];

// --- SVG Icons ---
const QuoteIcon = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
  </svg>
);

const LoaderIcon = () => (
  <svg className='animate-spin' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M21 12a9 9 0 1 1-6.219-8.56'></path>
  </svg>
);

const SettingsIcon = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <circle cx='12' cy='12' r='3'></circle>
    <path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z'></path>
  </svg>
);

// --- Components ---
const TopNav = ({ activeTab, setActiveTab, onOpenSettings, isConnected }) => {
  const getTabClass = (tabName) => {
    return activeTab === tabName 
      ? 'text-on-dark font-bold text-[14px] uppercase tracking-wider border-b-2 border-brand pb-1'
      : 'text-mute hover:text-on-dark font-bold text-[14px] uppercase tracking-wider pb-1 transition-colors';
  };

  return (
    <header className='h-[64px] bg-ink text-on-dark px-6 lg:px-12 flex items-center justify-between sticky top-0 z-50'>
      <div className='flex items-center gap-3'>
        <div className='w-8 h-8 bg-brand rounded-sm flex items-center justify-center text-white'>
          <QuoteIcon />
        </div>
        <span className='font-bold text-lg tracking-tight uppercase'>AgentCore</span>
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${isConnected ? 'bg-green-600 text-white' : 'bg-brand/30 text-brand border border-brand'}`}>
          {isConnected ? 'LIVE BACKEND' : 'STANDALONE MODE'}
        </span>
      </div>
      
      <nav className='hidden md:flex gap-8'>
        <button onClick={() => setActiveTab('workspace')} className={getTabClass('workspace')}>Workspace</button>
        <button onClick={() => setActiveTab('knowledge')} className={getTabClass('knowledge')}>Knowledge</button>
        <button onClick={() => setActiveTab('history')} className={getTabClass('history')}>History</button>
      </nav>
      
      <div className='flex items-center gap-3'>
        <button 
          onClick={onOpenSettings}
          className='flex items-center gap-2 border border-mute text-mute hover:text-on-dark hover:border-on-dark rounded-pill px-3 py-1.5 text-[12px] font-bold uppercase tracking-wider transition-colors'
          title="Configure Backend API URL"
        >
          <SettingsIcon />
          <span className='hidden sm:inline'>API Settings</span>
        </button>
        <a 
          href="https://github.com/Debanshu17/self-learning-ai-agent"
          target="_blank"
          rel="noreferrer"
          className='border border-on-dark text-on-dark rounded-pill px-4 py-1.5 text-[12px] font-bold uppercase tracking-wider hover:bg-on-dark hover:text-ink transition-colors'
        >
          GitHub
        </a>
      </div>
    </header>
  );
};

const KnowledgeView = ({ knowledge }) => {
  return (
    <div className='max-w-[1000px] mx-auto px-6 py-12'>
      <h2 className='text-[32px] font-[800] uppercase tracking-tight text-ink mb-8 border-b-2 border-brand inline-block pb-2'>System Knowledge Base</h2>
      <div className='flex flex-col gap-4'>
        {knowledge.length === 0 ? (
          <div className='text-body text-[18px]'>No memories recorded yet. Run a task in the Workspace to teach the agent!</div>
        ) : (
          knowledge.map(k => (
            <div key={k.id} className='bg-canvas-soft border border-mute rounded-card p-6 flex flex-col gap-2'>
              <div className='text-[12px] font-[800] text-brand uppercase tracking-wider'>{k.category}</div>
              <div className='text-ink text-[16px] leading-relaxed'>{k.content}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const HistoryView = ({ history }) => {
  return (
    <div className='max-w-[1000px] mx-auto px-6 py-12'>
      <h2 className='text-[32px] font-[800] uppercase tracking-tight text-ink mb-8 border-b-2 border-brand inline-block pb-2'>Task History</h2>
      <div className='flex flex-col gap-4'>
        {history.length === 0 ? (
          <div className='text-body text-[18px]'>No tasks in history yet. Initiate a task in the Workspace!</div>
        ) : (
          history.map(t => (
            <div key={t.id} className='bg-canvas-soft border border-mute rounded-card p-6 flex flex-col gap-4'>
              <div className='text-[18px] font-[800] text-ink'>{t.prompt}</div>
              <div className='text-body text-[14px] leading-relaxed whitespace-pre-wrap'>{t.response}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState('workspace');
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('agent_api_url') || DEFAULT_API_URL);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempApiUrl, setTempApiUrl] = useState(apiUrl);
  const [isConnected, setIsConnected] = useState(false);

  const [knowledge, setKnowledge] = useState(() => {
    const saved = localStorage.getItem('agent_knowledge');
    return saved ? JSON.parse(saved) : INITIAL_KNOWLEDGE;
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('agent_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("Search the web for 'Agentic AI Architecture', summarize the core components, calculate how many core elements there are, and extract a lesson on how to build one.");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('agent_knowledge', JSON.stringify(knowledge));
  }, [knowledge]);

  useEffect(() => {
    localStorage.setItem('agent_history', JSON.stringify(history));
  }, [history]);

  // Check backend health
  useEffect(() => {
    if (!apiUrl) {
      setIsConnected(false);
      return;
    }
    axios.get(`${apiUrl}/history`, { timeout: 2500 })
      .then(res => {
        setIsConnected(true);
        if (res.data?.tasks?.length) {
          setHistory(prev => {
            const combined = [...res.data.tasks, ...prev.filter(p => !res.data.tasks.find(r => r.id === p.id))];
            return combined;
          });
        }
      })
      .catch(() => setIsConnected(false));

    axios.get(`${apiUrl}/knowledge`, { timeout: 2500 })
      .then(res => {
        if (res.data?.knowledge?.length) {
          setKnowledge(prev => {
            const combined = [...res.data.knowledge, ...prev.filter(p => !res.data.knowledge.find(r => r.id === p.id))];
            return combined;
          });
        }
      })
      .catch(() => {});
  }, [apiUrl]);

  useEffect(() => {
    if (activeTab === 'workspace') {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [tasks, activeTab]);

  // Simulated Agent Runner for standalone / cloud demo execution
  const runSimulatedAgent = async (taskId, prompt) => {
    const sleep = (ms) => new Promise(res => setTimeout(res, ms));

    // 1. Retrieving
    await sleep(600);
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'retrieving' } : t));

    // 2. Planning
    await sleep(900);
    const plan = [
      { step_number: 1, description: 'Analyze prompt requirements and retrieve architectural definitions' },
      { step_number: 2, description: 'Invoke Search & Python tools to calculate component hierarchy' },
      { step_number: 3, description: 'Synthesize findings and extract transferable memory lessons' }
    ];
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'planning', plan } : t));

    // 3. Tool Execution Request (Human-In-The-Loop)
    await sleep(900);
    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      status: 'waiting_approval',
      toolRequest: {
        tool: 'WebSearch & Python Execution Sandbox',
        reason: 'Autonomous retrieval and calculation required for structural synthesis'
      }
    } : t));
  };

  const approveSimulatedTool = async (taskId) => {
    const sleep = (ms) => new Promise(res => setTimeout(res, ms));

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'executing', toolRequest: null } : t));
    await sleep(1400);

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'evaluating' } : t));
    await sleep(800);

    const currentTask = tasks.find(t => t.id === taskId);
    const promptText = currentTask ? currentTask.prompt : 'Task';

    const responseText = `### Agent Execution Result\n\nBased on execution of the plan for: "${promptText}":\n\n1. **Core Agentic Architecture Identified:**\n   - **Planner & Reasoner:** Deconstructs goals into sequential sub-tasks.\n   - **Dynamic Tool Matrix:** Connects the LLM to real-world interpreters (Python, WebSearch, File System).\n   - **Dual-Layer Memory:** Relational SQLite for transactional history + ChromaDB vector embeddings for semantic retrieval.\n   - **Self-Reflection & Evaluator:** Autonomous critic assessing output quality prior to delivery.\n\n2. **Synthesis & Calculation:**\n   - Successfully identified and validated **4 fundamental architectural pillars**.\n   - Evaluator score: **95/100 (PASSED)**.`;

    const newLesson = `Agentic AI architectures require decoupling reasoning, tool orchestration, and memory persistence into distinct, verifiable feedback loops.`;

    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      status: 'completed',
      response: responseText,
      lessons: [newLesson]
    } : t));

    // Save to Knowledge & History
    const newKnowledgeItem = {
      id: Date.now().toString(),
      category: 'LEARNED LESSON',
      content: newLesson
    };
    setKnowledge(prev => [newKnowledgeItem, ...prev]);

    const newHistoryItem = {
      id: taskId,
      prompt: promptText,
      response: responseText
    };
    setHistory(prev => [newHistoryItem, ...prev]);
    setLoading(false);
  };

  const sendTask = async () => {
    if (!input.trim() || loading) return;
    
    const taskId = Date.now().toString();
    const newTask = {
      id: taskId,
      prompt: input,
      status: 'starting',
      plan: null,
      response: null,
      lessons: [],
      toolRequest: null,
      error: null
    };
    
    setTasks(prev => [...prev, newTask]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    // If no backend configured or backend is offline, run the robust standalone agent loop
    if (!apiUrl || !isConnected) {
      runSimulatedAgent(taskId, currentInput);
      return;
    }
    
    try {
      const response = await fetch(`${apiUrl}/stream/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput })
      });
      
      if (!response.ok) throw new Error("HTTP error " + response.status);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while(true) {
        const {value, done} = await reader.read();
        if (done) break;
        
        const chunkStr = decoder.decode(value);
        const chunks = chunkStr.split('\n\n');
        
        for (let chunk of chunks) {
          if (chunk.startsWith('data: ')) {
            const dataStr = chunk.substring(6);
            if (!dataStr) continue;
            
            try {
              const parsed = JSON.parse(dataStr);
              
              setTasks(prev => prev.map(t => {
                if (t.id !== taskId) return t;
                
                let updated = { ...t };
                if (parsed.event === 'status') updated.status = parsed.data;
                if (parsed.event === 'plan') updated.plan = parsed.data;
                if (parsed.event === 'response') updated.response = parsed.data;
                if (parsed.event === 'lessons') updated.lessons = parsed.data;
                if (parsed.event === 'tool_approval') {
                   updated.status = 'waiting_approval';
                   updated.toolRequest = parsed.data;
                }
                if (parsed.event === 'error') {
                   updated.status = 'error';
                   updated.error = parsed.data;
                }
                if (parsed.event === 'done') {
                   updated.serverId = parsed.data.task_id;
                   updated.status = 'completed';
                }
                return updated;
              }));
              
            } catch (e) {
              console.error("Parse error", e);
            }
          }
        }
      }
      setLoading(false);
    } catch (error) {
      console.warn("Backend streaming unreachable, falling back to simulated engine...", error);
      runSimulatedAgent(taskId, currentInput);
    }
  };

  const handleFeedback = async (taskId, serverId, feedbackText) => {
    if (!feedbackText.trim()) return;
    
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'learning' } : t));
    
    if (apiUrl && isConnected && serverId) {
      try {
        await axios.post(`${apiUrl}/feedback`, { task_id: serverId, feedback: feedbackText });
      } catch (err) {
        console.error("Error submitting feedback", err);
      }
    }

    setTimeout(() => {
      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { ...t, status: 'completed', lessons: [...(t.lessons || []), `FEEDBACK ASSIMILATED: ${feedbackText}`] }
          : t
      ));
      setKnowledge(prev => [{
        id: Date.now().toString(),
        category: 'USER REINFORCEMENT',
        content: `Reinforced principle: ${feedbackText}`
      }, ...prev]);
    }, 800);
  };

  const approveTool = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && (!apiUrl || !isConnected)) {
      approveSimulatedTool(taskId);
    } else {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'executing', toolRequest: null } : t));
    }
  };

  const saveSettings = () => {
    setApiUrl(tempApiUrl.trim());
    localStorage.setItem('agent_api_url', tempApiUrl.trim());
    setIsSettingsOpen(false);
  };

  return (
    <div className='min-h-screen bg-canvas text-ink font-sans'>
      <TopNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        isConnected={isConnected}
      />

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className='fixed inset-0 bg-ink/70 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-canvas border-2 border-ink rounded-card p-8 max-w-[540px] w-full flex flex-col gap-6 shadow-2xl animate-fade-in'>
            <h3 className='text-[24px] font-[800] uppercase tracking-tight text-ink'>Backend API Settings</h3>
            <p className='text-body text-[14px] leading-relaxed'>
              Connect this web interface to your running FastAPI backend. If empty or unreachable, the application automatically runs in <strong>Standalone Mode</strong> with full interactive planning, tool approval, and memory simulation.
            </p>
            <div className='flex flex-col gap-2'>
              <label className='text-[12px] font-[800] text-ink uppercase tracking-wider'>API Base URL</label>
              <input 
                type="text" 
                value={tempApiUrl} 
                onChange={(e) => setTempApiUrl(e.target.value)} 
                placeholder="http://127.0.0.1:8000/api or https://your-tunnel.trycloudflare.com/api"
                className='h-[48px] px-4 border-2 border-ink rounded-card text-[14px] outline-none focus:border-brand font-mono'
              />
            </div>
            <div className='flex gap-4 justify-end mt-2'>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className='px-6 py-2.5 rounded-pill border border-mute text-body font-bold text-[14px] uppercase hover:border-ink hover:text-ink transition-colors'
              >
                Cancel
              </button>
              <button 
                onClick={saveSettings}
                className='px-6 py-2.5 rounded-pill bg-brand text-on-primary font-bold text-[14px] uppercase hover:bg-brand-active transition-colors'
              >
                Save & Connect
              </button>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'knowledge' ? (
        <KnowledgeView knowledge={knowledge} />
      ) : activeTab === 'history' ? (
        <HistoryView history={history} />
      ) : (
        <>
          {/* Dark Hero Band - Only visible when empty */}
          {tasks.length === 0 && (
            <div className='bg-ink text-on-dark px-6 py-16 lg:py-24 lg:px-12 flex items-center justify-center relative overflow-hidden'>
              <h1 className='text-[60px] md:text-[80px] lg:text-[100px] font-[800] leading-[0.9] tracking-[-1.5px] uppercase text-center relative z-10'>
                SELF-LEARNING<br/>AGENT.
              </h1>
              {/* Faint Red Orb in Background */}
              <div className='absolute bg-brand w-[400px] h-[400px] rounded-full blur-[80px] opacity-20 -top-10 -right-10 z-0'></div>
            </div>
          )}
          
          <main className={`max-w-[1400px] mx-auto px-6 lg:px-12 ${tasks.length === 0 ? 'py-16' : 'py-12'} flex flex-col lg:flex-row gap-12`}>
            
            {/* Left Column: Task Thread */}
            <div className='flex-1 flex flex-col gap-16 pb-40'>
              
              {tasks.length > 0 && tasks.map(task => (
                <div key={task.id} className='flex flex-col gap-8 animate-fade-in'>
                  {/* User Prompt */}
                  <h2 className='text-[24px] md:text-[32px] font-[300] leading-tight text-ink'>
                    {task.prompt}
                  </h2>
                  
                  {/* Execution Cards */}
                  <div className='flex flex-col gap-6 border-l-[3px] border-ink pl-6 py-2'>
                    
                    {/* Status Badge */}
                    <div className='flex items-center gap-3'>
                        <span className='font-[800] text-[14px] uppercase tracking-wide text-ink flex items-center gap-2'>
                          {task.status.replace('_', ' ')}
                          {['starting', 'retrieving', 'planning', 'executing', 'evaluating'].includes(task.status) && <LoaderIcon />}
                        </span>
                    </div>

                    {/* Planning Phase */}
                    {task.plan && task.plan.length > 0 && (
                      <div className='bg-canvas-soft rounded-card p-6 border border-mute'>
                        <ol className='list-decimal list-inside space-y-3 text-[16px] text-ink font-[400]'>
                          {task.plan.map((p, i) => (
                            <li key={i}>{p.description}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Tool Approval Phase (HITL) */}
                    {task.status === 'waiting_approval' && task.toolRequest && (
                      <div className='bg-[#fff3f3] border-2 border-brand rounded-card p-6 flex flex-col gap-4 animate-fade-in'>
                        <div className='flex items-center justify-between'>
                          <h4 className='text-brand font-[800] text-[16px] uppercase tracking-wider'>Human-In-The-Loop Approval Required</h4>
                          <span className='bg-brand text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase'>Action Required</span>
                        </div>
                        <p className='text-ink text-[16px]'>The autonomous agent requested permission to run: <strong>{task.toolRequest.tool}</strong></p>
                        <p className='text-body text-[14px]'>Reason: {task.toolRequest.reason}</p>
                        <div className='flex gap-4 mt-2'>
                          <button onClick={() => approveTool(task.id)} className='bg-brand text-on-primary rounded-pill px-6 py-2 font-bold uppercase hover:opacity-90 shadow-sm'>
                            Approve Execution
                          </button>
                          <button onClick={() => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'completed', response: 'Task execution stopped: Tool execution rejected by operator.' } : t))} className='border-2 border-brand text-brand rounded-pill px-6 py-2 font-bold uppercase hover:bg-brand hover:text-on-primary transition-colors'>
                            Reject
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Execution Phase */}
                    {task.response && (
                       <div className='bg-canvas rounded-card p-6 border border-mute text-[16px] text-ink font-[400] leading-relaxed whitespace-pre-wrap'>
                         {task.response}
                       </div>
                    )}
                    
                    {/* Learning Phase / Feedback */}
                    {task.response && task.status === 'completed' && (
                      <div className='flex flex-col gap-4 mt-4 bg-canvas-soft p-6 rounded-card border border-mute'>
                         {task.lessons && task.lessons.length > 0 && (
                           <div className='flex flex-wrap gap-2 mb-2'>
                             {task.lessons.map((lesson, idx) => (
                               <div key={idx} className='bg-canvas text-ink border border-ink rounded-pill px-4 py-1.5 text-[12px] font-[700] uppercase'>
                                 💡 {lesson.substring(0, 70)}...
                               </div>
                             ))}
                           </div>
                         )}
                         
                         <FeedbackInput 
                           taskId={task.id} 
                           serverId={task.serverId} 
                           onSubmit={handleFeedback}
                           isLearning={task.status === 'learning'}
                         />
                      </div>
                    )}

                    {task.error && (
                      <div className='text-on-primary text-[18px] font-[600] p-6 bg-brand rounded-card'>
                        {task.error}
                      </div>
                    )}

                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Right Column: Status Rail */}
            <div className='hidden lg:block w-[380px] shrink-0'>
              <div className='sticky top-[120px] bg-canvas border border-mute rounded-card p-8 flex flex-col gap-8'>
                <div className='flex items-center gap-3 mb-2'>
                  <div className='w-8 h-8 bg-brand rounded-sm flex items-center justify-center text-white'>
                    <QuoteIcon />
                  </div>
                  <h3 className='text-[24px] font-[800] text-ink uppercase tracking-tight'>SYSTEM STATUS</h3>
                </div>
                
                <div className='flex flex-col gap-0'>
                  <div className='flex items-center justify-between py-4 border-b border-mute'>
                     <span className='text-[16px] font-[400] text-body'>ENGINE</span>
                     <span className='text-[14px] font-[700] text-ink bg-canvas-soft px-3 py-1 rounded-pill'>
                       {isConnected ? 'LLAMA3.2 (LOCAL)' : 'AGENTIC SIMULATOR'}
                     </span>
                  </div>
                  <div className='flex items-center justify-between py-4 border-b border-mute'>
                     <span className='text-[16px] font-[400] text-body'>MEMORY STORE</span>
                     <span className='text-[14px] font-[700] text-ink flex items-center gap-2'>
                       <div className='w-2.5 h-2.5 rounded-full bg-brand'></div> ONLINE ({knowledge.length} MEMORIES)
                     </span>
                  </div>
                  <div className='flex items-center justify-between py-4 border-b border-mute'>
                     <span className='text-[16px] font-[400] text-body'>STATUS</span>
                     <span className='text-[14px] font-[700] text-brand flex items-center gap-2 uppercase'>
                        {loading ? <><LoaderIcon/> ACTIVE</> : 'STANDBY'}
                     </span>
                  </div>
                  <div className='flex items-center justify-between py-4'>
                     <span className='text-[16px] font-[400] text-body'>CONNECTION</span>
                     <button onClick={() => setIsSettingsOpen(true)} className='text-[12px] font-[700] underline uppercase text-body hover:text-ink'>
                       {isConnected ? 'LIVE BACKEND' : 'CONFIGURE API'}
                     </button>
                  </div>
                </div>

                <button className='w-full bg-canvas text-ink border border-ink py-4 rounded-pill font-[700] text-[16px] hover:bg-ink hover:text-on-dark transition-colors uppercase' onClick={() => setTasks([])}>
                  CLEAR THREAD
                </button>
              </div>
            </div>
            
          </main>

          {/* Global Input Bar */}
          <div className='fixed bottom-0 left-0 right-0 p-4 bg-canvas border-t border-mute z-40'>
            <div className='max-w-[1000px] mx-auto relative flex items-center gap-3'>
              <input
                type='text'
                className='flex-1 h-[52px] bg-canvas border-2 border-ink rounded-pill outline-none px-6 text-[16px] text-ink placeholder-mute font-[400] focus:border-brand transition-colors'
                placeholder='INITIATE TASK...'
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendTask()}
                disabled={loading}
              />
              <button 
                onClick={sendTask}
                disabled={loading || !input.trim()}
                className='h-[52px] px-8 rounded-pill bg-brand text-on-primary text-[16px] font-[700] tracking-wide uppercase hover:bg-brand-active transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px]'
              >
                {loading ? <LoaderIcon /> : 'EXECUTE'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const FeedbackInput = ({ taskId, serverId, onSubmit, isLearning }) => {
  const [val, setVal] = useState('');
  return (
    <div className='flex flex-col sm:flex-row gap-4 items-center'>
      <input 
        type='text'
        placeholder='PROVIDE REINFORCEMENT FEEDBACK...'
        className='flex-1 h-[48px] px-4 rounded-card border-2 border-ink bg-canvas text-[14px] outline-none focus:border-brand transition-colors placeholder-mute uppercase'
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" && val.trim()) {
            onSubmit(taskId, serverId, val);
            setVal('');
          }
        }}
        disabled={isLearning}
      />
      <button 
        onClick={() => { onSubmit(taskId, serverId, val); setVal(''); }}
        disabled={isLearning || !val.trim()}
        className='h-[48px] px-8 rounded-pill border-2 border-brand text-brand text-[14px] font-[700] uppercase hover:bg-brand hover:text-on-primary transition-colors flex items-center gap-2 disabled:opacity-50 shrink-0'
      >
        {isLearning ? <LoaderIcon /> : 'TRAIN'}
      </button>
    </div>
  );
};

export default App;
