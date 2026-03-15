'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Lock, PlayCircle, ChevronDown, ChevronRight, Clock } from 'lucide-react';
import { useSidebarStore } from '../../store/sidebarStore';
import { useVideoStore } from '../../store/videoStore';
import apiClient from '../../lib/apiClient';
import clsx from 'clsx';

interface Props { subjectId: number; }

function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function SubjectSidebar({ subjectId }: Props) {
  const { sections, subjectTitle, isLoading, setSidebar, setLoading, setError } = useSidebarStore();
  const { currentVideoId } = useVideoStore();
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setLoading(true);
    apiClient.get(`/subjects/${subjectId}/tree`)
      .then(({ data }) => setSidebar(data.title, data.sections))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [subjectId]);

  const toggleSection = (id: number) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  const totalVideos = sections.reduce((acc, s) => acc + s.videos.length, 0);
  const completedVideos = sections.reduce((acc, s) => acc + s.videos.filter((v) => v.is_completed).length, 0);
  const pct = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

  if (isLoading) return (
    <div className="flex-1 p-4 space-y-3">
      {[1,2,3,4,5].map(i => (
        <div key={i} className="shimmer-line h-8 rounded-lg" style={{ animationDelay: `${i * 0.1}s` }} />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Subject Header */}
      <div className="px-4 py-4 border-b border-slate-border">
        <h2 className="section-heading text-base text-white leading-tight mb-3">{subjectTitle}</h2>
        <div className="flex items-center justify-between text-xs text-slate-text mb-2">
          <span>{completedVideos}/{totalVideos} lessons</span>
          <span className="text-gold font-medium">{pct}%</span>
        </div>
        <div className="progress-bar h-1.5">
          <div className="progress-fill h-full" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Section list */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
        {sections.map((section) => {
          const isOpen = !collapsed[section.id];
          const sectionCompleted = section.videos.every((v) => v.is_completed);

          return (
            <div key={section.id}>
              {/* Section header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all"
                style={{ color: sectionCompleted ? '#f0b429' : '#8b8fa8' }}>
                <span className="flex-1 text-left">{section.title}</span>
                <span className="text-[10px] font-normal normal-case">
                  {section.videos.filter(v => v.is_completed).length}/{section.videos.length}
                </span>
                {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>

              {/* Videos */}
              {isOpen && (
                <div className="ml-2 mt-1 space-y-0.5">
                  {section.videos.map((video) => {
                    const isActive = video.id === currentVideoId;
                    return (
                      <Link
                        key={video.id}
                        href={video.locked ? '#' : `/subjects/${subjectId}/video/${video.id}`}
                        onClick={(e) => video.locked && e.preventDefault()}
                        className={clsx(
                          'sidebar-item group',
                          isActive ? 'sidebar-item-active' : 'sidebar-item-inactive',
                          video.locked && 'opacity-50 cursor-not-allowed'
                        )}>
                        {/* Status icon */}
                        <span className="shrink-0">
                          {video.is_completed ? (
                            <CheckCircle2 size={14} className="text-jade" />
                          ) : video.locked ? (
                            <Lock size={13} className="text-slate-text" />
                          ) : isActive ? (
                            <PlayCircle size={14} className="text-gold animate-pulse-gold" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-slate-border" />
                          )}
                        </span>

                        <span className="flex-1 text-xs leading-snug line-clamp-2">{video.title}</span>

                        {video.duration_seconds && (
                          <span className="shrink-0 flex items-center gap-0.5 text-[10px] text-slate-text">
                            <Clock size={9} />
                            {formatDuration(video.duration_seconds)}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
