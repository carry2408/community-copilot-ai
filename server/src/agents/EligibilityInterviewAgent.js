import { BaseAgent } from './BaseAgent.js';
import { askGeminiJSON } from '../config/gemini.js';

export class EligibilityInterviewAgent extends BaseAgent {
  constructor() {
    super('Eligibility Interview Agent', '🎤', '#f59e0b');
  }

  async run(input) {
    const { schemes, businessDetails } = input;
    const schemeNames = schemes.map(s => s.name).join(', ');
    const schemeRequirements = schemes.map(s => {
      const reqs = s.eligibility.requirements;
      return `${s.name}: needs ${Object.entries(reqs).filter(([,v]) => v).map(([k]) => k).join(', ') || 'basic docs'}`;
    }).join('\n');

    const prompt = `You are an eligibility interview AI for government funding schemes in India.

The user has a ${businessDetails.businessType} business in ${businessDetails.state}, age ${businessDetails.startupAge} years, revenue ₹${businessDetails.revenue} Lakhs.

They matched these schemes: ${schemeNames}

Scheme requirements:
${schemeRequirements}

Generate 5-7 smart follow-up questions to determine precise eligibility. Mix question types.

Return JSON array:
[
  {
    "id": "q1",
    "question": "the question text",
    "type": "yes_no" | "multiple_choice" | "number" | "text",
    "options": ["option1", "option2"] (only for multiple_choice),
    "purpose": "why this question matters",
    "relatedSchemes": ["scheme-id-1"]
  }
]

Focus on: MSME registration, GST, DPIIT recognition, women/SC-ST ownership, sector, employees, existing loans. Make questions conversational and clear.`;

    return await askGeminiJSON(prompt);
  }
}
