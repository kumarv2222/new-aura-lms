'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, Loader2, Maximize2, Trash2, Cpu, Zap } from 'lucide-react';
import apiClient from '../../lib/apiClient';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const PRESET_HINTS = [
  "Explain Big O notation in simple terms",
  "How do I build a REST API in Python?",
  "Tips for mastering DSA interview questions"
];

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Hello! I am your AI Knowledge Engine. I can help you understand concepts, debug code, or plan your learning path. What is on your mind today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load chat history
    apiClient.get('/ai/history')
      .then(({ data }) => {
        if (data.history?.length > 0) {
          setMessages(data.history.map((h: any) => ({ 
            role: h.role === 'user' ? 'user' : 'ai', 
            text: h.content 
          })));
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
       scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, loading]);

  const handleSend = async (customMsg?: string) => {
    const userMsg = (customMsg || input).trim();
    if (!userMsg || loading) return;

    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await apiClient.post('/ai/chat', { message: userMsg });
      setMessages(prev => [...prev, { role: 'ai', text: data.response }]);
    } catch (err: any) {
      const errorMsg = err.response?.status === 503 
        ? "The AI neural net is currently initializing. This usually takes 20-30 seconds. Please try again shortly!"
        : "I'm having trouble connecting to my cognitive center. Please check your connection and try again.";
      setMessages(prev => [...prev, { role: 'ai', text: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[750px] bg-[#0d0d12] border border-slate-border/40 rounded-[2.5rem] shadow-3xl overflow-hidden relative group">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 bg-gold/5 blur-[120px] opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity duration-1000" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gold/5 blur-[160px] -z-10 pointer-events-none" />

      {/* Header */}
      <div className="px-10 py-8 border-b border-slate-border/10 bg-black/40 backdrop-blur-3xl flex items-center justify-between relative z-20">
        <div className="flex items-center gap-5">
          <div className="relative">
             <div className="absolute inset-0 bg-gold/40 blur-xl animate-pulse rounded-full opacity-30" />
             <div className="w-14 h-14 rounded-2xl bg-gold flex items-center justify-center text-black shadow-2xl shadow-gold/30 group-hover:rotate-6 transition-transform">
               <Bot size={28} />
             </div>
             <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-black" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-serif text-2xl text-white tracking-tight">Cognitive Assistant</h3>
            <div className="flex items-center gap-3">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gold">Online</span>
               <div className="w-1 h-1 rounded-full bg-gold/30" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-text/40">v3.5 Final</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="hidden lg:flex items-center gap-4 bg-slate-glass/50 px-5 py-2.5 rounded-2xl border border-slate-border/10">
              <Cpu size={14} className="text-gold" />
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">Neural Link Active</span>
           </div>
           <button className="p-3 rounded-xl bg-slate-glass border border-slate-border/20 text-slate-text/60 hover:text-gold hover:border-gold/30 transition-all">
              <Maximize2 size={18} />
           </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-10 space-y-10 flex flex-col no-scrollbar relative z-10">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}>
            <div className={`flex gap-6 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center border shadow-lg ${
                msg.role === 'user' 
                ? 'bg-[#1a1a24] border-slate-border/20 text-white shadow-black/20' 
                : 'bg-gold/10 border-gold/20 text-gold shadow-gold/5'
              }`}>
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className="flex flex-col gap-3">
                 <div className={`px-7 py-5 rounded-[2rem] text-[15px] leading-[1.8] tracking-wide transform transition-all ${
                   msg.role === 'user' 
                   ? 'bg-gold text-black font-semibold rounded-tr-none shadow-xl shadow-gold/5' 
                   : 'bg-slate-glass border border-slate-border/30 text-slate-text rounded-tl-none backdrop-blur-xl'
                 }`}>
                   {msg.text}
                 </div>
                 {msg.role === 'ai' && (
                    <div className="flex items-center gap-4 px-2 opacity-40 hover:opacity-100 transition-opacity">
                       <button className="text-[10px] font-black uppercase tracking-widest text-slate-text hover:text-gold">Like</button>
                       <button className="text-[10px] font-black uppercase tracking-widest text-slate-text hover:text-gold">Copy</button>
                    </div>
                 )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-fade-in">
             <div className="flex gap-6 max-w-[85%]">
                <div className="shrink-0 w-10 h-10 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
                   <Bot size={18} />
                </div>
                <div className="px-8 py-5 rounded-[2rem] rounded-tl-none bg-slate-glass border border-slate-border/30 flex items-center gap-4">
                   <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce delay-100" />
                      <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce delay-200" />
                      <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce delay-300" />
                   </div>
                   <span className="text-[11px] font-black uppercase tracking-wider text-gold/60">Processing Neural Signals</span>
                </div>
             </div>
          </div>
        )}
        <div ref={scrollRef} className="h-4" />
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && !loading && (
        <div className="px-10 py-6 overflow-x-auto scroller-hide animate-fade-in relative z-20">
           <div className="flex items-center gap-4 whitespace-nowrap">
              {PRESET_HINTS.map((hint, i) => (
                 <button 
                  key={i}
                  onClick={() => handleSend(hint)}
                  className="px-6 py-3 rounded-xl bg-slate-glass border border-slate-border/20 text-slate-text/60 text-xs font-semibold hover:border-gold/30 hover:text-gold hover:bg-gold/5 transition-all"
                 >
                   {hint}
                 </button>
              ))}
           </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-10 border-t border-slate-border/10 bg-black/40 backdrop-blur-3xl relative z-20">
        <div className="relative group max-w-4xl mx-auto">
          <div className="absolute inset-x-0 bottom-0 top-0 bg-gold/5 blur-2xl opacity-0 group-focus-within:opacity-100 transition-all rounded-3xl" />
          <input
            type="text"
            placeholder="Type your cognitive query here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="w-full bg-[#12121a] border border-slate-border/30 rounded-3xl pl-8 pr-20 py-7 text-base text-white placeholder:text-slate-border/40 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all relative z-10"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3 z-20">
              <button 
               onClick={() => handleSend()}
               disabled={loading || !input.trim()}
               className="p-4 bg-gold text-black rounded-2xl hover:bg-white hover:scale-105 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed shadow-2xl shadow-gold/20"
              >
                <Zap size={22} fill="currentColor" />
              </button>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center gap-10 opacity-30">
           <div className="flex items-center gap-2">
              <Zap size={10} className="text-gold" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-text">Inference Optimized</span>
           </div>
           <div className="flex items-center gap-2">
              <Bot size={10} className="text-gold" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-text">Llama-3 Architecture</span>
           </div>
        </div>
      </div>
    </div>
  );
}
