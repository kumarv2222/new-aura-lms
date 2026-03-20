import { Request, Response, NextFunction } from 'express';
import * as service from './ai.service';
import { db } from '../../config/db';

export const chatWithAI = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, context } = req.body;
    const userId = req.user!.sub;

    // Save user message
    await db('chat_history').insert({ user_id: userId, role: 'user', content: message });

    const aiRes = await service.chatWithAI(message, context);

    // Save AI message
    await db('chat_history').insert({ user_id: userId, role: 'ai', content: aiRes });

    res.json({ response: aiRes });
  } catch (err) { next(err); }
};

export const getChatHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.sub;
    const history = await db('chat_history')
      .where('user_id', userId)
      .orderBy('created_at', 'asc')
      .limit(50);
    res.json({ history });
  } catch (err) { next(err); }
};

export const summarizeContent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ summary: await service.summarizeContent(req.body.text) });
  } catch (err) { next(err); }
};

export const generateQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ quiz: await service.generateQuiz(req.body.text) });
  } catch (err) { next(err); }
};

export const recommendCourses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.sub;
    const enrollments = await db('enrollments').where('user_id', userId).select('subject_id');
    const enrolledIds = enrollments.map(e => e.subject_id);
    
    const allCourses = await db('subjects').where('is_published', true).select('*');
    
    res.json({ recommendations: await service.recommendCourses(enrolledIds, allCourses) });
  } catch (err) { next(err); }
};
