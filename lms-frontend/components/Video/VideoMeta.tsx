'use client';
import { Clock, CheckCircle2, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

interface Props {
  title: string;
  description?: string;
  sectionTitle: string;
  subjectTitle: string;
  subjectId: number;
  durationSeconds?: number;
  isCompleted: boolean;
  prevVideoId: number | null;
  nextVideoId: number | null;
}

function formatDuration(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec}s`;
}

export default function VideoMeta({
  title, description, sectionTitle, subjectTitle, subjectId,
  durationSeconds, isCompleted, prevVideoId, nextVideoId
}: Props) {
  return (
    <div className="mt-5 space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-text">
        <BookOpen size={11} />
        <Link href={`/subjects/${subjectId}`} className="hover:text-gold transition-colors">{subjectTitle}</Link>
        <span>/</span>
        <span>{sectionTitle}</span>
      </div>

      {/* Title */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="section-heading text-2xl md:text-3xl text-white leading-tight">{title}</h1>
        {isCompleted && (
          <span className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: 'rgba(0,201,167,0.12)', color: '#00c9a7', border: '1px solid rgba(0,201,167,0.25)' }}>
            <CheckCircle2 size={12} />
            Completed
          </span>
        )}
      </div>

      {/* Meta row */}
      {durationSeconds && (
        <div className="flex items-center gap-4 text-sm text-slate-text">
          <span className="flex items-center gap-1.5">
            <Clock size={13} />
            {formatDuration(durationSeconds)}
          </span>
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="text-sm text-slate-text leading-relaxed max-w-2xl">{description}</p>
      )}

      {/* Nav buttons */}
      <div className="flex items-center gap-3 pt-2">
        {prevVideoId ? (
          <Link href={`/subjects/${subjectId}/video/${prevVideoId}`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm glass-hover text-slate-text">
            <ChevronLeft size={15} />
            Previous
          </Link>
        ) : <div />}

        {nextVideoId && (
          <Link href={`/subjects/${subjectId}/video/${nextVideoId}`}
            className="btn-gold flex items-center gap-2 text-sm">
            Next lesson
            <ChevronRight size={15} />
          </Link>
        )}
      </div>
    </div>
  );
}
