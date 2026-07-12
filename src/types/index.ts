// ===================== ENUMS =====================

export type TransactionType = 'income' | 'expense';

export type IncomeCategory =
  | 'Salary'
  | 'Freelance'
  | 'Business'
  | 'Investments'
  | 'Gift'
  | 'Other';

export type ExpenseCategory =
  | 'Food'
  | 'Rent'
  | 'Shopping'
  | 'Transportation'
  | 'Bills'
  | 'Entertainment'
  | 'Healthcare'
  | 'Education'
  | 'Travel'
  | 'EMI'
  | 'Insurance'
  | 'Investment'
  | 'Others';

export type PaymentMethod =
  | 'Cash'
  | 'Bank Transfer'
  | 'Credit Card'
  | 'Debit Card'
  | 'UPI'
  | 'Digital Wallet'
  | 'Other';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'none';

// ===================== CORE MODELS =====================

export interface Income {
  id: string;
  amount: number;
  date: string; // ISO string
  category: IncomeCategory;
  source: string;
  notes?: string;
  isRecurring: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  amount: number;
  date: string; // ISO string
  category: ExpenseCategory;
  paymentMethod: PaymentMethod;
  notes?: string;
  isRecurring: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // ISO string
  icon?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  month: string; // "YYYY-MM"
  category: ExpenseCategory;
  limit: number;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: 'budget_exceeded' | 'goal_achieved' | 'bill_due' | 'savings_milestone' | 'info';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  currency: string;
  currencySymbol: string;
  monthlyIncome: number;
  avatar?: string;
}

// ===================== ANALYTICS TYPES =====================

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  savings: number;
}

export interface DailySpending {
  date: string;
  amount: number;
}

// ===================== COMBINED TRANSACTION =====================

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  category: IncomeCategory | ExpenseCategory;
  notes?: string;
  paymentMethod?: PaymentMethod;
  source?: string;
}
