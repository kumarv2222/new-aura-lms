import { db } from './src/config/db';

async function checkVideos() {
  try {
    const videos = await db('videos').select('id', 'title', 'youtube_url');
    console.log('--- Video Check ---');
    for (const v of videos) {
      if (!v.youtube_url || v.youtube_url.includes('error') || v.youtube_url.length < 5) {
        console.log(`❌ BROKEN: [${v.id}] ${v.title} -> ${v.youtube_url}`);
      }
    }
    console.log(`Total videos checked: ${videos.length}`);
  } catch (err: any) {
    console.error('Error:', err.message);
  } finally {
    await db.destroy();
  }
}

checkVideos();
