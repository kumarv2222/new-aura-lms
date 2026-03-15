'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle2, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import AppShell from '../../components/Layout/AppShell';
import AuthGuard from '../../components/Auth/AuthGuard';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../lib/apiClient';
import Spinner from '../../components/common/Spinner';

interface SubjectProgress {
  id: number; title: string; slug: string;
  total_videos: number; completed_videos: number; percent_complete: number;
  last_video_id: number | null;
}

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [subjects, setSubjects] = useState<SubjectProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/subjects', { params: { pageSize: 50 } })
      .then(async ({ data }) => {
        const progPromises = data.subjects.map(async (s: any) => {
          try {
            const { data: prog } = await apiClient.get(`/progress/subjects/${s.id}`);
            return { ...s, ...prog };
          } catch {
            return { ...s, total_videos: 0, completed_videos: 0, percent_complete: 0, last_video_id: null };
          }
        });
        const results = await Promise.all(progPromises);
        setSubjects(results.filter((s: SubjectProgress) => s.completed_videos > 0 || s.total_videos > 0));
      })
      .finally(() => setLoading(false));
  }, []);

  const totalCompleted = subjects.reduce((a, s) => a + s.completed_videos, 0);
  const totalVideos = subjects.reduce((a, s) => a + s.total_videos, 0);
  const avgProgress = subjects.length > 0
    ? Math.round(subjects.reduce((a, s) => a + s.percent_complete, 0) / subjects.length) : 0;

  return (
    <AuthGuard>
      <div className="min-h-screen" style={{ background: '#0a0a0f' }}>
        <AppShell />

        <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">
          {/* Header */}
          <div className="mb-10 animate-fade-up">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold"
                style={{ background: 'linear-gradient(135deg, #f0b429, #c9922a)', color: '#0a0a0f' }}>
                {user?.email?.[0]?.toUpperCase()}
              </div>
              <div>
                <h1 className="section-heading text-2xl text-white">{user?.email?.split('@')[0]}</h1>
                <p className="text-sm text-slate-text">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { label: 'Courses enrolled', value: subjects.length, icon: BookOpen, color: '#f0b429' },
              { label: 'Lessons done', value: totalCompleted, icon: CheckCircle2, color: '#00c9a7' },
              { label: 'Avg. progress', value: `${avgProgress}%`, icon: TrendingUp, color: '#7c5fe6' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="glass rounded-2xl p-5 animate-fade-up">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <div className="text-2xl font-semibold text-white mb-1">{value}</div>
                <div className="text-xs text-slate-text">{label}</div>
              </div>
            ))}
          </div>

          {/* Course progress list */}
          <h2 className="section-heading text-xl text-white mb-5">Your courses</h2>

          {loading ? (
            <div className="flex justify-center py-12"><Spinner size={28} /></div>
          ) : subjects.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <BookOpen size={32} className="text-slate-text mx-auto mb-4 opacity-40" />
              <p className="text-slate-text mb-4">No courses started yet</p>
              <Link href="/" className="btn-gold inline-flex items-center gap-2 text-sm">
                Browse courses <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {subjects.map((s, i) => (
                <div key={s.id} className="glass-hover rounded-2xl p-5 animate-fade-up flex items-center gap-5"
                  style={{ animationDelay: `${i * 0.05}s`, animationFillMode: 'both' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(240,180,41,0.1)', border: '1px solid rgba(240,180,41,0.2)' }}>
                    <BookOpen size={16} className="text-gold" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-white truncate">{s.title}</h3>
                      <span className="text-xs font-medium ml-4 shrink-0" style={{ color: s.percent_complete === 100 ? '#00c9a7' : '#f0b429' }}>
                        {s.percent_complete}%
                      </span>
                    </div>
                    <div className="progress-bar h-1.5 mb-1.5">
                      <div className="progress-fill h-full" style={{ width: `${s.percent_complete}%` }} />
                    </div>
                    <p className="text-xs text-slate-text">{s.completed_videos}/{s.total_videos} lessons</p>
                  </div>

                  <Link href={s.last_video_id ? `/subjects/${s.id}/video/${s.last_video_id}` : `/subjects/${s.id}`}
                    className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium glass-hover"
                    style={{ color: '#f0b429' }}>
                    Continue <ArrowRight size={12} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
