import { BaseAgent } from './BaseAgent.js';
import { askGeminiJSON } from '../config/gemini.js';

export class EligibilityValidationAgent extends BaseAgent {
  constructor() {
    super('Eligibility Validation Agent', '✅', '#22c55e');
  }

  async run(input) {
    const { schemes, businessDetails, interviewAnswers } = input;

    const schemeSummaries = schemes.map(s => ({
      id: s.id,
      name: s.name,
      requirements: s.eligibility.requirements,
      maxAge: s.eligibility.maxAgeYears,
      maxRevenue: s.eligibility.maxRevenueLakhs,
      businessTypes: s.eligibility.businessTypes,
      states: s.eligibility.states
    }));

    const prompt = `You are an eligibility validation AI for Indian government funding schemes.

Business Details:
${JSON.stringify(businessDetails, null, 2)}

Interview Answers:
${JSON.stringify(interviewAnswers, null, 2)}

Schemes to validate against:
${JSON.stringify(schemeSummaries, null, 2)}

For each scheme, determine if the user is eligible, partially eligible, or not eligible.

Return JSON array:
[
  {
    "schemeId": "scheme-id",
    "schemeName": "Scheme Name",
    "status": "eligible" | "partially_eligible" | "not_eligible",
    "confidence": 85,
    "reasons": ["reason 1", "reason 2"],
    "missingRequirements": ["what they still need"],
    "tip": "one helpful tip to improve eligibility"
  }
]`;

    return await askGeminiJSON(prompt);
  }
}
