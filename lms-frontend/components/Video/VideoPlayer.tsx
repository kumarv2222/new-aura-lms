'use client';
import { useEffect, useRef, useCallback } from 'react';
import YouTube, { YouTubeEvent, YouTubePlayer } from 'react-youtube';
import { useVideoStore } from '../../store/videoStore';
import { sendProgress, sendProgressImmediate } from '../../lib/progress';

interface Props {
  videoId: number;
  youtubeUrl: string;
  startPositionSeconds?: number;
  onCompleted?: () => void;
  onProgress?: (seconds: number) => void;
}

function extractYouTubeId(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const match = url.match(p);
    if (match) return match[1];
  }
  return url; // assume it's already an ID
}

export default function VideoPlayer({ videoId, youtubeUrl, startPositionSeconds = 0, onCompleted, onProgress }: Props) {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);
  const { setTime, setDuration, setPlaying, setCompleted } = useVideoStore();

  const ytId = extractYouTubeId(youtubeUrl);

  const clearTimer = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };

  const startTimer = useCallback(() => {
    clearTimer();
    intervalRef.current = setInterval(async () => {
      if (!playerRef.current) return;
      const t = await playerRef.current.getCurrentTime();
      const d = await playerRef.current.getDuration();
      setTime(t);
      setDuration(d);
      onProgress?.(t);
      sendProgress(videoId, Math.floor(t), false);
    }, 5000);
  }, [videoId]);

  useEffect(() => () => { clearTimer(); }, []);

  const onReady = (e: YouTubeEvent) => {
    playerRef.current = e.target;
    if (startPositionSeconds > 0) e.target.seekTo(startPositionSeconds, true);
    setDuration(e.target.getDuration());
  };

  const onPlay = () => { setPlaying(true); startTimer(); };

  const onPause = async () => {
    setPlaying(false);
    clearTimer();
    if (playerRef.current) {
      const t = await playerRef.current.getCurrentTime();
      sendProgress(videoId, Math.floor(t), false);
    }
  };

  const onEnd = async () => {
    setPlaying(false);
    clearTimer();
    if (!completedRef.current) {
      completedRef.current = true;
      const d = playerRef.current ? await playerRef.current.getDuration() : 0;
      await sendProgressImmediate(videoId, Math.floor(d), true);
      setCompleted(true);
      onCompleted?.();
    }
  };

  return (
    <div className="yt-iframe-wrap shadow-glass" style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
      <YouTube
        videoId={ytId}
        opts={{
          width: '100%',
          height: '100%',
          playerVars: { autoplay: 0, modestbranding: 1, rel: 0, color: 'white' },
        }}
        onReady={onReady}
        onPlay={onPlay}
        onPause={onPause}
        onEnd={onEnd}
        onError={(e: any) => console.log('YouTube Error:', e)}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        className="absolute inset-0 w-full h-full"
        iframeClassName="w-full h-full"
      />
    </div>
  );
}
