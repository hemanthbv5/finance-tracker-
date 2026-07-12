import client from './client';
import type { Income, Expense, SavingsGoal, Budget } from '../types';

// ── Income ──────────────────────────────────────────────────────
export const fetchIncomes = async (): Promise<Income[]> => {
  const { data } = await client.get('/income');
  return data.map(normalizeDoc);
};

export const createIncome = async (income: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>): Promise<Income> => {
  const { data } = await client.post('/income', income);
  return normalizeDoc(data);
};

export const updateIncome = async (id: string, income: Partial<Income>): Promise<Income> => {
  const { data } = await client.put(`/income/${id}`, income);
  return normalizeDoc(data);
};

export const deleteIncome = async (id: string): Promise<void> => {
  await client.delete(`/income/${id}`);
};

// ── Expenses ─────────────────────────────────────────────────────
export const fetchExpenses = async (): Promise<Expense[]> => {
  const { data } = await client.get('/expenses');
  return data.map(normalizeDoc);
};

export const createExpense = async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> => {
  const { data } = await client.post('/expenses', expense);
  return normalizeDoc(data);
};

export const updateExpense = async (id: string, expense: Partial<Expense>): Promise<Expense> => {
  const { data } = await client.put(`/expenses/${id}`, expense);
  return normalizeDoc(data);
};

export const deleteExpense = async (id: string): Promise<void> => {
  await client.delete(`/expenses/${id}`);
};

// ── Goals ─────────────────────────────────────────────────────────
export const fetchGoals = async (): Promise<SavingsGoal[]> => {
  const { data } = await client.get('/goals');
  return data.map(normalizeDoc);
};

export const createGoal = async (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<SavingsGoal> => {
  const { data } = await client.post('/goals', goal);
  return normalizeDoc(data);
};

export const updateGoal = async (id: string, goal: Partial<SavingsGoal>): Promise<SavingsGoal> => {
  const { data } = await client.put(`/goals/${id}`, goal);
  return normalizeDoc(data);
};

export const deleteGoal = async (id: string): Promise<void> => {
  await client.delete(`/goals/${id}`);
};

// ── Budgets ───────────────────────────────────────────────────────
export const fetchBudgets = async (month?: string): Promise<Budget[]> => {
  const params = month ? { month } : {};
  const { data } = await client.get('/budgets', { params });
  return data.map(normalizeDoc);
};

export const createBudget = async (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Promise<Budget> => {
  const { data } = await client.post('/budgets', budget);
  return normalizeDoc(data);
};

export const updateBudget = async (id: string, budget: Partial<Budget>): Promise<Budget> => {
  const { data } = await client.put(`/budgets/${id}`, budget);
  return normalizeDoc(data);
};

export const deleteBudget = async (id: string): Promise<void> => {
  await client.delete(`/budgets/${id}`);
};

// ── Helper: normalize MongoDB _id → id ────────────────────────────
const normalizeDoc = (doc: any) => ({
  ...doc,
  id: doc._id || doc.id,
  createdAt: doc.createdAt || new Date().toISOString(),
  updatedAt: doc.updatedAt || new Date().toISOString(),
});
