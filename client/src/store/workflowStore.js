import { create } from 'zustand';

export const useWorkflowStore = create((set, get) => ({
  // Workflow state
  workflowId: null,
  status: 'idle', // idle | running | awaiting_answers | completed | error
  businessDetails: null,

  // Agent events
  agentEvents: [],
  currentAgent: null,

  // Results
  schemes: [],
  interviewQuestions: [],
  interviewAnswers: {},
  eligibilityResults: [],
  simplification: null,
  documents: null,
  roadmap: null,
  fullResults: null,

  // Actions
  setWorkflowId: (id) => set({ workflowId: id }),
  setStatus: (status) => set({ status }),
  setBusinessDetails: (details) => set({ businessDetails: details }),

  addAgentEvent: (event) => set(state => {
    const events = [...state.agentEvents, { ...event, id: Date.now() }];
    const updates = { agentEvents: events, currentAgent: event.agent };

    // Extract data from events
    if (event.interviewQuestions) {
      updates.interviewQuestions = event.interviewQuestions;
      updates.schemes = event.schemes || state.schemes;
      updates.status = 'awaiting_answers';
    }
    if (event.status === 'completed' && event.results) {
      updates.fullResults = event.results;
      updates.eligibilityResults = event.results.eligibility || [];
      updates.simplification = event.results.simplification || null;
      updates.documents = event.results.documents || null;
      updates.roadmap = event.results.roadmap || null;
      updates.status = 'completed';
    }
    if (event.status === 'error') {
      updates.status = 'error';
    }
    // Update schemes from research agent
    if (event.agent === 'Research Agent' && event.status === 'done' && event.result) {
      updates.schemes = event.result.schemes || [];
    }

    return updates;
  }),

  setInterviewAnswer: (questionId, answer) => set(state => ({
    interviewAnswers: { ...state.interviewAnswers, [questionId]: answer }
  })),

  reset: () => set({
    workflowId: null, status: 'idle', businessDetails: null,
    agentEvents: [], currentAgent: null, schemes: [],
    interviewQuestions: [], interviewAnswers: {},
    eligibilityResults: [], simplification: null, documents: null,
    roadmap: null, fullResults: null
  })
}));
