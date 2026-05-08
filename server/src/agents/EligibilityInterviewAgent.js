import { BaseAgent } from './BaseAgent.js';
import { askGeminiJSON, isGeminiAvailable } from '../config/gemini.js';

export class EligibilityInterviewAgent extends BaseAgent {
  constructor() {
    super('Eligibility Interview Agent', '🎤', '#f59e0b');
  }

  async run(input) {
    const { schemes, businessDetails } = input;

    if (isGeminiAvailable()) {
      try {
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
      } catch (e) {
        console.log('InterviewAgent falling back to template questions');
      }
    }

    // Smart fallback — generate questions from scheme requirements
    const questions = [
      { id: 'q1', question: 'Do you have Udyam (MSME) Registration?', type: 'yes_no', options: null, purpose: 'Required for MSME subsidies and collateral-free loans', relatedSchemes: schemes.filter(s => s.eligibility.requirements.msmeRegistered).map(s => s.id) },
      { id: 'q2', question: 'Do you have GST Registration?', type: 'yes_no', options: null, purpose: 'Required for most government schemes and subsidies', relatedSchemes: schemes.filter(s => s.eligibility.requirements.gstRegistered).map(s => s.id) },
      { id: 'q3', question: 'Do you have DPIIT Startup Recognition?', type: 'yes_no', options: null, purpose: 'Required for startup-specific schemes like SISFS and ELEVATE', relatedSchemes: schemes.filter(s => s.eligibility.requirements.dpiitRecognized).map(s => s.id) },
      { id: 'q4', question: 'What is your primary business sector?', type: 'multiple_choice', options: ['Technology/IT', 'Manufacturing', 'Services', 'Food Processing', 'Retail/Trading', 'Agriculture', 'Healthcare', 'Education'], purpose: 'Some schemes are sector-specific', relatedSchemes: [] },
      { id: 'q5', question: 'Is the business owned/co-owned by a woman entrepreneur?', type: 'yes_no', options: null, purpose: 'Special schemes available for women entrepreneurs (Stand-Up India, higher subsidies)', relatedSchemes: schemes.filter(s => s.eligibility.requirements.womenOwned).map(s => s.id) },
      { id: 'q6', question: 'How many employees does your business currently have?', type: 'multiple_choice', options: ['1-5', '6-20', '21-50', '50+'], purpose: 'Determines eligibility for talent support and employment schemes', relatedSchemes: [] },
      { id: 'q7', question: 'Do you belong to SC/ST/OBC/Minority category?', type: 'yes_no', options: null, purpose: 'Higher subsidies and special schemes available for SC/ST entrepreneurs', relatedSchemes: [] }
    ];

    return questions;
  }
}
