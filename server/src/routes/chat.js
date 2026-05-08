import express from 'express';
import Groq from 'groq-sdk';

const router = express.Router();

function getGroqClient() {
  const key = (process.env.GROQ_API_KEY || '').trim();
  if (!key) throw new Error('GROQ_API_KEY is not set in .env');
  return new Groq({ apiKey: key });
}

// Main Chatbot Endpoint — powered by Groq (Llama 3)
router.post('/', async (req, res) => {
  const { message, context } = req.body;

  try {
    console.log('Groq Chat Request received');

    const eligibleSchemes = Array.isArray(context?.eligibilityResults)
      ? context.eligibilityResults
        .filter(r => r.status === 'eligible' || r.status === 'partially_eligible')
        .map(r => r.schemeName)
      : [];

    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are the Community Copilot AI Assistant — a professional advisor helping Indian business owners navigate government schemes and subsidies.

The user's eligible schemes are: ${eligibleSchemes.join(', ') || 'None found yet'}
Summary: ${context?.simplification?.intro || ''}

Be concise, professional, and helpful. If asked about applying for a scheme, provide the most official government portal link you know.`
        },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    res.json({ response });
  } catch (error) {
    console.error('Groq Chat Error:', error.message);
    res.status(500).json({ error: error.message || 'Chat AI failed' });
  }
});

const STATE_SCHEMES = [
  { "state": "Karnataka", "scheme": "Karnataka Elevate", "officialLink": "https://eitbt.karnataka.gov.in/startup" },
  { "state": "Karnataka", "scheme": "Elevate NXT", "officialLink": "https://eitbt.karnataka.gov.in" },
  { "state": "Maharashtra", "scheme": "Maharashtra State Innovation Society", "officialLink": "https://msins.in" },
  { "state": "Tamil Nadu", "scheme": "StartupTN", "officialLink": "https://startuptn.in" },
  { "state": "Delhi", "scheme": "Delhi Startup Policy", "officialLink": "https://dipp.delhi.gov.in" },
  { "state": "Gujarat", "scheme": "Startup Gujarat", "officialLink": "https://startup.gujarat.gov.in" },
  { "state": "Telangana", "scheme": "T-Hub", "officialLink": "https://t-hub.co" },
  { "state": "Telangana", "scheme": "WE Hub", "officialLink": "https://wehub.telangana.gov.in" },
  { "state": "Uttar Pradesh", "scheme": "UP Startup Policy", "officialLink": "https://startup.up.gov.in" },
  { "state": "Rajasthan", "scheme": "iStart Rajasthan", "officialLink": "https://istart.rajasthan.gov.in" },
  { "state": "Kerala", "scheme": "Kerala Startup Mission", "officialLink": "https://startupmission.kerala.gov.in" },
  { "state": "West Bengal", "scheme": "Bengal Silicon Valley Hub", "officialLink": "https://bsv.wb.gov.in" },
  { "state": "Madhya Pradesh", "scheme": "MP Startup Policy", "officialLink": "https://www.invest.mp.gov.in" },
  { "state": "Andhra Pradesh", "scheme": "Startup Andhra Pradesh", "officialLink": "https://startup.ap.gov.in" },
  { "state": "Bihar", "scheme": "Bihar Startup Policy", "officialLink": "https://startup.bihar.gov.in" },
  { "state": "Punjab", "scheme": "Punjab Startup Portal", "officialLink": "https://startup.punjab.gov.in" },
  { "state": "Haryana", "scheme": "Startup Haryana", "officialLink": "https://startupharyana.gov.in" }
];

// Smart Link Discovery — also powered by Groq
router.post('/smart-link', async (req, res) => {
  const { schemeName } = req.body;

  try {
    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are an expert at mapping government schemes to their official URLs. Here is the official database of state schemes: ${JSON.stringify(STATE_SCHEMES)}`
        },
        {
          role: 'user',
          content: `Find the EXACT 'officialLink' from the database for the scheme named or related to: "${schemeName}". If you cannot find a match in the database, do your best to provide the most likely real official URL. Respond with ONLY the URL, nothing else. No markdown, no explanations.`
        }
      ],
      temperature: 0.1,
      max_tokens: 100,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '';
    const url = raw.match(/https?:\/\/[^\s]+/)?.[0] || raw;
    res.json({ url });
  } catch (error) {
    console.error('Smart Link Error:', error.message);
    res.status(500).json({ error: 'Failed to find portal' });
  }
});

export default router;
