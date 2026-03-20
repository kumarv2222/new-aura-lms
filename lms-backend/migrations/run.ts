import { db } from '../src/config/db';

async function runMigrations() {
  console.log('🔄 Running migrations...');

  const ensureTable = async (tableName: string, callback: (t: any) => void) => {
    if (!(await db.schema.hasTable(tableName))) {
      await db.schema.createTable(tableName, callback);
    }
  };

  await ensureTable('users', (t) => {
    t.bigIncrements('id').primary();
    t.string('email', 255).notNullable().unique();
    t.string('password_hash', 512).notNullable();
    t.string('name', 255).notNullable();
    t.timestamps(true, true);
    t.index('email');
  });

  await ensureTable('subjects', (t) => {
    t.increments('id').primary();
    t.string('title', 255).notNullable();
    t.string('slug', 255).notNullable().unique();
    t.text('description');
    t.string('thumbnail_url', 512);
    t.string('instructor_name', 255);
    t.string('instructor_channel', 255);
    t.string('category', 100);
    t.enum('level', ['Beginner', 'Intermediate', 'Advanced']).defaultTo('Beginner');
    t.integer('duration_weeks');
    t.decimal('rating', 2, 1).defaultTo(4.5);
    t.integer('total_lessons');
    t.boolean('is_free').defaultTo(true);
    t.boolean('is_published').defaultTo(false);
    t.timestamps(true, true);
    t.index('slug');
  });

  // Ensure columns exist for subjects
  const cols = [
    { name: 'instructor_name', add: (t: any) => t.string('instructor_name', 255) },
    { name: 'instructor_channel', add: (t: any) => t.string('instructor_channel', 255) },
    { name: 'category', add: (t: any) => t.string('category', 100) },
    { name: 'level', add: (t: any) => t.enum('level', ['Beginner', 'Intermediate', 'Advanced']).defaultTo('Beginner') },
    { name: 'duration_weeks', add: (t: any) => t.integer('duration_weeks') },
    { name: 'rating', add: (t: any) => t.decimal('rating', 2, 1).defaultTo(4.5) },
    { name: 'total_lessons', add: (t: any) => t.integer('total_lessons') },
    { name: 'is_free', add: (t: any) => t.boolean('is_free').defaultTo(true) },
  ];

  for (const col of cols) {
    if (!(await db.schema.hasColumn('subjects', col.name))) {
      await db.schema.alterTable('subjects', (t) => col.add(t));
    }
  }

  await ensureTable('sections', (t) => {
    t.increments('id').primary();
    t.integer('subject_id').unsigned().notNullable().references('id').inTable('subjects').onDelete('CASCADE');
    t.string('title', 255).notNullable();
    t.integer('order_index').notNullable();
    t.timestamps(true, true);
    t.unique(['subject_id', 'order_index']);
  });

  await ensureTable('videos', (t) => {
    t.increments('id').primary();
    t.integer('section_id').unsigned().notNullable().references('id').inTable('sections').onDelete('CASCADE');
    t.string('title', 255).notNullable();
    t.text('description');
    t.string('youtube_url', 512).notNullable();
    t.integer('order_index').notNullable();
    t.integer('duration_seconds').nullable();
    t.timestamps(true, true);
    t.unique(['section_id', 'order_index']);
  });

  await ensureTable('enrollments', (t) => {
    t.increments('id').primary();
    t.bigInteger('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.integer('subject_id').unsigned().notNullable().references('id').inTable('subjects').onDelete('CASCADE');
    t.timestamp('created_at').defaultTo(db.fn.now());
    t.unique(['user_id', 'subject_id']);
  });

  await ensureTable('video_progress', (t) => {
    t.increments('id').primary();
    t.bigInteger('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.integer('video_id').unsigned().notNullable().references('id').inTable('videos').onDelete('CASCADE');
    t.integer('last_position_seconds').defaultTo(0);
    t.boolean('is_completed').defaultTo(false);
    t.timestamp('completed_at').nullable();
    t.timestamps(true, true);
    t.unique(['user_id', 'video_id']);
  });

  await ensureTable('refresh_tokens', (t) => {
    t.increments('id').primary();
    t.bigInteger('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('token_hash', 512).notNullable();
    t.timestamp('expires_at').notNullable();
    t.timestamp('revoked_at').nullable();
    t.timestamp('created_at').defaultTo(db.fn.now());
    t.index(['user_id', 'token_hash']);
  });

  console.log('✅ Migrations complete!');
  await db.destroy();
}

runMigrations().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
