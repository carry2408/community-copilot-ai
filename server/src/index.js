import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { workflowRouter } from './routes/workflow.js';
import { schemesRouter } from './routes/schemes.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes
app.use('/api/workflow', workflowRouter);
app.use('/api/schemes', schemesRouter);

app.listen(PORT, () => {
  console.log(` Community Copilot Server running on port ${PORT}`);
});
