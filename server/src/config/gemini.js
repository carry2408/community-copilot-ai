import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const geminiModel = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash-preview-05-20',
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 4096,
  }
});

export async function askGemini(prompt, options = {}) {
  try {
    const model = options.model ? genAI.getGenerativeModel({ model: options.model }) : geminiModel;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text;
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    throw error;
  }
}

export async function askGeminiJSON(prompt) {
  const fullPrompt = prompt + '\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, no explanation.';
  const text = await askGemini(fullPrompt);
  // Clean markdown code blocks if present
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}
