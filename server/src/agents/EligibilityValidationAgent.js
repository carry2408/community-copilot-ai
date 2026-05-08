import { BaseAgent } from './BaseAgent.js';
import { askGeminiJSON, isGeminiAvailable } from '../config/gemini.js';

export class EligibilityValidationAgent extends BaseAgent {
  constructor() {
    super('Eligibility Validation Agent', '✅', '#22c55e');
  }

  async run(input) {
    const { schemes, businessDetails, interviewAnswers } = input;

    if (isGeminiAvailable()) {
      try {
        const schemeSummaries = schemes.map(s => ({
          id: s.id, name: s.name,
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
      } catch (e) {
        console.log('ValidationAgent falling back to rule-based validation');
      }
    }

    // Rule-based fallback
    return schemes.map(scheme => {
      const reqs = scheme.eligibility.requirements;
      const reasons = [];
      const missing = [];
      let score = 70;

      // Check MSME registration
      if (reqs.msmeRegistered) {
        if (interviewAnswers.q1 === 'Yes') { reasons.push('Has Udyam/MSME Registration ✓'); score += 10; }
        else { missing.push('Udyam Registration required'); score -= 15; }
      }
      // Check GST
      if (reqs.gstRegistered) {
        if (interviewAnswers.q2 === 'Yes') { reasons.push('Has GST Registration ✓'); score += 5; }
        else { missing.push('GST Registration required'); score -= 10; }
      }
      // Check DPIIT
      if (reqs.dpiitRecognized) {
        if (interviewAnswers.q3 === 'Yes') { reasons.push('Has DPIIT Recognition ✓'); score += 10; }
        else { missing.push('DPIIT Recognition required'); score -= 15; }
      }
      // Check women/SC-ST specific
      if (reqs.womenOwned && interviewAnswers.q5 !== 'Yes') { missing.push('This scheme requires women ownership'); score -= 20; }
      if (reqs.scStOwned && interviewAnswers.q7 !== 'Yes') { missing.push('This scheme requires SC/ST category'); score -= 20; }

      // Age and revenue checks
      if (scheme.eligibility.maxAgeYears > 0 && businessDetails.startupAge <= scheme.eligibility.maxAgeYears) {
        reasons.push(`Business age (${businessDetails.startupAge}yr) within limit (${scheme.eligibility.maxAgeYears}yr) ✓`);
      }
      if (scheme.eligibility.states.includes(businessDetails.state) || scheme.eligibility.states.includes('All India')) {
        reasons.push(`State ${businessDetails.state} eligible ✓`);
      }

      score = Math.max(10, Math.min(95, score));
      const status = missing.length === 0 ? 'eligible' : missing.length <= 2 ? 'partially_eligible' : 'not_eligible';

      return {
        schemeId: scheme.id,
        schemeName: scheme.name,
        status,
        confidence: score,
        reasons: reasons.length ? reasons : ['Meets basic eligibility criteria'],
        missingRequirements: missing,
        tip: missing.length > 0 ? `Get ${missing[0]} to improve eligibility` : 'You meet all requirements — proceed with application!'
      };
    });
  }
}
