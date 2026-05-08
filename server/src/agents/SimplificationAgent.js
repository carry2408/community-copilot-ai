import { BaseAgent } from './BaseAgent.js';
import { askGemini } from '../config/gemini.js';

export class SimplificationAgent extends BaseAgent {
  constructor() {
    super('Simplification Agent', '📝', '#ec4899');
  }

  async run(input) {
    const { eligibilityResults, schemes } = input;

    const eligible = eligibilityResults.filter(r => r.status === 'eligible' || r.status === 'partially_eligible');
    const notEligible = eligibilityResults.filter(r => r.status === 'not_eligible');

    const prompt = `You are a friendly government scheme advisor who explains things simply in plain English (with some Hindi terms where helpful).

The user checked eligibility for government funding schemes. Here are the results:

ELIGIBLE/PARTIALLY ELIGIBLE:
${eligible.map(r => `- ${r.schemeName}: ${r.status} (${r.reasons.join(', ')})`).join('\n') || 'None'}

NOT ELIGIBLE:
${notEligible.map(r => `- ${r.schemeName}: ${r.reasons.join(', ')}`).join('\n') || 'None'}

Write a clear, encouraging summary (200-300 words) that:
1. Celebrates what they qualify for
2. Explains WHY they're eligible in simple language
3. For partially eligible ones, explains what's missing
4. For ineligible ones, briefly explains why without being discouraging
5. Ends with a motivating next step

Use simple language. Avoid jargon. Be warm and helpful like a knowledgeable friend.`;

    const summary = await askGemini(prompt);
    return { summary, eligibleCount: eligible.length, totalChecked: eligibilityResults.length };
  }
}
