import { BaseAgent } from './BaseAgent.js';
import { askGemini, isGeminiAvailable } from '../config/gemini.js';

export class SimplificationAgent extends BaseAgent {
  constructor() {
    super('Simplification Agent', '📝', '#ec4899');
  }

  async run(input) {
    const { eligibilityResults, schemes } = input;
    const eligible = eligibilityResults.filter(r => r.status === 'eligible' || r.status === 'partially_eligible');
    const notEligible = eligibilityResults.filter(r => r.status === 'not_eligible');

    if (isGeminiAvailable()) {
      try {
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
      } catch (e) {
        console.log('SimplificationAgent falling back to template summary');
      }
    }

    // Fallback summary
    const lines = [];
    if (eligible.length > 0) {
      lines.push(`🎉 Great news! You are eligible for ${eligible.length} government funding scheme${eligible.length > 1 ? 's' : ''}!\n`);
      eligible.forEach(r => {
        lines.push(`✅ **${r.schemeName}** — ${r.status === 'eligible' ? 'Fully Eligible' : 'Partially Eligible'}`);
        lines.push(`   ${r.reasons[0] || 'Meets basic criteria'}`);
        if (r.missingRequirements?.length) lines.push(`   ⚠️ Still needed: ${r.missingRequirements.join(', ')}`);
        lines.push('');
      });
    }
    if (notEligible.length > 0) {
      lines.push(`\n📋 ${notEligible.length} scheme${notEligible.length > 1 ? 's' : ''} didn't match your current profile, but that's okay — you can work towards eligibility!\n`);
      notEligible.forEach(r => lines.push(`   ❌ ${r.schemeName}: ${r.missingRequirements?.[0] || 'Requirements not met'}`));
    }
    lines.push(`\n🚀 Next Step: Start with the document checklist below and begin your application process. You've got this!`);

    return { summary: lines.join('\n'), eligibleCount: eligible.length, totalChecked: eligibilityResults.length };
  }
}
