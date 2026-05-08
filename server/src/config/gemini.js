import { GoogleGenerativeAI } from '@google/generative-ai';

// Clean the keys to remove hidden spaces/newlines
const mainKey = (process.env.GEMINI_API_KEY || '').trim();
const chatKey = (process.env.CHAT_GEMINI_API_KEY || '').trim() || mainKey;

if (!mainKey) {
  console.error('❌ CRITICAL: GEMINI_API_KEY is missing!');
} else {
  console.log(`✅ Main Key: [${mainKey.substring(0, 4)}...${mainKey.substring(mainKey.length - 4)}] (Length: ${mainKey.length})`);
}

if (process.env.CHAT_GEMINI_API_KEY) {
  console.log(`✅ Chat Key: [${chatKey.substring(0, 4)}...${chatKey.substring(chatKey.length - 4)}] (Length: ${chatKey.length})`);
}

const genAI = new GoogleGenerativeAI(mainKey || 'MISSING_KEY');
const chatGenAI = new GoogleGenerativeAI(chatKey || mainKey || 'MISSING_KEY');

export const geminiModel = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash',
  generationConfig: { temperature: 0.7, maxOutputTokens: 4096 }
});

export const chatModel = chatGenAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: { temperature: 0.8, maxOutputTokens: 2048 }
});

export async function askGemini(prompt, options = {}) {
  try {
    const model = options.model ? genAI.getGenerativeModel({ model: options.model }) : geminiModel;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    throw new Error(error.message || 'AI service failed');
  }
}

export async function askChatGemini(prompt) {
  try {
    const result = await chatModel.generateContent(prompt);
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
