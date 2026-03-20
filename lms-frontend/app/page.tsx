'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, BookOpen, Users, Zap, ArrowRight, Star, PlayCircle, 
  ChevronRight, Sparkles, Monitor, Clock, List, CreditCard, Landmark, Wallet, ShieldCheck, Award
} from 'lucide-react';
import AppShell from '../components/Layout/AppShell';
import apiClient from '../lib/apiClient';
import Spinner from '../components/common/Spinner';
import { useAuthStore } from '../store/authStore';

interface Subject {
  id: number; title: string; slug: string; description: string;
  thumbnail_url?: string; instructor_name?: string; instructor_channel?: string;
  category?: string; level?: string; duration_weeks?: number;
  rating?: number | string; total_lessons?: number; is_free?: boolean;
}

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }).map((_, i) => (
    <Star key={i} size={10} fill={i < Math.floor(rating) ? "#f0b429" : "transparent"} className={i < Math.floor(rating) ? "text-gold" : "text-slate-border"} />
  ));
};

function SubjectCard({ subject, index }: { subject: Subject; index: number }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  
  const categoryColors: Record<string, string> = {
    'Python': '#3776ab', 'Web Dev': '#7c5fe6', 'Data Science': '#00c9a7',
    'AI & ML': '#ff9f43', 'DSA': '#2ecc71', 'SAP': '#008fd3', 'App Dev': '#ff4d6d'
  };
  const categoryColor = categoryColors[subject.category || ''] || '#f0b429';

  const handleEnroll = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    isAuthenticated ? router.push(`/subjects/${subject.id}`) : router.push('/auth/register');
  };

  return (
    <Link href={`/subjects/${subject.id}`}
      className="group relative flex flex-col glass-card rounded-2xl overflow-hidden animate-fade-up border border-slate-border/50 hover:border-gold/30 transition-all duration-500 hover:shadow-2xl hover:shadow-gold/5"
      style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}>
      
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={subject.thumbnail_url || `https://img.youtube.com/vi/${subject.slug}/maxresdefault.jpg`} 
          alt={subject.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-80" />
        <div className="absolute top-4 left-4 inline-flex px-2 py-0.5 rounded bg-black/80 border border-gold/20 text-[8px] font-black uppercase tracking-[0.2em] text-gold">
           {subject.category || 'Expert'}
        </div>
        <div className={`absolute top-4 right-4 px-2 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider ${subject.total_lessons === 0 ? 'text-slate-text border-slate-border/20' : 'text-white'}`}>
          {subject.total_lessons === 0 ? (
            <>
              <Clock size={10} className="text-slate-text" /> 
              Coming Soon
            </>
          ) : (
            <>
              <List size={10} strokeWidth={3} className="text-gold" />
              {subject.total_lessons} Lessons
            </>
          )}
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-14 h-14 rounded-full bg-gold flex items-center justify-center text-black shadow-2xl scale-75 group-hover:scale-100 transition-transform">
            <PlayCircle size={32} />
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1 gap-4">
        <h3 className="font-serif text-xl tracking-tight leading-tight text-white group-hover:text-gold transition-colors line-clamp-2 h-12">
          {subject.title}
        </h3>

        <div className="flex items-center gap-2 text-slate-text">
          <div className="w-6 h-6 rounded-full bg-slate-glass border border-slate-border flex items-center justify-center text-[10px] font-bold text-gold">
             {subject.instructor_name?.[0]}
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest opacity-80">{subject.instructor_name || 'Aura Expert'}</span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-border/20">
           <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">{renderStars(Number(subject.rating) || 4.5)}</div>
              <span className="text-[10px] font-bold text-white/50">{subject.rating}</span>
           </div>
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-slate-text">
                 <Clock size={12} className="text-gold/50" />
                 <span className="text-[10px] font-bold tracking-tighter">{subject.duration_weeks || 8}W</span>
              </div>
              <button 
                onClick={handleEnroll}
                className="w-8 h-8 rounded-lg bg-gold text-black flex items-center justify-center hover:bg-gold-light transition-all shadow-lg shadow-gold/10"
              >
                <ArrowRight size={14} />
              </button>
           </div>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Courses');
  const [total, setTotal] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const categories = ["All Courses", "Python", "Web Dev", "Data Science", "SAP", "App Dev", "AI & ML", "DSA"];

  useEffect(() => {
    timerRef.current = setTimeout(() => setDebouncedQ(query), 400);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  useEffect(() => {
    setLoading(true);
    apiClient.get('/subjects', { 
      params: { 
        q: debouncedQ || undefined, 
        category: activeCategory !== 'All Courses' ? activeCategory : undefined,
        pageSize: 24 
      } 
    })
      .then(({ data }) => { setSubjects(data.subjects); setTotal(data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [debouncedQ, activeCategory]);



  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      <AppShell />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 text-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/p6.png')] opacity-10 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gold/5 blur-[160px] rounded-full -z-10" />
        
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-10 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-[10px] font-black uppercase tracking-[0.2em] text-gold">
            <Sparkles size={12} />
            The Gold Standard of Learning
          </div>
          <h1 className="font-serif text-7xl md:text-9xl text-white leading-[1.05] tracking-tight">
            Master the <br /> <span className="text-gold italic">Digital Arts.</span>
          </h1>
          <p className="text-xl text-slate-text max-w-2xl leading-relaxed italic">
            &ldquo;Premium knowledge, zero barriers. Access a curated library of industry-leading curricula from the world&rsquo;s most innovative minds.&rdquo;
          </p>
          <div className="flex flex-col items-center gap-5 pt-2">
            <Link href="/auth/register" className="px-12 py-5 bg-gold rounded-2xl text-black font-bold uppercase tracking-widest text-[12px] hover:bg-gold-light transition-all shadow-2xl shadow-gold/20">
              Get Started Free
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-slate-glass overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" className="w-full h-full object-cover grayscale" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-black bg-gold flex items-center justify-center text-[10px] font-black text-black">
                  50K+
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-text">Active Learners</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges / Partners */}
      <section className="py-12 border-y border-slate-border/10 bg-black/30">
        <div className="max-w-7xl mx-auto px-6 overflow-hidden">
           <p className="text-center text-[9px] font-bold uppercase tracking-[0.3em] text-slate-text mb-8 opacity-40">Trusted by learners at</p>
           <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-30 grayscale contrast-125">
              {['Microsoft', 'Google', 'Amazon', 'Meta', 'Netflix', 'Airbnb'].map(name => (
                <span key={name} className="font-serif text-2xl font-bold italic text-white hover:opacity-100 hover:grayscale-0 transition-all cursor-default">{name}</span>
              ))}
           </div>
        </div>
      </section>

      {/* Marketplace Section */}
      <section id="marketplace" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                 <ShieldCheck size={20} className="text-gold" />
                 <h2 className="font-serif text-4xl text-white">Expert-Led Curriculum</h2>
              </div>
              <p className="text-slate-text max-w-md italic">Filter through thousands of lessons curated for professional mastery.</p>
            </div>
            
            {/* Search + Cat Controls */}
            <div className="flex flex-col md:flex-row items-center gap-4">
               <div className="relative group">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-text group-hover:text-gold transition-colors" />
                  <input
                    type="text"
                    placeholder="Search curriculum..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="bg-slate-glass border border-slate-border/50 rounded-2xl pl-12 pr-6 py-4 text-sm text-white placeholder:text-slate-border focus:outline-none focus:border-gold/30 transition-all w-full md:w-[320px]"
                  />
               </div>
            </div>
          </div>

          {/* Categories Tab Pill */}
          <div className="flex items-center gap-2 overflow-x-auto pb-8 no-scrollbar scroll-smooth">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 transform border ${
                  activeCategory === cat 
                  ? 'bg-gold text-black border-gold shadow-lg shadow-gold/10' 
                  : 'bg-transparent text-slate-text border-slate-border/50 hover:border-gold/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
              <Spinner size={32} />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-text animate-pulse">Filtering Database...</p>
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-32 glass-card rounded-[2rem] border border-slate-border/30">
              <BookOpen size={48} className="text-slate-text mx-auto mb-6 opacity-20" />
              <h3 className="text-2xl text-white font-serif mb-2">No matching curricula found</h3>
              <p className="text-slate-text italic">Refine your search parameters or try another category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {subjects.map((s, i) => <SubjectCard key={s.id} subject={s} index={i} />)}
            </div>
          )}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 bg-gradient-to-t from-gold/5 to-transparent relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center animate-fade-up">
           <Award size={48} className="text-gold mx-auto mb-8 animate-bounce" />
           <h2 className="font-serif text-5xl md:text-7xl text-white mb-8">Ready to evolve?</h2>
           <p className="text-xl text-slate-text mb-12 italic">"The elite don't wait for permission. They start learning."</p>
           <Link href="/auth/register" className="px-12 py-5 bg-gold rounded-2xl text-black font-bold uppercase tracking-widest text-[12px] hover:bg-gold-light transition-all shadow-2xl shadow-gold/20">
              Join the Academy
           </Link>
        </div>
      </section>
    </div>
  );
}
