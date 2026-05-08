import { IntentAgent } from '../agents/IntentAgent.js';
import { ResearchAgent } from '../agents/ResearchAgent.js';
import { EligibilityInterviewAgent } from '../agents/EligibilityInterviewAgent.js';
import { EligibilityValidationAgent } from '../agents/EligibilityValidationAgent.js';
import { SimplificationAgent } from '../agents/SimplificationAgent.js';
import { DocumentAgent } from '../agents/DocumentAgent.js';
import { RoadmapAgent } from '../agents/RoadmapAgent.js';

// In-memory workflow store (for hackathon — replace with Firestore later)
const workflows = new Map();
const sseClients = new Map();

export class Orchestrator {
  constructor() {
    this.intentAgent = new IntentAgent();
    this.researchAgent = new ResearchAgent();
    this.interviewAgent = new EligibilityInterviewAgent();
    this.validationAgent = new EligibilityValidationAgent();
    this.simplificationAgent = new SimplificationAgent();
    this.documentAgent = new DocumentAgent();
    this.roadmapAgent = new RoadmapAgent();
  }

  getWorkflow(id) { return workflows.get(id); }

  registerSSEClient(workflowId, res) {
    sseClients.set(workflowId, res);
  }

  removeSSEClient(workflowId) {
    sseClients.delete(workflowId);
  }

  emit(workflowId, data) {
    const client = sseClients.get(workflowId);
    if (client) {
      client.write(`data: ${JSON.stringify(data)}\n\n`);
    }
    // Also update workflow state
    const wf = workflows.get(workflowId);
    if (wf) {
      wf.events.push({ ...data, timestamp: new Date().toISOString() });
    }
  }

  async startWorkflow(workflowId, businessDetails) {
    const workflow = {
      id: workflowId,
      businessDetails,
      status: 'running',
      currentAgent: null,
      events: [],
      results: {},
      createdAt: new Date().toISOString()
    };
    workflows.set(workflowId, workflow);

    const emitStatus = (data) => this.emit(workflowId, data);

    try {
      // Phase 1: Intent Classification
      await this.delay(500);
      const intentResult = await this.intentAgent.execute(businessDetails, emitStatus);
      workflow.results.intent = intentResult;

      // Phase 2: Research Schemes
      await this.delay(300);
      const researchResult = await this.researchAgent.execute(
        { ...businessDetails, intentResult }, emitStatus
      );
      workflow.results.research = researchResult;

      // Phase 3: Generate Interview Questions
      await this.delay(300);
      const interviewQuestions = await this.interviewAgent.execute(
        { schemes: researchResult.schemes, businessDetails }, emitStatus
      );
      workflow.results.interviewQuestions = interviewQuestions;

      // Pause — wait for user to answer interview questions
      workflow.status = 'awaiting_answers';
      workflow.currentAgent = 'Eligibility Interview Agent';
      this.emit(workflowId, {
        agent: 'Orchestrator',
        emoji: '🎯',
        color: '#6366f1',
        status: 'awaiting_input',
        message: 'Please answer the eligibility questions to continue',
        interviewQuestions,
        schemes: researchResult.schemes
      });

    } catch (error) {
      workflow.status = 'error';
      this.emit(workflowId, {
        agent: 'Orchestrator',
        emoji: '❌',
        color: '#ef4444',
        status: 'error',
        message: `Workflow error: ${error.message}`
      });
    }
  }

  async continueWithAnswers(workflowId, answers) {
    const workflow = workflows.get(workflowId);
    if (!workflow) throw new Error('Workflow not found');

    workflow.status = 'running';
    workflow.results.interviewAnswers = answers;
    const emitStatus = (data) => this.emit(workflowId, data);
    const { businessDetails } = workflow;
    const schemes = workflow.results.research.schemes;

    try {
      // Phase 4: Validate Eligibility
      await this.delay(300);
      const eligibilityResults = await this.validationAgent.execute(
        { schemes, businessDetails, interviewAnswers: answers }, emitStatus
      );
      workflow.results.eligibility = eligibilityResults;

      // Phase 5: Simplify Explanation
      await this.delay(300);
      const simplification = await this.simplificationAgent.execute(
        { eligibilityResults, schemes }, emitStatus
      );
      workflow.results.simplification = simplification;

      // Phase 6: Document Checklist
      await this.delay(300);
      const documentChecklist = await this.documentAgent.execute(
        { eligibilityResults, schemes, businessDetails }, emitStatus
      );
      workflow.results.documents = documentChecklist;

      // Phase 7: Roadmap
      await this.delay(300);
      const roadmap = await this.roadmapAgent.execute(
        { eligibilityResults, schemes, businessDetails, documentChecklist }, emitStatus
      );
      workflow.results.roadmap = roadmap;

      // Done!
      workflow.status = 'completed';
      this.emit(workflowId, {
        agent: 'Orchestrator',
        emoji: '🎉',
        color: '#22c55e',
        status: 'completed',
        message: 'All agents have completed! Your results are ready.',
        results: workflow.results
      });

    } catch (error) {
      console.error(`Workflow ${workflowId} failed:`, error);
      const workflow = workflows.get(workflowId);
      if (workflow) {
        workflow.status = 'error';
      }
      this.emit(workflowId, {
        agent: 'Orchestrator', emoji: '❌', color: '#ef4444',
        status: 'error', message: `Error: ${error.message}`
      });
    }
  }

  delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
}

export const orchestrator = new Orchestrator();
