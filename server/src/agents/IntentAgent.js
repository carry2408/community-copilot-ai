import { BaseAgent } from './BaseAgent.js';
import { askGeminiJSON, isGeminiAvailable } from '../config/gemini.js';

export class IntentAgent extends BaseAgent {
  constructor() {
    super('Intent Agent', '🧠', '#8b5cf6');
  }

  async run(input) {
    const { businessType, state, fundingGoal, revenue, startupAge, description } = input;

    // Try Gemini first, fallback to rule-based
    if (isGeminiAvailable()) {
      try {
        const prompt = `You are an AI intent classifier for government funding assistance.

A user has provided these business details:
- Business Type: ${businessType}
- State: ${state}
- Funding Goal: ${fundingGoal}
- Annual Revenue: ₹${revenue} Lakhs
- Business Age: ${startupAge} years
- Description: ${description || 'Not provided'}

Classify their intent and needs. Return JSON:
{
  "primaryIntent": "scheme_discovery" | "loan_assistance" | "subsidy_claim" | "registration_help",
  "businessCategory": "micro" | "small" | "medium" | "startup",
  "urgency": "high" | "medium" | "low",
  "focusAreas": ["list of relevant areas like manufacturing, services, technology etc"],
  "summary": "One line summary of what the user needs"
}`;
        return await askGeminiJSON(prompt);
      } catch (e) {
        console.log('IntentAgent falling back to rule-based classification');
      }
    }

    // Rule-based fallback
    const categoryMap = { startup: 'startup', micro: 'micro', small: 'small', medium: 'medium', pvt_ltd: 'startup', llp: 'startup', proprietorship: 'micro', partnership: 'small' };
    return {
      primaryIntent: 'scheme_discovery',
      businessCategory: categoryMap[businessType] || 'startup',
      urgency: fundingGoal > 50 ? 'high' : 'medium',
      focusAreas: ['technology', 'services', description?.includes('tech') ? 'deeptech' : 'general'],
      summary: `${businessType} in ${state} seeking ₹${fundingGoal}L funding`
    };
  }
}
