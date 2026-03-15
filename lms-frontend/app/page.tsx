'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Search, BookOpen, Users, Zap, ArrowRight, Star, PlayCircle, ChevronRight, Sparkles } from 'lucide-react';
import AppShell from '../components/Layout/AppShell';
import apiClient from '../lib/apiClient';
import Spinner from '../components/common/Spinner';

interface Subject {
  id: number; title: string; slug: string; description: string; thumbnail_url?: string;
}

function SubjectCard({ subject, index }: { subject: Subject; index: number }) {
  const colors = [
    { from: '#f0b429', to: '#c9922a' },
    { from: '#00c9a7', to: '#009e84' },
    { from: '#7c5fe6', to: '#5a42c7' },
    { from: '#ff4d6d', to: '#cc3d57' },
    { from: '#00a8e8', to: '#0077b6' },
    { from: '#ff9f43', to: '#e07b24' },
  ];
  const color = colors[index % colors.length];

  return (
    <Link href={`/subjects/${subject.id}`}
      className="group relative glass-hover rounded-2xl overflow-hidden p-6 flex flex-col gap-4 animate-fade-up"
      style={{ animationDelay: `${index * 0.08}s`, animationFillMode: 'both' }}>

      {/* Accent bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 opacity-60"
        style={{ background: `linear-gradient(90deg, ${color.from}, ${color.to})` }} />

      {/* Icon */}
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `linear-gradient(135deg, ${color.from}22, ${color.to}11)`, border: `1px solid ${color.from}33` }}>
        <BookOpen size={22} style={{ color: color.from }} />
      </div>

      <div className="flex-1">
        <h3 className="section-heading text-lg text-white mb-2 group-hover:text-gold transition-colors">
          {subject.title}
        </h3>
        {subject.description && (
          <p className="text-sm text-slate-text leading-relaxed line-clamp-2">{subject.description}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="tag">Free</span>
        <span className="flex items-center gap-1 text-xs font-medium transition-all group-hover:gap-2"
          style={{ color: color.from }}>
          Start learning <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [total, setTotal] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    timerRef.current = setTimeout(() => setDebouncedQ(query), 400);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  useEffect(() => {
    setLoading(true);
    apiClient.get('/subjects', { params: { q: debouncedQ || undefined, pageSize: 24 } })
      .then(({ data }) => { setSubjects(data.subjects); setTotal(data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [debouncedQ]);

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f' }}>
      <AppShell />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(ellipse, rgba(240,180,41,0.3) 0%, transparent 70%)', filter: 'blur(60px)' }} />
          <div className="absolute inset-0 bg-grid-pattern" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-medium animate-fade-in"
            style={{ background: 'rgba(240,180,41,0.1)', border: '1px solid rgba(240,180,41,0.25)', color: '#f0b429' }}>
            <Sparkles size={11} />
            Structured learning — your way
          </div>

          <h1 className="section-heading text-5xl md:text-7xl text-white mb-6 animate-fade-up"
            style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            Master Any Skill
            <br />
            <span style={{ background: 'linear-gradient(135deg, #f0b429, #ffe08a, #f0b429)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200% 100%', animation: 'shimmer 3s linear infinite' }}>
              Without Limits
            </span>
          </h1>

          <p className="text-lg text-slate-text max-w-xl mx-auto mb-10 animate-fade-up"
            style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            Curated courses with video lessons, progress tracking, and intelligent sequencing that unlocks content as you learn.
          </p>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-8 mb-12 animate-fade-up"
            style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
            {[
              { icon: BookOpen, label: `${total}+ Courses` },
              { icon: Users, label: 'Free forever' },
              { icon: Zap, label: 'Track progress' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-slate-text">
                <Icon size={14} className="text-gold" />
                {label}
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative max-w-lg mx-auto animate-fade-up"
            style={{ animationDelay: '0.35s', animationFillMode: 'both' }}>
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-text pointer-events-none" />
            <input
              type="text"
              placeholder="Search courses..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-field pl-10 pr-4 text-sm"
              style={{ height: '48px', borderRadius: '12px' }}
            />
          </div>
        </div>
      </section>

      {/* Course grid */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-heading text-2xl text-white">
              {debouncedQ ? `Results for "${debouncedQ}"` : 'All Courses'}
            </h2>
            <p className="text-sm text-slate-text mt-1">{total} courses available</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><Spinner size={32} /></div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen size={40} className="text-slate-text mx-auto mb-4 opacity-40" />
            <p className="text-slate-text">No courses found. Try a different search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {subjects.map((s, i) => <SubjectCard key={s.id} subject={s} index={i} />)}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-border py-8 px-6 text-center text-xs text-slate-text">
        <p>© {new Date().getFullYear()} Aura LMS — Built with Next.js, Express, MySQL</p>
      </footer>
    </div>
  );
}
