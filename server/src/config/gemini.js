import { GoogleGenerativeAI } from '@google/generative-ai';

// Models tried in order if one hits quota
const MODEL_FALLBACKS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-pro',
];

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

async function tryModels(client, prompt, config = {}) {
  let lastError;
  for (const modelName of MODEL_FALLBACKS) {
    try {
      const model = client.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096, ...config }
      });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      const is429 = error.message.includes('429') || error.message.includes('quota') || error.message.includes('RATE_LIMIT');
      const is404 = error.message.includes('404') || error.message.includes('not found');
      if (is429 || is404) {
        console.warn(`⚠️ Model ${modelName} unavailable (${is429 ? 'quota' : 'not found'}), trying next...`);
        lastError = error;
        continue;
      }
      throw new Error(error.message || 'AI service failed');
    }
  }
  throw new Error(`All models exhausted. Last error: ${lastError?.message}`);
}

export async function askGemini(prompt, options = {}) {
  try {
    const client = getMainClient();
    return await tryModels(client, prompt, options.generationConfig);
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    throw new Error(error.message || 'AI service failed');
  }
}

export async function askChatGemini(prompt) {
  try {
    const client = getChatClient();
    return await tryModels(client, prompt, { temperature: 0.8, maxOutputTokens: 2048 });
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
