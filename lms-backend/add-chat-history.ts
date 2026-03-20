import { db } from './src/config/db';

async function addChatHistory() {
  console.log('🔨 Adding chat_history table...');
  try {
    const hasTable = await db.schema.hasTable('chat_history');
    if (!hasTable) {
      await db.schema.createTable('chat_history', table => {
        table.bigIncrements('id').primary();
        table.bigInteger('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.string('role').notNullable(); // 'user' or 'ai'
        table.text('content').notNullable();
        table.timestamp('created_at').defaultTo(db.fn.now());
      });
      console.log('✅ chat_history table created.');
    } else {
      console.log('⏭️  Table already exists.');
    }
  } catch (err: any) {
    console.error('❌ Error:', err.message);
  } finally {
    await db.destroy();
  }
}

addChatHistory();
