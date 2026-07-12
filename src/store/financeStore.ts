import { create } from 'zustand';
import type { Income, Expense, SavingsGoal, Budget, Notification, UserProfile } from '../types';
import * as api from '../api/finance';

interface FinanceState {
  incomes: Income[];
  expenses: Expense[];
  goals: SavingsGoal[];
  budgets: Budget[];
  notifications: Notification[];
  profile: UserProfile;
  isLoading: boolean;

  // Data loading
  loadAll: () => Promise<void>;

  // Income actions
  addIncome: (income: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateIncome: (id: string, income: Partial<Income>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;

  // Expense actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  // Goal actions
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateGoal: (id: string, goal: Partial<SavingsGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  // Budget actions
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBudget: (id: string, budget: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  // Notification actions (local only)
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Profile (synced with auth user)
  updateProfile: (profile: Partial<UserProfile>) => void;

  // Reset (on logout)
  reset: () => void;
}

const defaultProfile: UserProfile = {
  name: 'User',
  currency: 'INR',
  currencySymbol: '₹',
  monthlyIncome: 0,
};

const now = () => new Date().toISOString();
const genId = () => Math.random().toString(36).substr(2, 9);

export const useFinanceStore = create<FinanceState>()((set, get) => ({
  incomes: [],
  expenses: [],
  goals: [],
  budgets: [],
  notifications: [],
  profile: defaultProfile,
  isLoading: false,

  loadAll: async () => {
    set({ isLoading: true });
    try {
      const [incomes, expenses, goals, budgets] = await Promise.all([
        api.fetchIncomes(),
        api.fetchExpenses(),
        api.fetchGoals(),
        api.fetchBudgets(),
      ]);
      set({ incomes, expenses, goals, budgets, isLoading: false });
    } catch (err) {
      console.error('Failed to load data:', err);
      set({ isLoading: false });
    }
  },

  // ── Income ──────────────────────────────────────────────────────
  addIncome: async (income) => {
    const created = await api.createIncome(income);
    set((s) => ({ incomes: [created, ...s.incomes] }));
  },
  updateIncome: async (id, income) => {
    const updated = await api.updateIncome(id, income);
    set((s) => ({ incomes: s.incomes.map(i => i.id === id ? updated : i) }));
  },
  deleteIncome: async (id) => {
    await api.deleteIncome(id);
    set((s) => ({ incomes: s.incomes.filter(i => i.id !== id) }));
  },

  // ── Expenses ─────────────────────────────────────────────────────
  addExpense: async (expense) => {
    const created = await api.createExpense(expense);
    set((s) => ({ expenses: [created, ...s.expenses] }));
  },
  updateExpense: async (id, expense) => {
    const updated = await api.updateExpense(id, expense);
    set((s) => ({ expenses: s.expenses.map(e => e.id === id ? updated : e) }));
  },
  deleteExpense: async (id) => {
    await api.deleteExpense(id);
    set((s) => ({ expenses: s.expenses.filter(e => e.id !== id) }));
  },

  // ── Goals ─────────────────────────────────────────────────────────
  addGoal: async (goal) => {
    const created = await api.createGoal(goal);
    set((s) => ({ goals: [created, ...s.goals] }));
  },
  updateGoal: async (id, goal) => {
    const updated = await api.updateGoal(id, goal);
    set((s) => ({ goals: s.goals.map(g => g.id === id ? updated : g) }));
  },
  deleteGoal: async (id) => {
    await api.deleteGoal(id);
    set((s) => ({ goals: s.goals.filter(g => g.id !== id) }));
  },

  // ── Budgets ───────────────────────────────────────────────────────
  addBudget: async (budget) => {
    const created = await api.createBudget(budget);
    set((s) => ({
      budgets: s.budgets.find(b => b.id === created.id)
        ? s.budgets.map(b => b.id === created.id ? created : b)
        : [created, ...s.budgets]
    }));
  },
  updateBudget: async (id, budget) => {
    const updated = await api.updateBudget(id, budget);
    set((s) => ({ budgets: s.budgets.map(b => b.id === id ? updated : b) }));
  },
  deleteBudget: async (id) => {
    await api.deleteBudget(id);
    set((s) => ({ budgets: s.budgets.filter(b => b.id !== id) }));
  },

  // ── Notifications (local, no backend needed) ──────────────────────
  addNotification: (notification) => set((s) => ({
    notifications: [{ ...notification, id: genId(), createdAt: now() }, ...s.notifications]
  })),
  markNotificationRead: (id) => set((s) => ({
    notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  })),
  clearNotifications: () => set({ notifications: [] }),

  // ── Profile ───────────────────────────────────────────────────────
  updateProfile: (profile) => set((s) => ({ profile: { ...s.profile, ...profile } })),

  // ── Reset on logout ───────────────────────────────────────────────
  reset: () => set({
    incomes: [], expenses: [], goals: [], budgets: [],
    notifications: [], profile: defaultProfile, isLoading: false,
  }),
}));
