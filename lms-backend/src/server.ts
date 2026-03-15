import app from './app';
import { env } from './config/env';
import { db } from './config/db';

const start = async () => {
  try {
    await db.raw('SELECT 1');
    console.log('✅ Database connected');

    app.listen(env.port, () => {
      console.log(`🚀 LMS Backend running on port ${env.port} [${env.nodeEnv}]`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

start();
