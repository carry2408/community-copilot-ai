import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import { workflowRouter } from './routes/workflow.js';
import { schemesRouter } from './routes/schemes.js';
import chatRouter from './routes/chat.js';
import gstRouter from './routes/gst.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes
app.use('/api/workflow', workflowRouter);
app.use('/api/schemes', schemesRouter);
app.use('/api/chat', chatRouter);
app.use('/api/gst', gstRouter);

// Local dev server
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Community Copilot Server running on port ${PORT}`);
  });
}

// Global Error Catching
process.on('unhandledRejection', (reason, promise) => {
  console.error(' Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error(' Uncaught Exception:', err);
});

// Export for Vercel serverless
export default app;
