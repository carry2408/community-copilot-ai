import Groq from 'groq-sdk';

/**
 * GST Registration Automation Agent
 * Orchestrates the "Autonomous Execution Mode" requested by the user.
 */
export async function executeGSTWorkflow(businessDetails, uploadedDocuments, workflowMemory = {}) {
  const key = (process.env.GROQ_API_KEY || '').trim();
  if (!key) throw new Error('GROQ_API_KEY is not set');
  const groq = new Groq({ apiKey: key });

  const systemRole = `
You are an autonomous workflow automation agent responsible for completing GST registration assistance for Indian startups and MSMEs.
Your goal is NOT to simply recommend steps. Your job is to actively execute the workflow using browser automation simulation, form filling, document validation, workflow state tracking, and human-in-the-loop approvals when necessary.

TOOLS AVAILABLE (Simulated for this demo):
* browser.open(url), browser.click(selector), browser.fill(selector, value)
* document.verifyPAN(), document.verifyAadhaar()
* notifier.askUser(question), notifier.requestApproval(action)

CURRENT WORKFLOW MEMORY:
${JSON.stringify(workflowMemory)}

YOUR RESPONSIBILITIES:
1. Validate requirements.
2. Verify documents: ${JSON.stringify(uploadedDocuments)}
3. Navigate portal and fill fields.
4. Save progress and detect failures.
5. Generate a structured action log.

OUTPUT FORMAT (JSON ONLY):
{
  "status": "running" | "awaiting_user" | "completed" | "error",
  "currentStep": "string",
  "actionsCompleted": [
    { "action": "string", "success": true, "timestamp": "ISO string" }
  ],
  "missingInformation": [],
  "requiresUserApproval": boolean,
  "approvalReason": "string",
  "nextAction": "string",
  "errors": [],
  "savedWorkflowState": {}
}
`;

  const userPrompt = `
BUSINESS PROFILE: ${JSON.stringify(businessDetails)}
DOCUMENTS: ${JSON.stringify(uploadedDocuments)}
MEMO: ${JSON.stringify(workflowMemory)}

Analyze the current state and determine the NEXT sequence of autonomous actions. 
Respond with the JSON object representing your current execution state.
`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemRole },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2, // Low temperature for high reliability in JSON
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return result;
  } catch (error) {
    console.error('GST Agent Error:', error);
    return {
      status: 'error',
      errors: [error.message],
      actionsCompleted: workflowMemory.actionsCompleted || []
    };
  }
}
