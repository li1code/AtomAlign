import { create } from 'zustand';
import * as goalService from '../services/goal.service';
import * as checkinService from '../services/checkin.service';

interface Goal {
  id: string;
  title: string;
  description: string;
  thrustArea: string;
  target: number;
  weightage: number;
  status: string;
  uomType: string;
  isLocked: boolean;
  isShared: boolean;
  isPrimary: boolean;
  sharedGoalId?: string;
  updates?: any[];
  checkins?: any[];
  employee?: {
    id: string;
    name: string;
    email: string;
    department?: { name: string };
  };
}

interface GoalState {
  goals: Goal[];
  pendingApprovals: Goal[];
  isLoading: boolean;
  error: string | null;
  fetchGoals: () => Promise<void>;
  fetchPendingApprovals: () => Promise<void>;
  saveDraft: (goalsData: any[]) => Promise<void>;
  submitGoals: (goalsData: any[]) => Promise<void>;
  updateGoalProgress: (
    goalId: string,
    quarter: string,
    actualAchievement: number,
    status: string
  ) => Promise<void>;
  approveEmployeeGoal: (id: string, comment?: string) => Promise<void>;
  rejectEmployeeGoal: (id: string, comment?: string) => Promise<void>;
  saveCheckinComment: (goalId: string, quarter: string, comment: string) => Promise<void>;
  unlockSheet: (id: string, reason: string) => Promise<void>;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  pendingApprovals: [],
  isLoading: false,
  error: null,

  fetchGoals: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await goalService.getMyGoals();
      set({ goals: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, isLoading: false });
    }
  },

  fetchPendingApprovals: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await goalService.getPendingApprovals();
      set({ pendingApprovals: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, isLoading: false });
    }
  },

  saveDraft: async (goalsData: any[]) => {
    set({ isLoading: true, error: null });
    try {
      await goalService.saveDraftGoals(goalsData);
      const data = await goalService.getMyGoals();
      set({ goals: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, isLoading: false });
      throw err;
    }
  },

  submitGoals: async (goalsData: any[]) => {
    set({ isLoading: true, error: null });
    try {
      await goalService.submitGoalsSheet(goalsData);
      const data = await goalService.getMyGoals();
      set({ goals: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, isLoading: false });
      throw err;
    }
  },

  updateGoalProgress: async (
    goalId: string,
    quarter: string,
    actualAchievement: number,
    status: string
  ) => {
    set({ isLoading: true, error: null });
    try {
      await checkinService.logProgressUpdate(goalId, { quarter, actualAchievement, status });
      const data = await goalService.getMyGoals();
      set({ goals: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, isLoading: false });
      throw err;
    }
  },

  approveEmployeeGoal: async (id: string, comment?: string) => {
    set({ isLoading: true, error: null });
    try {
      await goalService.approveGoal(id, comment);
      await get().fetchPendingApprovals();
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, isLoading: false });
      throw err;
    }
  },

  rejectEmployeeGoal: async (id: string, comment?: string) => {
    set({ isLoading: true, error: null });
    try {
      await goalService.rejectGoal(id, comment);
      await get().fetchPendingApprovals();
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, isLoading: false });
      throw err;
    }
  },

  saveCheckinComment: async (goalId: string, quarter: string, comment: string) => {
    set({ isLoading: true, error: null });
    try {
      await checkinService.saveManagerCheckin(goalId, quarter, comment);
      await get().fetchPendingApprovals();
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, isLoading: false });
      throw err;
    }
  },

  unlockSheet: async (id: string, reason: string) => {
    set({ isLoading: true, error: null });
    try {
      await goalService.unlockEmployeeGoalSheet(id, reason);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, isLoading: false });
      throw err;
    }
  }
}));
