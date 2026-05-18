import api from './api';

export const getDashboardOverview = async () => {
  const response = await api.get('/analytics/stats');
  return response.data;
};

export const getDepartmentCompletion = async () => {
  const response = await api.get('/analytics/departments');
  return response.data;
};

export const getQoQTrends = async () => {
  const response = await api.get('/analytics/qoq');
  return response.data;
};

export const getGoalDistribution = async () => {
  const response = await api.get('/analytics/distribution');
  return response.data;
};

export const getManagerEffectiveness = async () => {
  const response = await api.get('/analytics/managers');
  return response.data;
};

export const getAuditLogs = async () => {
  const response = await api.get('/analytics/audit-logs');
  return response.data;
};

export const getEscalationLogs = async () => {
  const response = await api.get('/admin/escalations');
  return response.data;
};

export const triggerEscalationsSweep = async () => {
  const response = await api.post('/admin/escalations/run');
  return response.data;
};
