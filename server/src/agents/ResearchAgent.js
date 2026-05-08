import { BaseAgent } from './BaseAgent.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class ResearchAgent extends BaseAgent {
  constructor() {
    super('Research Agent', '🔍', '#3b82f6');
    const dataPath = join(__dirname, '../../datasets/schemes.json');
    this.schemes = JSON.parse(readFileSync(dataPath, 'utf-8'));
  }

  async run(input) {
    const { businessType, state, fundingGoal, revenue, startupAge, intentResult } = input;
    
    // Local filtering first (fast, free, reliable)
    const matches = this.schemes.filter(scheme => {
      const e = scheme.eligibility;
      
      // State filter
      const stateMatch = e.states.includes('All India') || 
                         e.states.map(s => s?.toLowerCase()).includes((state || '').toLowerCase());
      if (!stateMatch) return false;

      // Business type filter (loose match)
      const typeMap = {
        'startup': ['startup', 'pvt_ltd', 'llp'],
        'micro': ['micro', 'proprietorship'],
        'small': ['small', 'proprietorship', 'partnership', 'pvt_ltd'],
        'medium': ['medium', 'pvt_ltd'],
        'proprietorship': ['proprietorship', 'micro'],
        'partnership': ['partnership', 'small'],
        'pvt_ltd': ['pvt_ltd', 'startup', 'small', 'medium'],
        'llp': ['llp', 'startup']
      };
      const userTypes = typeMap[businessType.toLowerCase()] || [businessType.toLowerCase()];
      const typeMatch = userTypes.some(t => e.businessTypes.includes(t));
      if (!typeMatch) return false;

      // Age filter
      if (e.maxAgeYears > 0 && startupAge > e.maxAgeYears) return false;

      // Revenue filter
      if (e.maxRevenueLakhs > 0 && revenue > e.maxRevenueLakhs) return false;

      return true;
    });

    // Score and sort matches
    const scored = matches.map(scheme => {
      let score = 50; // base score
      const e = scheme.eligibility;
      
      if (e.states.includes(state)) score += 20; // state-specific bonus
      if (scheme.category === 'grant' || scheme.category === 'subsidy') score += 15;
      if (scheme.fundingAmount.max >= fundingGoal * 100000) score += 10;
      if (intentResult?.focusAreas?.some(area => e.sectors.includes(area))) score += 10;
      
      return { ...scheme, matchScore: Math.min(score, 100) };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);

    return {
      totalFound: scored.length,
      schemes: scored.slice(0, 8), // Top 8 matches
      searchCriteria: { businessType, state, revenue, startupAge }
    };
  }
}
