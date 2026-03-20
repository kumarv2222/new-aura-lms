import { db } from './src/config/db';

async function addBrokenColumn() {
  console.log('🔨 Adding is_broken column to videos table...');
  try {
    const hasColumn = await db.schema.hasColumn('videos', 'is_broken');
    if (!hasColumn) {
      await db.schema.table('videos', table => {
        table.boolean('is_broken').defaultTo(false).index();
      });
      console.log('✅ Column added.');
    } else {
      console.log('⏭️  Column already exists.');
    }
  } catch (err: any) {
    console.error('❌ Error:', err.message);
  } finally {
    await db.destroy();
  }
}

addBrokenColumn();
