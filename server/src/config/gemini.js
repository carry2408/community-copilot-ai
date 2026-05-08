import { GoogleGenerativeAI } from '@google/generative-ai';

// Lazy initialization — keys are read AFTER dotenv has loaded them
function getMainClient() {
  const key = (process.env.GEMINI_API_KEY || '').trim();
  if (!key) throw new Error('GEMINI_API_KEY is not set in .env');
  return new GoogleGenerativeAI(key);
}

function getChatClient() {
  const key = (process.env.CHAT_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '').trim();
  if (!key) throw new Error('CHAT_GEMINI_API_KEY is not set in .env');
  return new GoogleGenerativeAI(key);
}

export async function askGemini(prompt, options = {}) {
  try {
    const client = getMainClient();
    const model = client.getGenerativeModel({
      model: options.model || 'gemini-2.0-flash',
      generationConfig: { temperature: 0.7, maxOutputTokens: 4096 }
    });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    throw new Error(error.message || 'AI service failed');
  }
}

export async function askChatGemini(prompt) {
  try {
    const client = getChatClient();
    const model = client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { temperature: 0.8, maxOutputTokens: 2048 }
    });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Chat Gemini Error:', error.message);
    throw new Error(error.message || 'Chat AI failed');
  }
}

export async function askGeminiJSON(prompt) {
  const fullPrompt = prompt + '\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, no explanation.';
  const text = await askGemini(fullPrompt);
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

export function isGeminiAvailable() { return true; }
export function resetGemini() { }
