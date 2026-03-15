'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { BookOpen, PlayCircle, Users, Clock, ChevronRight } from 'lucide-react';
import apiClient from '../../../lib/apiClient';
import Spinner from '../../../components/common/Spinner';

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

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]"><Spinner size={32} /></div>
  );

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="glass rounded-2xl p-8 text-center animate-fade-up" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'linear-gradient(135deg, rgba(240,180,41,0.2), rgba(240,180,41,0.05))', border: '1px solid rgba(240,180,41,0.3)' }}>
          <BookOpen size={28} className="text-gold" />
        </div>

        <h1 className="section-heading text-3xl text-white mb-3">{subject?.title}</h1>
        {subject?.description && (
          <p className="text-slate-text text-sm leading-relaxed mb-8 max-w-md mx-auto">{subject.description}</p>
        )}

        {progress && (
          <div className="mb-8 p-4 rounded-xl" style={{ background: 'rgba(240,180,41,0.05)', border: '1px solid rgba(240,180,41,0.1)' }}>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-text">Your progress</span>
              <span className="text-gold font-medium">{progress.percent_complete}%</span>
            </div>
            <div className="progress-bar h-2">
              <div className="progress-fill h-full" style={{ width: `${progress.percent_complete}%` }} />
            </div>
            <p className="text-xs text-slate-text mt-2">{progress.completed_videos} of {progress.total_videos} lessons completed</p>
          </div>
        )}

        <button onClick={startLearning}
          className="btn-gold w-full flex items-center justify-center gap-2 py-3.5 text-sm">
          <PlayCircle size={16} />
          {progress?.last_video_id ? 'Continue learning' : 'Start learning'}
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
