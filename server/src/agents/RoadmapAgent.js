import { BaseAgent } from './BaseAgent.js';
import { askGeminiJSON } from '../config/gemini.js';

export class RoadmapAgent extends BaseAgent {
  constructor() {
    super('Roadmap Agent', '🗺️', '#f97316');
  }

  async run(input) {
    const { eligibilityResults, schemes, businessDetails, documentChecklist } = input;

    const eligibleSchemes = eligibilityResults
      .filter(r => r.status === 'eligible' || r.status === 'partially_eligible')
      .map(r => r.schemeName);

    const prompt = `You are an application roadmap planner for Indian government funding schemes.

Business: ${businessDetails.businessType} in ${businessDetails.state}, age ${businessDetails.startupAge} years.

Eligible schemes: ${eligibleSchemes.join(', ')}

Create a step-by-step action roadmap to apply for these schemes. Be practical and specific.

Return JSON:
{
  "totalSteps": 8,
  "estimatedTotalDays": 45,
  "phases": [
    {
      "phase": 1,
      "title": "Phase Title",
      "duration": "Week 1-2",
      "steps": [
        {
          "step": 1,
          "title": "Step title",
          "description": "What to do",
          "actionItems": ["specific action 1", "specific action 2"],
          "estimatedDays": 3,
          "difficulty": "easy" | "medium" | "hard",
          "tips": "helpful tip"
        }
      ]
    }
  ],
  "reminders": [
    { "title": "Reminder title", "dueIn": "7 days", "description": "What to remember" }
  ],
  "quickWins": ["Things that can be done immediately"]
}`;

    return await askGeminiJSON(prompt);
  }
}
