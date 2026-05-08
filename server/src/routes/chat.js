import express from 'express';
import { askChatGemini } from '../config/gemini.js';

const router = express.Router();

// Main Chatbot Endpoint
router.post('/', async (req, res) => {
  const { message, context } = req.body;

  try {
    console.log('AI Chat Request received');

    // Safe Context Filtering
    const eligibleSchemes = Array.isArray(context?.eligibilityResults) 
      ? context.eligibilityResults
          .filter(r => r.status === 'eligible' || r.status === 'partially_eligible')
          .map(r => r.schemeName)
      : [];

    const prompt = `You are the Community Copilot AI Assistant. 
You are helping a business owner with their government scheme eligibility results.

BUSINESS CONTEXT:
Eligible Schemes: ${eligibleSchemes.join(', ') || 'None found yet'}
Summary: ${context?.simplification?.intro || 'New analysis needed'}

USER QUESTION:
${message}

Provide a professional, helpful, and concise response. If they ask about applying for a specific scheme, provide the most official link you know for that scheme.`;

    const response = await askChatGemini(prompt);
    res.json({ response });
  } catch (error) {
    console.error('Chat AI Error:', error.message);
    res.status(500).json({ error: error.message || 'Internal AI Error' });
  }
});

// Smart Link Discovery Endpoint
router.post('/smart-link', async (req, res) => {
  const { schemeName } = req.body;

  try {
    const prompt = `Find the EXACT official application portal URL for: "${schemeName}".
Respond ONLY with the URL. No markdown. No text.`;

    const response = await askChatGemini(prompt);
    const url = response.trim().match(/https?:\/\/[^\s]+/)?.[0] || response.trim();
    res.json({ url });
  } catch (error) {
    console.error('Smart Link Error:', error.message);
    res.status(500).json({ error: 'Failed to find portal' });
  }
});

export default router;
