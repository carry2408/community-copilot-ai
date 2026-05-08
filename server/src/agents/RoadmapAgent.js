import { BaseAgent } from './BaseAgent.js';
import { askGeminiJSON, isGeminiAvailable } from '../config/gemini.js';

export class RoadmapAgent extends BaseAgent {
  constructor() {
    super('Roadmap Agent', '🗺️', '#f97316');
  }

  async run(input) {
    const { eligibilityResults, schemes, businessDetails, documentChecklist } = input;
    const eligibleSchemes = eligibilityResults
      .filter(r => r.status === 'eligible' || r.status === 'partially_eligible')
      .map(r => r.schemeName);

    if (isGeminiAvailable()) {
      try {
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
      "phase": 1, "title": "Phase Title", "duration": "Week 1-2",
      "steps": [
        { "step": 1, "title": "Step title", "description": "What to do", "actionItems": ["action 1"], "estimatedDays": 3, "difficulty": "easy", "tips": "helpful tip" }
      ]
    }
  ],
  "reminders": [{ "title": "Reminder", "dueIn": "7 days", "description": "What to remember" }],
  "quickWins": ["Things that can be done immediately"]
}`;
        return await askGeminiJSON(prompt);
      } catch (e) {
        console.log('RoadmapAgent falling back to template roadmap');
      }
    }

    // Template fallback
    return {
      totalSteps: 8,
      estimatedTotalDays: 30,
      phases: [
        {
          phase: 1, title: 'Registration & Compliance', duration: 'Week 1',
          steps: [
            { step: 1, title: 'Complete Udyam Registration', description: 'Register your business on the Udyam portal to get MSME classification', actionItems: ['Visit udyamregistration.gov.in', 'Keep Aadhaar and PAN ready', 'Fill business details and submit'], estimatedDays: 1, difficulty: 'easy', tips: 'This is free and instant — do it today!' },
            { step: 2, title: 'Get GST Registration', description: 'Apply for GSTIN if not already registered', actionItems: ['Visit gst.gov.in', 'Submit required documents', 'Complete verification'], estimatedDays: 3, difficulty: 'medium', tips: 'Required for most government schemes' },
            { step: 3, title: 'Apply for DPIIT Recognition', description: 'Get Startup India recognition if applicable', actionItems: ['Visit startupindia.gov.in', 'Complete the application', 'Upload proof of innovation'], estimatedDays: 3, difficulty: 'medium', tips: 'This unlocks startup-specific schemes' }
          ]
        },
        {
          phase: 2, title: 'Document Preparation', duration: 'Week 2',
          steps: [
            { step: 4, title: 'Gather Identity Documents', description: 'Collect all personal and business identity documents', actionItems: ['PAN Card copies', 'Aadhaar copies of all directors', 'Address proof'], estimatedDays: 2, difficulty: 'easy', tips: 'Most of these should be readily available' },
            { step: 5, title: 'Prepare Financial Documents', description: 'Collect bank statements, ITR, and financial records', actionItems: ['Get 6-month bank statement', 'Compile last 2 years ITR', 'Prepare CA certificate if needed'], estimatedDays: 3, difficulty: 'medium', tips: 'Contact your CA/accountant early' }
          ]
        },
        {
          phase: 3, title: 'Application Submission', duration: 'Week 3-4',
          steps: [
            { step: 6, title: 'Prepare Business Plan / Pitch Deck', description: 'Create a compelling business plan for scheme applications', actionItems: ['Write executive summary', 'Detail market opportunity', 'Include financial projections'], estimatedDays: 5, difficulty: 'hard', tips: 'Focus on impact and innovation' },
            { step: 7, title: `Apply for ${eligibleSchemes[0] || 'Top Scheme'}`, description: 'Submit application for your best-matched scheme', actionItems: ['Visit scheme portal', 'Fill application form', 'Upload all documents', 'Submit and note application ID'], estimatedDays: 2, difficulty: 'medium', tips: 'Apply to the highest-value scheme first' },
            { step: 8, title: 'Apply for Remaining Schemes', description: 'Submit applications for other eligible schemes', actionItems: eligibleSchemes.slice(1, 4).map(s => `Apply for ${s}`), estimatedDays: 5, difficulty: 'medium', tips: 'Many documents overlap — reuse what you prepared' }
          ]
        }
      ],
      reminders: [
        { title: 'Complete Udyam Registration', dueIn: '2 days', description: 'This is the quickest win — do it first' },
        { title: 'Check Application Status', dueIn: '14 days', description: 'Follow up on submitted applications' },
        { title: 'Document Expiry Check', dueIn: '30 days', description: 'Ensure all documents are current and valid' }
      ],
      quickWins: [
        'Register on Udyam portal today (free, instant)',
        'Create account on Startup India portal',
        'Download bank statement from online banking',
        'Start drafting your business plan outline'
      ]
    };
  }
}
