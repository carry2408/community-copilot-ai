import { Router } from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataPath = join(__dirname, '../../datasets/schemes.json');
const schemes = JSON.parse(readFileSync(dataPath, 'utf-8'));

export const schemesRouter = Router();

// Get all schemes
schemesRouter.get('/', (req, res) => {
  const { state, category, businessType } = req.query;
  let filtered = [...schemes];

  if (state) filtered = filtered.filter(s => 
    s.eligibility.states.includes('All India') || s.eligibility.states.includes(state)
  );
  if (category) filtered = filtered.filter(s => s.category === category);
  if (businessType) filtered = filtered.filter(s => 
    s.eligibility.businessTypes.includes(businessType)
  );

  res.json({ total: filtered.length, schemes: filtered });
});

// Get single scheme
schemesRouter.get('/:id', (req, res) => {
  const scheme = schemes.find(s => s.id === req.params.id);
  if (!scheme) return res.status(404).json({ error: 'Scheme not found' });
  res.json(scheme);
});
