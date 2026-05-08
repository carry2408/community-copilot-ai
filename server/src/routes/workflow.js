import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { orchestrator } from '../orchestrator/Orchestrator.js';

export const workflowRouter = Router();

// Start a new workflow
workflowRouter.post('/start', async (req, res) => {
  try {
    const { businessType, state, fundingGoal, revenue, startupAge, description } = req.body;
    
    if (!businessType || !state) {
      return res.status(400).json({ error: 'businessType and state are required' });
    }

    const workflowId = uuidv4();
    
    // Start workflow asynchronously (don't await — SSE will stream updates)
    orchestrator.startWorkflow(workflowId, {
      businessType, state, 
      fundingGoal: fundingGoal || 1000000,
      revenue: revenue || 0,
      startupAge: startupAge || 0,
      description: description || ''
    });

    res.json({ workflowId, status: 'started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SSE stream for real-time agent updates
workflowRouter.get('/:id/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  res.write(`data: ${JSON.stringify({ agent: 'System', status: 'connected', message: 'Connected to workflow stream' })}\n\n`);

  orchestrator.registerSSEClient(req.params.id, res);

  req.on('close', () => {
    orchestrator.removeSSEClient(req.params.id);
  });
});

// Submit interview answers
workflowRouter.post('/:id/answers', async (req, res) => {
  try {
    const { answers } = req.body;
    const workflowId = req.params.id;

    // Continue workflow with answers asynchronously
    orchestrator.continueWithAnswers(workflowId, answers);

    res.json({ status: 'processing', message: 'Answers received, continuing validation...' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get workflow results
workflowRouter.get('/:id/results', (req, res) => {
  const workflow = orchestrator.getWorkflow(req.params.id);
  if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
  res.json(workflow);
});
