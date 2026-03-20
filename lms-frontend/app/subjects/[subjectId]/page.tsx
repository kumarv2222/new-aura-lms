'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  BookOpen, PlayCircle, Users, Clock, ChevronRight, Star, 
  Monitor, List, ArrowLeft, Share2, Heart, Award, ShieldCheck, Zap
} from 'lucide-react';
import apiClient from '../../../lib/apiClient';
import Spinner from '../../../components/common/Spinner';
import AppShell from '../../../components/Layout/AppShell';

export default function SubjectOverviewPage() {
  const { subjectId } = useParams();
  const router = useRouter();
  const [subject, setSubject] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get(`/subjects/${subjectId}`),
      apiClient.get(`/progress/subjects/${subjectId}`).catch(() => null),
    ]).then(([subRes, progRes]) => {
      setSubject(subRes.data);
      setProgress(progRes?.data ?? null);
    }).finally(() => setLoading(false));
  }, [subjectId]);

  const startLearning = async () => {
    try {
      const { data } = await apiClient.get(`/subjects/${subjectId}/first-video`);
      router.push(`/subjects/${subjectId}/video/${data.id}`);
    } catch {
      router.push('/');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        size={14} 
        fill={i < Math.floor(rating) ? "#f0b429" : "transparent"} 
        className={i < Math.floor(rating) ? "text-gold" : "text-slate-border"} 
      />
    ));
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
       <div className="relative group">
          <div className="absolute -inset-1 bg-gold/30 rounded-full blur group-hover:opacity-50 transition duration-1000 animate-pulse" />
          <Spinner size={32} />
       </div>
       <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-text animate-pulse">Syncing Subject Data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-20">
      <AppShell />
      
      {/* Immersive Sub-header */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gold/5 blur-[150px] rounded-full -z-10" />
        <div className="max-w-7xl mx-auto flex flex-col items-start gap-8 animate-fade-up">
           <button onClick={() => router.push('/')} className="flex items-center gap-2 text-slate-text hover:text-white transition-all group">
             <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
             <span className="text-[11px] font-black uppercase tracking-[0.2em]">Return to Library</span>
           </button>
           
           <div className="flex flex-col gap-4">
              <div className="inline-flex px-3 py-1 rounded bg-gold/10 border border-gold/20 text-[10px] font-black uppercase tracking-[0.2em] text-gold w-fit">
                 Curriculum Overview • {subject?.category || 'Expert Course'}
              </div>
              <h1 className="font-serif text-5xl md:text-7xl text-white tracking-tight leading-tight max-w-4xl">{subject?.title}</h1>
           </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Main Artifact (Course Card) */}
          <div className="lg:col-span-8 flex flex-col gap-12">
             <div className="relative aspect-[21/9] rounded-[3rem] overflow-hidden border border-slate-border/50 group animate-fade-in shadow-2xl shadow-gold/5">
                <img 
                   src={subject?.thumbnail_url || `https://img.youtube.com/vi/${subject?.slug}/maxresdefault.jpg`} 
                   alt={subject?.title}
                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                   <div className="w-20 h-20 rounded-full bg-gold flex items-center justify-center text-black shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                      <PlayCircle size={40} />
                   </div>
                </div>
             </div>

             <div className="flex flex-col gap-10 animate-fade-up">
                <div className="flex items-center gap-3">
                   <ShieldCheck size={20} className="text-gold" />
                   <h3 className="font-serif text-2xl text-white">The Course Philosophy</h3>
                </div>
                <div className="text-slate-text text-lg leading-relaxed italic max-w-3xl border-l-2 border-gold/20 pl-8">
                   {subject?.description || 'Curating an elite path towards digital mastery. This curriculum has been rigorously structured for high-impact result transfer.'}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8 border-t border-slate-border/10">
                   <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2 text-gold">
                         <Zap size={16} />
                         <span className="text-[10px] font-black uppercase tracking-widest">Core Insights</span>
                      </div>
                      <ul className="flex flex-col gap-4 text-sm text-slate-text">
                         <li className="flex items-center gap-3"><ChevronRight size={14} className="text-gold/40" /> Industry-recognized methodologies</li>
                         <li className="flex items-center gap-3"><ChevronRight size={14} className="text-gold/40" /> Peer-reviewed curriculum</li>
                         <li className="flex items-center gap-3"><ChevronRight size={14} className="text-gold/40" /> Interactive knowledge checks</li>
                      </ul>
                   </div>
                   <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2 text-gold">
                         <Award size={16} />
                         <span className="text-[10px] font-black uppercase tracking-widest">Achievements</span>
                      </div>
                      <ul className="flex flex-col gap-4 text-sm text-slate-text">
                         <li className="flex items-center gap-3"><ChevronRight size={14} className="text-gold/40" /> Verified Course Badge</li>
                         <li className="flex items-center gap-3"><ChevronRight size={14} className="text-gold/40" /> Digital Certificate upon completion</li>
                         <li className="flex items-center gap-3"><ChevronRight size={14} className="text-gold/40" /> Portfolio-ready case studies</li>
                      </ul>
                   </div>
                </div>
             </div>
          </div>

          {/* Side Info / Register (Sidebar) */}
          <div className="lg:col-span-4 flex flex-col gap-8 animate-fade-left">
             <div className="glass-card p-10 rounded-[2.5rem] border border-slate-border/50 sticky top-24 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl pointer-events-none" />
                
                <h4 className="font-serif text-2xl text-white mb-8 border-b border-slate-border/20 pb-6 uppercase tracking-tight">Investiture</h4>
                
                <div className="flex flex-col gap-8 mb-10">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-glass border border-slate-border flex items-center justify-center text-gold">
                         <Monitor size={20} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-text opacity-60">Curator</p>
                         <p className="text-white font-bold">{subject?.instructor_name || 'Aura Expert'}</p>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-glass border border-slate-border flex items-center justify-center text-gold">
                         <Star size={20} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-text opacity-60">Evaluation</p>
                         <p className="text-white font-bold flex items-center gap-2">
                            {subject?.rating || '4.9'} {renderStars(4.9)}
                         </p>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="flex flex-col gap-1">
                         <p className="text-[9px] font-black uppercase tracking-widest text-slate-text opacity-60 flex items-center gap-2"><Clock size={10} /> Time</p>
                         <p className="text-white font-bold text-xs uppercase">{subject?.duration_weeks || 8} Weeks</p>
                      </div>
                      <div className="flex flex-col gap-1">
                         <p className="text-[9px] font-black uppercase tracking-widest text-slate-text opacity-60 flex items-center gap-2"><List size={10} /> Sessions</p>
                         <p className="text-white font-bold text-xs uppercase">{subject?.total_lessons || 12} Lessons</p>
                      </div>
                   </div>
                </div>

                {/* Progress Visualizer if Enrolled */}
                {progress && progress.percent_complete > 0 && (
                  <div className="mb-10 p-5 rounded-2xl bg-gold/5 border border-gold/10 backdrop-blur-sm animate-fade-in">
                    <div className="flex items-center justify-between mb-3 text-[10px] font-black uppercase tracking-widest">
                       <span className="text-gold">Your Progress</span>
                       <span className="text-white">{progress.percent_complete}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-border/30 rounded-full overflow-hidden">
                       <div className="h-full bg-gold shadow-[0_0_15px_rgba(240,180,41,0.5)] transition-all duration-1000" style={{ width: `${progress.percent_complete}%` }} />
                    </div>
                  </div>
                )}

                <button 
                  onClick={startLearning}
                  className="w-full py-5 bg-gold rounded-2xl flex items-center justify-center gap-3 text-black font-bold uppercase tracking-widest text-[11px] hover:bg-gold-light transition-all shadow-2xl shadow-gold/20 scale-105"
                >
                  <PlayCircle size={18} />
                  {progress?.last_video_id ? 'Continue The Journey' : 'Begin The Mastery'}
                  <ChevronRight size={16} />
                </button>
                
                <p className="text-center text-[9px] font-bold text-slate-text uppercase tracking-widest mt-8 opacity-40">
                   Instant access upon enrollment
                </p>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
