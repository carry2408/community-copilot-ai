import { BaseAgent } from './BaseAgent.js';
import { askGeminiJSON } from '../config/gemini.js';

export class DocumentAgent extends BaseAgent {
  constructor() {
    super('Document Agent', '📋', '#06b6d4');
  }

  async run(input) {
    const { eligibilityResults, schemes, businessDetails } = input;

    const eligibleSchemes = eligibilityResults
      .filter(r => r.status === 'eligible' || r.status === 'partially_eligible')
      .map(r => {
        const scheme = schemes.find(s => s.id === r.schemeId);
        return { name: r.schemeName, documents: scheme?.requiredDocuments || [], status: r.status };
      });

    const prompt = `You are a document preparation assistant for Indian government scheme applications.

Business: ${businessDetails.businessType} in ${businessDetails.state}

The user is eligible/partially eligible for these schemes:
${eligibleSchemes.map(s => `${s.name} (${s.status}): needs ${s.documents.join(', ')}`).join('\n')}

Create a consolidated, prioritized document checklist. Group documents by category and mark which are likely already available vs need to be obtained.

Return JSON:
{
  "totalDocuments": 12,
  "categories": [
    {
      "name": "Identity & Registration",
      "documents": [
        {
          "name": "PAN Card",
          "priority": "high",
          "likelyAvailable": true,
          "howToGet": "Already issued by Income Tax Dept",
          "applicableSchemes": ["Scheme 1", "Scheme 2"],
          "estimatedTime": "Already available"
        }
      ]
    }
  ],
  "missingDocumentAlerts": [
    { "document": "DPIIT Recognition", "urgency": "high", "impact": "Required for 3 schemes", "howToGet": "Apply at startupindia.gov.in — takes 2-3 days" }
  ]
}`;

    return await askGeminiJSON(prompt);
  }
}
