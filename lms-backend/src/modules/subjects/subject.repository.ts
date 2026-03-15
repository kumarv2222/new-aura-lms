import { db } from '../../config/db';

export const findAllPublished = async (page: number, pageSize: number, q?: string) => {
  const query = db('subjects').where('is_published', true);
  if (q) query.whereILike('title', `%${q}%`);
  const [{ count }] = await query.clone().count('id as count');
  const rows = await query.orderBy('created_at', 'desc').limit(pageSize).offset((page - 1) * pageSize);
  return { subjects: rows, total: Number(count), page, pageSize };
};

export const findById = async (id: number) => {
  return db('subjects').where('id', id).first();
};

export const findBySlug = async (slug: string) => {
  return db('subjects').where('slug', slug).first();
};

export const findTreeWithProgress = async (subjectId: number, userId: number) => {
  const sections = await db('sections').where('subject_id', subjectId).orderBy('order_index');

  const sectionIds = sections.map((s: any) => s.id);
  const videos = sectionIds.length
    ? await db('videos').whereIn('section_id', sectionIds).orderBy('order_index')
    : [];

  const progressRows = userId && videos.length
    ? await db('video_progress')
        .where('user_id', userId)
        .whereIn('video_id', videos.map((v: any) => v.id))
    : [];

  const progressMap = new Map(progressRows.map((p: any) => [p.video_id, p]));

  // Build global sequence for locked logic
  const allVideoIds = videos.map((v: any) => v.id);

  return sections.map((section: any) => ({
    id: section.id,
    title: section.title,
    order_index: section.order_index,
    videos: videos
      .filter((v: any) => v.section_id === section.id)
      .map((v: any) => {
        const progress = progressMap.get(v.id);
        const seqIdx = allVideoIds.indexOf(v.id);
        const prereqId = seqIdx > 0 ? allVideoIds[seqIdx - 1] : null;
        const prereqProgress = prereqId ? progressMap.get(prereqId) : null;
        const locked = prereqId !== null && !prereqProgress?.is_completed;

        return {
          id: v.id,
          title: v.title,
          order_index: v.order_index,
          duration_seconds: v.duration_seconds,
          is_completed: progress?.is_completed ?? false,
          locked,
        };
      }),
  }));
};
