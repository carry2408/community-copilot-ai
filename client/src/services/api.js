import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' }
});

export async function startWorkflow(businessDetails) {
  const { data } = await api.post('/workflow/start', businessDetails);
  return data;
}

export async function submitAnswers(workflowId, answers) {
  const { data } = await api.post(`/workflow/${workflowId}/answers`, { answers });
  return data;
}

export async function getWorkflowResults(workflowId) {
  const { data } = await api.get(`/workflow/${workflowId}/results`);
  return data;
}

export function createSSEConnection(workflowId, onMessage) {
  const eventSource = new EventSource(`${API_BASE}/api/workflow/${workflowId}/stream`);
  
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (e) {
      console.error('SSE parse error:', e);
    }
  };

  eventSource.onerror = () => {
    console.log('SSE connection error, reconnecting...');
  };

  return eventSource;
}
