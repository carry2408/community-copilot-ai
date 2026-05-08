import { BaseAgent } from './BaseAgent.js';
import { askGeminiJSON, isGeminiAvailable } from '../config/gemini.js';

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
        return { name: r.schemeName, documents: scheme?.requiredDocuments || [], status: r.status, id: r.schemeId };
      });

    if (isGeminiAvailable()) {
      try {
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
        { "name": "PAN Card", "priority": "high", "likelyAvailable": true, "howToGet": "Already issued by Income Tax Dept", "applicableSchemes": ["Scheme 1"], "estimatedTime": "Already available" }
      ]
    }
  ],
  "missingDocumentAlerts": [
    { "document": "DPIIT Recognition", "urgency": "high", "impact": "Required for 3 schemes", "howToGet": "Apply at startupindia.gov.in — takes 2-3 days" }
  ]
}`;
        return await askGeminiJSON(prompt);
      } catch (e) {
        console.log('DocumentAgent falling back to template checklist');
      }
    }

    // Rule-based fallback — consolidate all required docs
    const allDocs = new Map();
    eligibleSchemes.forEach(s => {
      s.documents.forEach(doc => {
        if (!allDocs.has(doc)) allDocs.set(doc, []);
        allDocs.get(doc).push(s.name);
      });
    });

    const identity = [], registration = [], financial = [], business = [];
    allDocs.forEach((schemeNames, doc) => {
      const entry = { name: doc, priority: schemeNames.length > 2 ? 'high' : 'medium', likelyAvailable: ['PAN Card', 'Aadhaar Card', 'Passport Size Photos'].includes(doc), howToGet: '', applicableSchemes: schemeNames, estimatedTime: '' };
      if (['PAN Card', 'Aadhaar Card', 'Aadhaar of Directors', 'Passport Size Photos', 'Address Proof', 'Identity and Address Proof', 'Caste Certificate (if applicable)'].includes(doc)) {
        entry.estimatedTime = entry.likelyAvailable ? 'Already available' : '1-2 days'; identity.push(entry);
      } else if (['Udyam Registration Certificate', 'GST Registration', 'GST Registration Certificate', 'GST Certificate', 'DPIIT Recognition Certificate', 'DPIIT Recognition', 'Certificate of Incorporation', 'Business Registration/License'].includes(doc)) {
        entry.estimatedTime = '2-7 days'; entry.howToGet = doc.includes('Udyam') ? 'udyamregistration.gov.in' : doc.includes('DPIIT') ? 'startupindia.gov.in' : doc.includes('GST') ? 'gst.gov.in' : ''; registration.push(entry);
      } else if (['Bank Account Details', 'Bank Statement (6 months)', 'Bank Statement (12 months)', 'ITR (last 2 years)', 'Interest Payment Receipts', 'Investment Proof (machinery/equipment invoices)'].includes(doc)) {
        entry.estimatedTime = '1-3 days'; financial.push(entry);
      } else {
        entry.estimatedTime = '3-7 days'; business.push(entry);
      }
    });

    const missingAlerts = [];
    registration.filter(d => !d.likelyAvailable).forEach(d => {
      missingAlerts.push({ document: d.name, urgency: d.priority, impact: `Required for ${d.applicableSchemes.length} scheme(s)`, howToGet: d.howToGet || 'Apply on respective government portal' });
    });

    return {
      totalDocuments: allDocs.size,
      categories: [
        { name: '🪪 Identity & Personal', documents: identity },
        { name: '📋 Registration & Compliance', documents: registration },
        { name: '💰 Financial Documents', documents: financial },
        { name: '📄 Business Documents', documents: business }
      ].filter(c => c.documents.length > 0),
      missingDocumentAlerts: missingAlerts
    };
  }
}
