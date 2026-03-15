import { db } from '../../config/db';
import { getPrerequisiteVideoId, getNextVideoId } from '../../utils/ordering';

export const findVideoWithMeta = async (videoId: number, userId: number) => {
  const video = await db('videos as v')
    .join('sections as s', 'v.section_id', 's.id')
    .join('subjects as sub', 's.subject_id', 'sub.id')
    .where('v.id', videoId)
    .select(
      'v.id', 'v.title', 'v.description', 'v.youtube_url', 'v.order_index', 'v.duration_seconds',
      's.id as section_id', 's.title as section_title',
      'sub.id as subject_id', 'sub.title as subject_title'
    )
    .first();

  if (!video) return null;

  const prereqId = await getPrerequisiteVideoId(videoId, video.subject_id);
  const nextId = await getNextVideoId(videoId, video.subject_id);

  let locked = false;
  let unlockReason: string | null = null;

  if (prereqId) {
    const prereqProgress = await db('video_progress')
      .where({ user_id: userId, video_id: prereqId })
      .first();
    locked = !prereqProgress?.is_completed;
    if (locked) unlockReason = 'Complete previous video';
  }

  return {
    ...video,
    youtube_url: locked ? null : video.youtube_url, // <-- Must mask the URL
    previous_video_id: prereqId,
    next_video_id: nextId,
    locked,
    unlock_reason: unlockReason,
  };
};

export const findFirstUnlockedVideo = async (subjectId: number, userId: number) => {
  const sections = await db('sections').where('subject_id', subjectId).orderBy('order_index');
  for (const section of sections) {
    const videos = await db('videos').where('section_id', section.id).orderBy('order_index');
    for (const video of videos) {
      const prereqId = await getPrerequisiteVideoId(video.id, subjectId);
      if (!prereqId) return video;
      const prog = await db('video_progress').where({ user_id: userId, video_id: prereqId }).first();
      if (prog?.is_completed) return video;
    }
  }
  return null;
};
