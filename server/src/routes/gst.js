import express from 'express';
import { executeGSTWorkflow } from '../agents/GSTAgent.js';

const router = express.Router();

router.post('/execute', async (req, res) => {
  const { businessDetails, uploadedDocuments, workflowMemory } = req.body;
  
  try {
    const result = await executeGSTWorkflow(businessDetails, uploadedDocuments, workflowMemory);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
