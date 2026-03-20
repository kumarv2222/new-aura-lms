import axios from 'axios';
import { env } from '../../config/env';

// The new Hugging Face Router API (OpenAI-compatible)
const HF_ROUTER_BASE = 'https://router.huggingface.co/v1';

const hfClient = axios.create({
  baseURL: HF_ROUTER_BASE,
  timeout: 30000,
  headers: { 
    Authorization: `Bearer ${env.huggingface.apiKey}`,
    'Content-Type': 'application/json'
  },
});

export const chatWithAI = async (message: string, context: string = '') => {
  console.log('🤖 AI Sync: Calling HF Router API. Key length:', env.huggingface.apiKey?.length || 0);
  
  const systemPrompt = `You are a helpful AI tutor for an online learning platform.
Keep your answers clear, concise, and educational.
Context about the current material: ${context}`;

  // Stable free-tier models on the router
  const models = [
    'Qwen/Qwen2.5-7B-Instruct',
    'meta-llama/Llama-3.1-8B-Instruct',
    'mistralai/Mistral-7B-Instruct-v0.3'
  ];

  for (const model of models) {
    try {
      const response = await hfClient.post('/chat/completions', {
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      });
      
      const result = response.data.choices[0]?.message?.content || "";
      if (result) return result.trim();
    } catch (error: any) {
      console.warn(`⚠️ Model ${model} failed:`, error.response?.data?.error?.message || error.message);
      // If it's a 503/429/400 (not supported), try the next one
    }
  }

  throw new Error('All AI models are currently unavailable. Please try again later.');
};

export const summarizeContent = async (text: string) => {
  try {
    const response = await hfClient.post('/chat/completions', {
      model: 'Qwen/Qwen2.5-7B-Instruct',
      messages: [
        { role: 'system', content: 'You are a professional summarizer. Provide a concise, bulleted summary of the following text.' },
        { role: 'user', content: text.slice(0, 3000) }
      ],
      max_tokens: 300
    });
    return response.data.choices[0]?.message?.content || "Summarization failed.";
  } catch (error: any) {
    console.error('HF Summarize Error:', error.response?.data || error.message);
    throw new Error('AI Summarization unavailable');
  }
};

export const generateQuiz = async (text: string) => {
  try {
    const prompt = `Based on the following text, generate 3 multiple choice questions.
Return ONLY valid JSON in this format: 
[
  {
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "correctAnswer": "..."
  }
]

Text: ${text.slice(0, 2000)}`;

    const response = await hfClient.post('/chat/completions', {
      model: 'Qwen/Qwen2.5-7B-Instruct',
      messages: [
        { role: 'system', content: 'You are a quiz generator. You only output valid JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }, // Some providers support this
      max_tokens: 600
    });

    const resultText = response.data.choices[0]?.message?.content || "[]";
    try {
      // Find the first [ and last ] to extract JSON if there's fluff
      const start = resultText.indexOf('[');
      const end = resultText.lastIndexOf(']') + 1;
      return JSON.parse(resultText.slice(start, end));
    } catch {
      return JSON.parse(resultText); // Fallback
    }
  } catch (error: any) {
    console.error('HF Quiz Gen Error:', error.response?.data || error.message);
    return [{
       question: "What is the key concept in this chapter?",
       options: ["Primary topic", "Ancillary data", "Related matter", "None"],
       correctAnswer: "Primary topic"
    }];
  }
};

export const recommendCourses = async (enrolledIds: number[], allCourses: any[]) => {
  // Logic remains the same as it doesn't use the API
  const enrolledCourses = allCourses.filter(c => enrolledIds.includes(c.id));
  const enrolledCategories = new Set(enrolledCourses.map(c => c.category));
  
  const recommendations = allCourses
    .filter(c => !enrolledIds.includes(c.id) && enrolledCategories.has(c.category))
    .slice(0, 3);
    
  if (recommendations.length < 3) {
    const extra = allCourses
      .filter(c => !enrolledIds.includes(c.id) && !recommendations.find((r: any) => r.id === c.id))
      .slice(0, 3 - recommendations.length);
    return [...recommendations, ...extra];
  }
  return recommendations;
};
