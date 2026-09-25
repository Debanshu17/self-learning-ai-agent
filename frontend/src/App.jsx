import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './index.css';

const API_URL = 'http://127.0.0.1:8000/api';

// --- SVG Icons ---
const SearchIcon = () => (
  <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round'>
    <circle cx='11' cy='11' r='8'></circle>
    <line x1='21' y1='21' x2='16.65' y2='16.65'></line>
  </svg>
);

const CheckIcon = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round'>
    <polyline points='20 6 9 17 4 12'></polyline>
  </svg>
);

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

// --- Components ---
const TopNav = ({ activeTab, setActiveTab }) => {
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
      </div>
      
      <nav className='hidden md:flex gap-8'>
        <button onClick={() => setActiveTab('workspace')} className={getTabClass('workspace')}>Workspace</button>
        <button onClick={() => setActiveTab('knowledge')} className={getTabClass('knowledge')}>Knowledge</button>
      </nav>
      
      <div className='flex items-center gap-4'>
        <button className='border border-on-dark text-on-dark rounded-pill px-5 py-1.5 text-[12px] font-bold uppercase tracking-wider hover:bg-on-dark hover:text-ink transition-colors'>
          Sign Out
        </button>
      </div>
    </header>
  );
};

const KnowledgeView = () => {
  const [knowledge, setKnowledge] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(API_URL + "/knowledge")
      .then(res => { setKnowledge(res.data.knowledge || []); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  if (loading) return <div className="p-12 text-center text-ink"><LoaderIcon /></div>;

  return (
    <div className='max-w-[1000px] mx-auto px-6 py-12'>
      <h2 className='text-[32px] font-[800] uppercase tracking-tight text-ink mb-8 border-b-2 border-brand inline-block pb-2'>System Knowledge Base</h2>
      <div className='flex flex-col gap-4'>
        {knowledge.length === 0 ? (
          <div className='text-body text-[18px]'>No memories recorded yet. The agent will learn automatically during task execution.</div>
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

function App() {
  const [activeTab, setActiveTab] = useState('workspace');
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("Search the web for 'Agentic AI Architecture', summarize the core components, calculate how many core elements there are, and extract a lesson on how to build one.");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (activeTab === 'workspace') {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [tasks, activeTab]);

  const sendTask = async () => {
    if (!input.trim() || loading) return;
    
    const newTask = {
      id: Date.now().toString(),
      prompt: input,
      status: 'planning',
      plan: null,
      response: null,
      lessons: [],
      error: null
    };
    
    setTasks(prev => [...prev, newTask]);
    setInput('');
    setLoading(true);
    
    try {
      const res = await axios.post(API_URL + "/chat", { message: newTask.prompt });
      
      setTasks(prev => prev.map(t => 
        t.id === newTask.id 
          ? { ...t, status: 'completed', plan: res.data.plan, response: res.data.response, lessons: res.data.lessons, serverId: res.data.task_id }
          : t
      ));
    } catch (error) {
      setTasks(prev => prev.map(t => 
        t.id === newTask.id ? { ...t, status: 'error', error: 'Failed to communicate with agent.' } : t
      ));
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (taskId, serverId, feedbackText) => {
    if (!feedbackText.trim()) return;
    
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'learning' } : t));
    
    try {
      await axios.post(API_URL + "/feedback", { task_id: serverId, feedback: feedbackText });
      
      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { ...t, status: 'completed', lessons: [...(t.lessons || []), 'FEEDBACK ASSIMILATED.'] }
          : t
      ));
    } catch (error) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed' } : t));
      alert('Error submitting feedback');
    }
  };

  return (
    <div className='min-h-screen bg-canvas text-ink font-sans'>
      <TopNav activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {activeTab === 'knowledge' ? (
        <KnowledgeView />
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
                    
                    {/* Planning Phase */}
                    <div className='flex flex-col gap-4'>
                      <div className='flex items-center gap-3'>
                        <span className='font-[800] text-[14px] uppercase tracking-wide text-ink flex items-center gap-2'>
                          {task.plan ? 'PLAN EXECUTED' : (task.status === 'error' ? 'PLAN FAILED' : 'PLANNING')}
                          {task.status === 'planning' && <LoaderIcon />}
                        </span>
                      </div>
                      
                      {task.plan && (
                        <div className='bg-canvas-soft rounded-card p-6 border border-mute'>
                          <ol className='list-decimal list-inside space-y-3 text-[18px] text-ink font-[400]'>
                            {task.plan.map((p, i) => (
                              <li key={i}>{p.description}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>

                    {/* Execution Phase */}
                    {(task.plan || task.response || task.status === 'executing') && (
                       <div className='flex flex-col gap-4 mt-4'>
                         <div className='flex items-center gap-3'>
                           <span className='font-[800] text-[14px] uppercase tracking-wide text-ink flex items-center gap-2'>
                              {task.response ? 'RESULT' : 'EXECUTING'}
                              {task.status === 'executing' && <LoaderIcon />}
                           </span>
                         </div>
                         
                         {task.response && (
                           <div className='bg-canvas rounded-card p-6 border border-mute text-[16px] text-ink font-[400] leading-relaxed whitespace-pre-wrap'>
                             {task.response}
                           </div>
                         )}
                       </div>
                    )}
                    
                    {/* Learning Phase / Feedback */}
                    {task.response && (
                      <div className='flex flex-col gap-4 mt-4 bg-canvas-soft p-6 rounded-card border border-mute'>
                         {task.lessons && task.lessons.length > 0 && (
                           <div className='flex flex-wrap gap-2 mb-2'>
                             {task.lessons.map((lesson, idx) => (
                               <div key={idx} className='bg-canvas text-ink border border-ink rounded-pill px-4 py-1 text-[14px] font-[700]'>
                                 {lesson}
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
                     <span className='text-[18px] font-[400] text-body'>MODEL</span>
                     <span className='text-[16px] font-[700] text-ink bg-canvas-soft px-3 py-1 rounded-pill'>LLAMA3.2</span>
                  </div>
                  <div className='flex items-center justify-between py-4 border-b border-mute'>
                     <span className='text-[18px] font-[400] text-body'>MEMORY</span>
                     <span className='text-[16px] font-[700] text-ink flex items-center gap-2'>
                       <div className='w-3 h-3 rounded-full bg-brand'></div> ONLINE
                     </span>
                  </div>
                  <div className='flex items-center justify-between py-4'>
                     <span className='text-[18px] font-[400] text-body'>STATE</span>
                     <span className='text-[18px] font-[700] text-brand flex items-center gap-2 uppercase'>
                        {loading ? <><LoaderIcon/> ACTIVE</> : 'STANDBY'}
                     </span>
                  </div>
                </div>

                <button className='w-full bg-canvas text-ink border border-ink py-4 rounded-pill font-[700] text-[18px] hover:bg-ink hover:text-on-dark transition-colors uppercase' onClick={() => setTasks([])}>
                  CLEAR HISTORY
                </button>
              </div>
            </div>
            
          </main>

          {/* Global Input Bar */}
          <div className='fixed bottom-0 left-0 right-0 p-4 bg-canvas border-t border-mute'>
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
        placeholder='PROVIDE FEEDBACK...'
        className='flex-1 h-[48px] px-4 rounded-card border-2 border-ink bg-canvas text-[16px] outline-none focus:border-brand transition-colors placeholder-mute uppercase'
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
        className='h-[48px] px-8 rounded-pill border-2 border-brand text-brand text-[16px] font-[700] uppercase hover:bg-brand hover:text-on-primary transition-colors flex items-center gap-2 disabled:opacity-50'
      >
        {isLearning ? <LoaderIcon /> : 'TRAIN'}
      </button>
    </div>
  );
};

export default App;
