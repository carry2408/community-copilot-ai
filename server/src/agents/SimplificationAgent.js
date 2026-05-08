import { BaseAgent } from './BaseAgent.js';
import { askGemini, isGeminiAvailable } from '../config/gemini.js';

export class SimplificationAgent extends BaseAgent {
  constructor() {
    super('Simplification Agent', '', '#ec4899');
  }

  async run(input) {
    const { eligibilityResults, schemes } = input;
    const eligible = eligibilityResults.filter(r => r.status === 'eligible' || r.status === 'partially_eligible');
    const notEligible = eligibilityResults.filter(r => r.status === 'not_eligible');

    if (isGeminiAvailable()) {
      try {
        const prompt = `You are a professional government scheme advisor.
Review these eligibility results and create a structured professional summary.

RESULTS:
${eligible.map(r => `- ${r.schemeName}: ${r.status}`).join('\n')}

Format your response as a JSON object with:
1. "intro": A professional opening (1-2 sentences)
2. "points": An array of objects with:
   - "title": Scheme name (no markdown symbols like **)
   - "status": Eligible or Partially Eligible
   - "details": 1 sentence explanation
   - "action": What is missing or next step
3. "outro": A motivating closing statement

Respond ONLY with JSON.`;
        const result = await askGeminiJSON(prompt);

        // Attach links to points
        const pointsWithLinks = result.points.map(p => {
          const original = eligible.find(e => e.schemeName.toLowerCase().includes(p.title.toLowerCase()) || p.title.toLowerCase().includes(e.schemeName.toLowerCase()));
          return { ...p, link: original?.websiteUrl || original?.applyLink || "https://www.startupindia.gov.in" };
        });

        return {
          structured: true,
          intro: result.intro,
          points: pointsWithLinks,
          outro: result.outro,
          eligibleCount: eligible.length,
          totalChecked: eligibilityResults.length
        };
      } catch (e) {
        console.log('SimplificationAgent fallback');
      }
    }

    // Fallback structured data
    return {
      structured: true,
      intro: `Great news! You qualify for ${eligible.length} government schemes.`,
      points: eligible.map(r => ({
        title: r.schemeName.replace(/\*\*/g, ''),
        status: r.status === 'eligible' ? 'Fully Eligible' : 'Partially Eligible',
        details: r.reasons[0] || 'Meets basic criteria',
        action: r.missingRequirements?.length ? `Still needed: ${r.missingRequirements.join(', ')}` : 'Ready to apply',
        link: r.websiteUrl || r.applyLink || "https://www.startupindia.gov.in"
      })),
      outro: "Next Step: Start with the document checklist below.",
      eligibleCount: eligible.length,
      totalChecked: eligibilityResults.length
    };
  }
}
