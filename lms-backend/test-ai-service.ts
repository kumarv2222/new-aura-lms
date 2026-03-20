import axios from 'axios';
import { chatWithAI } from './src/modules/ai/ai.service';
import { env } from './src/config/env';

async function test() {
  console.log('Testing AI with Key:', env.huggingface.apiKey.slice(0, 10) + '...');
  
  const hfClient = axios.create({
    timeout: 30000,
    headers: { Authorization: `Bearer ${env.huggingface.apiKey}` },
  });

  try {
    console.log('Fetching available models from router...');
    const res = await hfClient.get('https://router.huggingface.co/v1/models');
    const models = res.data.data.map((m: any) => m.id);
    console.log('✅ Found Models (First 20):', models.slice(0, 20));
    
    if (models.length > 0) {
      const selected = models[0];
      console.log('Trying first model:', selected);
      const chatRes = await hfClient.post('https://router.huggingface.co/v1/chat/completions', {
        model: selected,
        messages: [{ role: 'user', content: 'Say hello!' }],
        max_tokens: 50
      });
      console.log('✅ AI Response:', chatRes.data.choices[0]?.message?.content);
    }
  } catch (err: any) {
    console.error('❌ Failed! Error:', JSON.stringify(err.response?.data || err.message));
  }
}

test();
