'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Lock, ChevronRight, PartyPopper } from 'lucide-react';
import apiClient from '../../../../../lib/apiClient';
import { useVideoStore } from '../../../../../store/videoStore';
import { useSidebarStore } from '../../../../../store/sidebarStore';
import VideoPlayer from '../../../../../components/Video/VideoPlayer';
import VideoMeta from '../../../../../components/Video/VideoMeta';
import VideoProgressBar from '../../../../../components/Video/VideoProgressBar';
import Spinner from '../../../../../components/common/Spinner';

interface VideoData {
  id: number;
  title: string;
  description: string;
  youtube_url: string;
  duration_seconds: number;
  section_id: number;
  section_title: string;
  subject_id: number;
  subject_title: string;
  previous_video_id: number | null;
  next_video_id: number | null;
  locked: boolean;
  unlock_reason: string | null;
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
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, [videoId]);

  const handleCompleted = useCallback(() => {
    setCompleted(true);
    markVideoCompleted(parseInt(videoId as string));
    setShowComplete(true);
    setTimeout(() => setShowComplete(false), 4000);
  }, [videoId]);

  const goNext = () => {
    if (video?.next_video_id) router.push(`/subjects/${subjectId}/video/${video.next_video_id}`);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]"><Spinner size={32} /></div>
  );

  if (!video) return (
    <div className="flex items-center justify-center min-h-[60vh] text-slate-text">Video not found</div>
  );

  if (video.locked) return (
    <div className="flex items-center justify-center min-h-[60vh] px-6">
      <div className="glass rounded-2xl p-10 text-center max-w-sm animate-fade-up">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Lock size={24} className="text-slate-text" />
        </div>
        <h2 className="section-heading text-xl text-white mb-2">Lesson Locked</h2>
        <p className="text-sm text-slate-text mb-6">{video.unlock_reason || 'Complete the previous lesson to unlock this one.'}</p>
        {video.previous_video_id && (
          <button onClick={() => router.push(`/subjects/${subjectId}/video/${video.previous_video_id}`)}
            className="btn-gold flex items-center gap-2 mx-auto text-sm">
            Watch previous lesson <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="px-6 py-8 max-w-4xl">
      {/* Completion toast */}
      {showComplete && (
        <div className="fixed top-20 right-6 z-50 animate-fade-up flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-medium"
          style={{ background: 'rgba(0,201,167,0.15)', border: '1px solid rgba(0,201,167,0.3)', color: '#00c9a7', backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,201,167,0.15)' }}>
          <PartyPopper size={16} />
          Lesson completed! 🎉
          {video.next_video_id && (
            <button onClick={goNext} className="ml-2 underline hover:no-underline" style={{ color: '#00c9a7' }}>
              Next →
            </button>
          )}
        </div>
      )}

      {/* Video Player */}
      <div className="animate-fade-in">
        <VideoPlayer
          videoId={video.id}
          youtubeUrl={video.youtube_url}
          startPositionSeconds={startPos}
          onCompleted={handleCompleted}
        />
        <VideoProgressBar />
      </div>

      {/* Video Meta */}
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
  );
}
