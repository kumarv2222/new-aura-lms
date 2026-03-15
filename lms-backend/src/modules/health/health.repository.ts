import { db } from '../../config/db';

export const checkDbConnection = async (): Promise<boolean> => {
  try {
    await db.raw('SELECT 1');
    return true;
  } catch {
    return false;
  }
};
