import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const geminiModel = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 4096,
  }
});

let useGemini = true;

export async function askGemini(prompt, options = {}) {
  if (!useGemini) throw new Error('Gemini disabled — using fallbacks');
  try {
    const model = options.model ? genAI.getGenerativeModel({ model: options.model }) : geminiModel;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text;
  } catch (error) {
    console.error('Gemini API Error Detail:', error);
    if (error.message.includes('API_KEY_INVALID') || error.message.includes('API key not valid')) {
      console.warn('⚠️ Gemini API key invalid');
      useGemini = false;
    }
    throw new Error(error.message || 'AI service failed');
  }
}

export async function askGeminiJSON(prompt) {
  const fullPrompt = prompt + '\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, no explanation.';
  const text = await askGemini(fullPrompt);
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

export function isGeminiAvailable() { return useGemini; }
export function resetGemini() { useGemini = true; }
