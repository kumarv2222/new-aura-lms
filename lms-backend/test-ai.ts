const axios = require('axios');
require('dotenv').config();

const key = process.env.HUGGINGFACE_API_KEY;
console.log('Key:', key?.slice(0,8) + '...');

axios.post(
  'https://router.huggingface.co/v1/chat/completions',
  {
    model: 'meta-llama/Llama-3.2-3B-Instruct',
    messages: [
      { role: 'system', content: 'You are a helpful tutor.' },
      { role: 'user', content: 'What is Python? Answer in one sentence.' },
    ],
    max_tokens: 100,
  },
  {
    headers: {
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/json',
    },
    timeout: 20000,
  }
).then((r: any) => {
  console.log('✅ SUCCESS:', r.data?.choices?.[0]?.message?.content);
}).catch((e: any) => {
  console.error('❌ Status:', e.response?.status);
  console.error('❌ Error:', JSON.stringify(e.response?.data));
});
