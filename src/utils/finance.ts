import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isWithinInterval, parseISO, differenceInDays } from 'date-fns';
import type { Income, Expense, ExpenseCategory, MonthlyData, CategorySpending } from '../types';

export const CATEGORY_COLORS: Record<string, string> = {
  Food: '#f59e0b',
  Rent: '#6366f1',
  Shopping: '#ec4899',
  Transportation: '#06b6d4',
  Bills: '#8b5cf6',
  Entertainment: '#f43f5e',
  Healthcare: '#10b981',
  Education: '#3b82f6',
  Travel: '#14b8a6',
  EMI: '#f97316',
  Insurance: '#84cc16',
  Investment: '#22d3ee',
  Others: '#94a3b8',
  Salary: '#22c55e',
  Freelance: '#a78bfa',
  Business: '#fb923c',
  Investments: '#34d399',
  Gift: '#f472b6',
  Other: '#94a3b8',
};

export const formatCurrency = (amount: number, symbol = '₹'): string => {
  if (amount >= 100000) return `${symbol}${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `${symbol}${(amount / 1000).toFixed(1)}K`;
  return `${symbol}${amount.toFixed(0)}`;
};

export const formatCurrencyFull = (amount: number, symbol = '₹'): string => {
  return `${symbol}${amount.toLocaleString('en-IN')}`;
};

export const formatDate = (dateStr: string): string => {
  return format(parseISO(dateStr), 'dd MMM yyyy');
};

export const formatMonthYear = (dateStr: string): string => {
  return format(parseISO(dateStr), 'MMMM yyyy');
};

export const getCurrentMonth = (): string => format(new Date(), 'yyyy-MM');

export const getMonthRange = (month: string) => {
  const date = parseISO(`${month}-01`);
  return { start: startOfMonth(date), end: endOfMonth(date) };
};

export const isInCurrentMonth = (dateStr: string): boolean => {
  const { start, end } = getMonthRange(getCurrentMonth());
  return isWithinInterval(parseISO(dateStr), { start, end });
};

export const isInCurrentWeek = (dateStr: string): boolean => {
  const now = new Date();
  return isWithinInterval(parseISO(dateStr), {
    start: startOfWeek(now, { weekStartsOn: 1 }),
    end: endOfWeek(now, { weekStartsOn: 1 })
  });
};

export const getTotalIncome = (incomes: Income[]): number =>
  incomes.reduce((sum, i) => sum + i.amount, 0);

export const getTotalExpense = (expenses: Expense[]): number =>
  expenses.reduce((sum, e) => sum + e.amount, 0);

export const getMonthlyIncome = (incomes: Income[]): number =>
  incomes.filter(i => isInCurrentMonth(i.date)).reduce((sum, i) => sum + i.amount, 0);

export const getMonthlyExpense = (expenses: Expense[]): number =>
  expenses.filter(e => isInCurrentMonth(e.date)).reduce((sum, e) => sum + e.amount, 0);

export const getWeeklyExpense = (expenses: Expense[]): number =>
  expenses.filter(e => isInCurrentWeek(e.date)).reduce((sum, e) => sum + e.amount, 0);

export const getDailyExpense = (expenses: Expense[]): number => {
  const today = format(new Date(), 'yyyy-MM-dd');
  return expenses.filter(e => e.date === today).reduce((sum, e) => sum + e.amount, 0);
};

export const getYearlyExpense = (expenses: Expense[]): number => {
  const year = format(new Date(), 'yyyy');
  return expenses.filter(e => e.date.startsWith(year)).reduce((sum, e) => sum + e.amount, 0);
};

export const getCategorySpending = (expenses: Expense[], month?: string): CategorySpending[] => {
  const filtered = month
    ? expenses.filter(e => e.date.startsWith(month))
    : expenses.filter(e => isInCurrentMonth(e.date));

  const totals: Record<string, number> = {};
  let total = 0;
  filtered.forEach(e => {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
    total += e.amount;
  });

  return Object.entries(totals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      color: CATEGORY_COLORS[category] || '#94a3b8',
    }))
    .sort((a, b) => b.amount - a.amount);
};

export const getMonthlyTrend = (incomes: Income[], expenses: Expense[], months = 6): MonthlyData[] => {
  const result: MonthlyData[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = format(d, 'yyyy-MM');
    const income = incomes.filter(x => x.date.startsWith(month)).reduce((s, x) => s + x.amount, 0);
    const expense = expenses.filter(x => x.date.startsWith(month)).reduce((s, x) => s + x.amount, 0);
    result.push({
      month: format(d, 'MMM yy'),
      income,
      expense,
      savings: income - expense,
    });
  }
  return result;
};

export const getSavingsRate = (income: number, expense: number): number => {
  if (income === 0) return 0;
  return Math.max(0, Math.round(((income - expense) / income) * 100));
};

export const getDaysRemaining = (deadlineStr: string): number => {
  return Math.max(0, differenceInDays(parseISO(deadlineStr), new Date()));
};

export const getGoalProgress = (current: number, target: number): number => {
  if (target === 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
};

export const getEstimatedCompletion = (
  current: number,
  target: number,
  monthlyIncome: number,
  monthlyExpense: number
): string => {
  const remaining = target - current;
  const monthlySavings = monthlyIncome - monthlyExpense;
  if (monthlySavings <= 0 || remaining <= 0) return 'N/A';
  const monthsNeeded = Math.ceil(remaining / monthlySavings);
  const completionDate = new Date();
  completionDate.setMonth(completionDate.getMonth() + monthsNeeded);
  return format(completionDate, 'MMM yyyy');
};

export const getBudgetUsed = (expenses: Expense[], category: ExpenseCategory, month: string): number => {
  return expenses
    .filter(e => e.category === category && e.date.startsWith(month))
    .reduce((sum, e) => sum + e.amount, 0);
};

export const getHighestSpendingCategory = (expenses: Expense[]): string => {
  const spending = getCategorySpending(expenses);
  return spending.length > 0 ? spending[0].category : 'N/A';
};

export const getLargestExpense = (expenses: Expense[]): Expense | null => {
  if (expenses.length === 0) return null;
  return expenses.reduce((max, e) => e.amount > max.amount ? e : max);
};

export const generateInsights = (
  incomes: Income[],
  expenses: Expense[],
  budgets: { category: string; limit: number }[]
): string[] => {
  const insights: string[] = [];
  const currentMonth = getCurrentMonth();
  const lastMonth = format(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'yyyy-MM');

  const currentExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
  const lastExpenses = expenses.filter(e => e.date.startsWith(lastMonth));
  const currentIncome = incomes.filter(i => i.date.startsWith(currentMonth));
  const lastIncome = incomes.filter(i => i.date.startsWith(lastMonth));

  const curTotal = currentExpenses.reduce((s, e) => s + e.amount, 0);
  const lastTotal = lastExpenses.reduce((s, e) => s + e.amount, 0);
  const curIncomeTotal = currentIncome.reduce((s, i) => s + i.amount, 0);
  const lastIncomeTotal = lastIncome.reduce((s, i) => s + i.amount, 0);

  if (lastTotal > 0 && curTotal > lastTotal) {
    const pct = Math.round(((curTotal - lastTotal) / lastTotal) * 100);
    insights.push(`📈 Total expenses increased by ${pct}% compared to last month.`);
  } else if (lastTotal > 0 && curTotal < lastTotal) {
    const pct = Math.round(((lastTotal - curTotal) / lastTotal) * 100);
    insights.push(`📉 Great job! Expenses reduced by ${pct}% compared to last month.`);
  }

  const curSavings = curIncomeTotal - curTotal;
  const lastSavings = lastIncomeTotal - lastTotal;
  if (lastSavings > 0 && curSavings > lastSavings) {
    const pct = Math.round(((curSavings - lastSavings) / lastSavings) * 100);
    insights.push(`💰 Savings improved by ${pct}% this month. Keep it up!`);
  }

  const highest = getHighestSpendingCategory(currentExpenses);
  if (highest !== 'N/A') {
    insights.push(`🔥 Highest spending category this month: ${highest}.`);
  }

  // Budget alerts
  budgets.forEach(b => {
    const used = currentExpenses
      .filter(e => e.category === b.category)
      .reduce((s, e) => s + e.amount, 0);
    const pct = Math.round((used / b.limit) * 100);
    if (pct > 90) {
      insights.push(`⚠️ ${b.category} budget is ${pct}% used. Consider cutting back.`);
    }
  });

  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const today = new Date().getDate();
  const dailyAvg = curTotal / today;
  const projectedMonthly = dailyAvg * daysInMonth;
  insights.push(`📅 Projected monthly spending: ₹${projectedMonthly.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`);

  if (curIncomeTotal > 0) {
    const savingsRate = getSavingsRate(curIncomeTotal, curTotal);
    if (savingsRate < 20) {
      insights.push(`💡 Your savings rate is ${savingsRate}%. Aim for at least 20% for financial health.`);
    } else {
      insights.push(`✅ Excellent savings rate of ${savingsRate}% this month!`);
    }
  }

  return insights;
};
