'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Lock, ChevronRight, PartyPopper, ArrowLeft, Maximize2, Share2, Heart, Award } from 'lucide-react';
import apiClient from '../../../../../lib/apiClient';
import { useVideoStore } from '../../../../../store/videoStore';
import { useSidebarStore } from '../../../../../store/sidebarStore';
import VideoPlayer from '../../../../../components/Video/VideoPlayer';
import VideoMeta from '../../../../../components/Video/VideoMeta';
import VideoProgressBar from '../../../../../components/Video/VideoProgressBar';
import Spinner from '../../../../../components/common/Spinner';

interface VideoData {
  id: number; title: string; description: string; youtube_url: string;
  duration_seconds: number; section_id: number; section_title: string;
  subject_id: number; subject_title: string;
  previous_video_id: number | null; next_video_id: number | null;
  locked: boolean; unlock_reason: string | null;
}

export default function VideoPage() {
  const { subjectId, videoId } = useParams();
  const router = useRouter();
  const [video, setVideo] = useState<VideoData | null>(null);
  const [startPos, setStartPos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showComplete, setShowComplete] = useState(false);
  const { setVideo: storeSetVideo, setNavigation, setCompleted } = useVideoStore();
  const { markVideoCompleted } = useSidebarStore();

  useEffect(() => {
    setLoading(true);
    setShowComplete(false);
    Promise.all([
      apiClient.get(`/videos/${videoId}`),
      apiClient.get(`/progress/videos/${videoId}`).catch(() => ({ data: { last_position_seconds: 0 } })),
    ]).then(([vidRes, progRes]) => {
      setVideo(vidRes.data);
      setStartPos(progRes.data.last_position_seconds ?? 0);
      storeSetVideo(parseInt(videoId as string), parseInt(subjectId as string));
      setNavigation(vidRes.data.previous_video_id, vidRes.data.next_video_id);
    }).catch(console.error).finally(() => setLoading(false));
  }, [videoId]);

  const handleCompleted = useCallback(() => {
    setCompleted(true);
    markVideoCompleted(parseInt(videoId as string));
    setShowComplete(true);
    setTimeout(() => setShowComplete(false), 5000);
  }, [videoId]);

  const goNext = () => {
    if (video?.next_video_id) router.push(`/subjects/${subjectId}/video/${video.next_video_id}`);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
       <div className="relative group">
          <div className="absolute -inset-1 bg-gold/30 rounded-full blur group-hover:opacity-50 transition duration-1000 animate-pulse" />
          <Spinner size={32} />
       </div>
       <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-text animate-pulse">Syncing Session...</p>
    </div>
  );

  if (!video) return (
    <div className="flex items-center justify-center min-h-[80vh] text-slate-text italic animate-fade-up uppercase tracking-widest text-xs">Video not found. Return to library.</div>
  );

  if (video.locked) return (
    <div className="flex items-center justify-center min-h-[80vh] px-6">
      <div className="glass-card rounded-[2.5rem] p-12 text-center max-w-sm animate-fade-up border border-slate-border/50 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-gold/5 blur-3xl pointer-events-none" />
        <div className="w-16 h-16 rounded-3xl bg-slate-glass border border-slate-border flex items-center justify-center mx-auto mb-8 shadow-2xl text-slate-text group-hoverScale-110 transition-transform">
          <Lock size={28} className="opacity-60" />
        </div>
        <h2 className="font-serif text-3xl text-white mb-4">Lesson Locked</h2>
        <p className="text-sm text-slate-text mb-10 leading-relaxed font-medium">This curriculum requires prerequisite knowledge. Complete the previous lesson to unlock this expert session.</p>
        {video.previous_video_id && (
          <button onClick={() => router.push(`/subjects/${subjectId}/video/${video.previous_video_id}`)}
            className="w-full py-4 bg-gold rounded-2xl flex items-center justify-center gap-3 text-black font-bold uppercase tracking-widest text-[10px] hover:bg-gold-light transition-all shadow-2xl shadow-gold/20">
            Return to Learning <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-full">
      {/* Completion Toast (Modern Slide-in) */}
      {showComplete && (
        <div className="fixed top-24 right-10 z-50 animate-fade-left flex flex-col gap-1">
          <div className="flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest bg-jade/10 text-jade border-2 border-jade/30 backdrop-blur-xl shadow-2xl shadow-jade/20">
            <PartyPopper size={20} className="text-jade animate-bounce" />
            <div className="flex flex-col">
               <span>Mastery Achieved! 🎉</span>
               {video.next_video_id && (
                 <button onClick={goNext} className="mt-1 text-jade/70 underline hover:text-jade transition-all lowercase">
                    Proceed to next lesson →
                 </button>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb Navigation Tip */}
      <div className="px-6 md:px-12 pt-8 pb-4">
        <button 
          onClick={() => router.push(`/subjects/${subjectId}`)} 
          className="flex items-center gap-2 text-slate-text/60 hover:text-gold transition-all group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Curriculum Overview</span>
        </button>
      </div>

      {/* Video Container (Cinema Layout) */}
      <div className="relative px-0 md:px-10 lg:px-12 animate-fade-in group">
        <div className="relative rounded-none md:rounded-[2rem] overflow-hidden border border-slate-border/20 shadow-2xl shadow-black/80">
          <VideoPlayer
            videoId={video.id}
            youtubeUrl={video.youtube_url}
            startPositionSeconds={startPos}
            onCompleted={handleCompleted}
          />
          <VideoProgressBar />
          
          {/* Overlay Tip on Hover */}
          <div className="absolute inset-x-0 bottom-0 py-8 px-12 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform hidden md:flex items-center justify-between">
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-white/40 text-[9px] font-bold uppercase tracking-[0.2em]">
                   <Maximize2 size={12} />
                   Press F for Fullscreen
                </div>
                <div className="flex items-center gap-2 text-white/40 text-[9px] font-bold uppercase tracking-[0.2em]">
                   <Share2 size={12} />
                   Share Session
                </div>
             </div>
             <div className="flex items-center gap-4">
                <Heart size={16} className="text-white/20 hover:text-rose-500 transition-colors cursor-pointer" />
                <Award size={16} className="text-white/20 hover:text-gold transition-colors cursor-pointer" />
             </div>
          </div>
        </div>
      </div>

      {/* Meta Content Area */}
      <div className="px-6 md:px-12 lg:px-16 pt-2 max-w-6xl">
        <VideoMeta
          title={video.title}
          description={video.description}
          sectionTitle={video.section_title}
          subjectTitle={video.subject_title}
          subjectId={video.subject_id}
          durationSeconds={video.duration_seconds}
          isCompleted={false}
          prevVideoId={video.previous_video_id}
          nextVideoId={video.next_video_id}
        />
      </div>
    </div>
  );
}
