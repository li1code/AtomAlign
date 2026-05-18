import api from './api';

export const getMyGoals = async () => {
  const response = await api.get('/goals/my');
  return response.data;
};

export const saveDraftGoals = async (goals: any[]) => {
  const response = await api.post('/goals/draft', { goals });
  return response.data;
};

export const submitGoalsSheet = async (goals: any[]) => {
  const response = await api.post('/goals/submit', { goals });
  return response.data;
};

export const updateGoal = async (id: string, data: any) => {
  const response = await api.put(`/goals/${id}`, data);
  return response.data;
};

export const getPendingApprovals = async () => {
  const response = await api.get('/approvals/pending');
  return response.data;
};

export const approveGoal = async (id: string, comment?: string) => {
  const response = await api.post(`/approvals/${id}/approve`, { comment });
  return response.data;
};

export const rejectGoal = async (id: string, comment?: string) => {
  const response = await api.post(`/approvals/${id}/reject`, { comment });
  return response.data;
};

export const distributeSharedGoal = async (data: {
  title: string;
  description: string;
  thrustArea: string;
  target: number;
  uomType: string;
  employeeIds: string[];
  primaryEmployeeId?: string;
}) => {
  const response = await api.post('/admin/shared-goals', data);
  return response.data;
};

export const unlockEmployeeGoalSheet = async (id: string, reason: string) => {
  const response = await api.post(`/admin/goals/${id}/unlock`, { reason });
  return response.data;
};
