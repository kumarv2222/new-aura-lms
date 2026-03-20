import { db } from './src/config/db';

const urlFixes: Record<string, string> = {
  'https://www.youtube.com/watch?v=qR4b7nJ7pQA': 'https://www.youtube.com/watch?v=n-3aFPGRdCE',
  'https://www.youtube.com/watch?v=Xh_KogTpsaM': 'https://www.youtube.com/watch?v=9igMFNs7rI8',
  'https://www.youtube.com/watch?v=hzYhSKrM_ok': 'https://www.youtube.com/watch?v=Bz1-rC7zhgY',
  'https://www.youtube.com/watch?v=sc6S92f6F1I': 'https://www.youtube.com/watch?v=4d90Y4Wbmj8',
  'https://www.youtube.com/watch?v=xZ_pA78eR8o': 'https://www.youtube.com/watch?v=rfscVS0vtbw',
  'https://www.youtube.com/watch?v=L0dZ88B5OLg': 'https://www.youtube.com/watch?v=JBjFEotrobs',
  'https://www.youtube.com/watch?v=5KlnlCq2M5Q': 'https://www.youtube.com/watch?v=veMhOYRib9o',
  'https://www.youtube.com/watch?v=n0mn_6YKxnI': 'https://www.youtube.com/watch?v=9XMt2hChbRo',
  'https://www.youtube.com/watch?v=0_u6eX6o7O4': 'https://www.youtube.com/watch?v=IrIteTQKXYA',
  'https://www.youtube.com/watch?v=1SH0te-iNus': 'https://www.youtube.com/watch?v=CD1Y2DmL5nk',
  'https://www.youtube.com/watch?v=UXDSeD9mN-k': 'https://www.youtube.com/watch?v=KLlXCFG5TnA',
  'https://www.youtube.com/watch?v=AHZpyENo7k4': 'https://www.youtube.com/watch?v=86CQq3pKSUw',
  'https://www.youtube.com/watch?v=WwfhLC16bis': 'https://www.youtube.com/watch?v=N6dOwBde7-M',
  'https://www.youtube.com/watch?v=G0_I-ZF0S38': 'https://www.youtube.com/watch?v=D7y_hoT_YZI',
};

async function superFixAndCleanup() {
  console.log('🚀 Starting Super Fix and Cleanup...');
  
  try {
    // 1. Fix known broken URLs
    for (const [oldUrl, newUrl] of Object.entries(urlFixes)) {
      await db('videos').where('youtube_url', oldUrl).update({ youtube_url: newUrl });
    }
    console.log('✅ Known broken URLs fixed.');

    // 2. Remove duplicates (same youtube_url in same section)
    const duplicates = await db('videos')
      .select('youtube_url', 'section_id')
      .count('* as count')
      .groupBy('youtube_url', 'section_id')
      .having('count', '>', 1);

    for (const dup of duplicates) {
      const ids = await db('videos')
        .where('youtube_url', dup.youtube_url)
        .where('section_id', dup.section_id)
        .select('id')
        .offset(1); // Keep the first one, delete others
      
      const idsToDelete = ids.map(i => i.id);
      if (idsToDelete.length > 0) {
        await db('videos').whereIn('id', idsToDelete).del();
        console.log(`🗑️ Deleted ${idsToDelete.length} duplicates for URL: ${dup.youtube_url}`);
      }
    }

    // 3. Identification of "really" broken videos (not youtube)
    // Actually, everything is youtube. Let's look for invalid IDs.
    const allVideos = await db('videos').select('id', 'youtube_url');
    const toRemove: number[] = [];
    for (const v of allVideos) {
      if (!v.youtube_url || v.youtube_url.includes('dQw4w9WgXcQ')) {
        toRemove.push(v.id);
      }
    }

    if (toRemove.length > 0) {
      await db('videos').whereIn('id', toRemove).del();
      console.log(`🗑️ Removed ${toRemove.length} placeholder/broken videos.`);
    }

    // 4. Update total_lessons for subjects
    const subjects = await db('subjects').select('id');
    for (const s of subjects) {
      const countRes = await db('videos')
        .join('sections', 'videos.section_id', 'sections.id')
        .where('sections.subject_id', s.id)
        .count('* as total');
      
      const total = Number((countRes[0] as any).total);
      await db('subjects').where('id', s.id).update({ total_lessons: total });
    }
    console.log('✅ Subject lesson counts updated.');

    console.log('🎉 Super cleanup complete!');
  } catch (err: any) {
    console.error('❌ Error during cleanup:', err.message);
  } finally {
    await db.destroy();
  }
}

superFixAndCleanup();
