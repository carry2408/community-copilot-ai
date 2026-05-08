import express from 'express';
import { askGemini } from '../config/gemini.js';

const router = express.Router();

// Main Chatbot Endpoint
router.post('/', async (req, res) => {
  const { message, context } = req.body;

  try {
    const prompt = `You are the Community Copilot AI Assistant. 
You are helping a business owner with their government scheme eligibility results.

CONTEXT OF THEIR RESULTS:
${JSON.stringify(context, null, 2)}

USER QUESTION:
${message}

Provide a professional, helpful, and concise response. If they ask about applying for a specific scheme, provide the most official link you know for that scheme.`;

    const response = await askGemini(prompt);
    res.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

// Smart Link Discovery Endpoint
router.post('/smart-link', async (req, res) => {
  const { schemeName } = req.body;

  try {
    const prompt = `Search your knowledge for the EXACT official application portal URL for the government scheme: "${schemeName}".
    
Respond ONLY with the URL. If you are not 100% sure, provide the most relevant state or central government portal where the application likely resides (e.g. startupindia.gov.in or a state DIC portal).
DO NOT include any text other than the URL. No markdown.`;

    const response = await askGemini(prompt);
    const url = response.trim().match(/https?:\/\/[^\s]+/)?.[0] || response.trim();
    res.json({ url });
  } catch (error) {
    console.error('Smart link error:', error);
    res.status(500).json({ error: 'Failed to find smart link' });
  }
});

export default router;
