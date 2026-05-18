import api from './api';

export const logProgressUpdate = async (
  goalId: string,
  data: { quarter: string; actualAchievement: number; status: string }
) => {
  const response = await api.post(`/goals/${goalId}/progress`, data);
  return response.data;
};

export const saveManagerCheckin = async (
  goalId: string,
  quarter: string,
  comment: string
) => {
  const response = await api.post(`/goals/${goalId}/checkin`, { quarter, comment });
  return response.data;
};
