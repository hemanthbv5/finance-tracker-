import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import IncomePage from './pages/IncomePage';
import ExpensePage from './pages/ExpensePage';
import Analytics from './pages/Analytics';
import GoalsPage from './pages/GoalsPage';
import BudgetPage from './pages/BudgetPage';
import SpendingCalculator from './pages/SpendingCalculator';
import Transactions from './pages/Transactions';
import InsightsPage from './pages/InsightsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import { useAuthStore } from './store/authStore';
import { useFinanceStore } from './store/financeStore';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Your financial overview' },
  '/income': { title: 'Income', subtitle: 'Manage your income sources' },
  '/expenses': { title: 'Expenses', subtitle: 'Track your spending' },
  '/transactions': { title: 'Transactions', subtitle: 'All financial activity' },
  '/analytics': { title: 'Analytics', subtitle: 'Deep financial insights' },
  '/goals': { title: 'Savings Goals', subtitle: 'Track your financial goals' },
  '/budget': { title: 'Budget Planner', subtitle: 'Monthly budget management' },
  '/calculator': { title: 'Spending Calculator', subtitle: 'Analyze spending patterns' },
  '/insights': { title: 'Insights & Alerts', subtitle: 'Smart financial analysis' },
  '/settings': { title: 'Settings', subtitle: 'Customize your experience' },
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppContent: React.FC<{ isDark: boolean; onToggleTheme: () => void }> = ({ isDark, onToggleTheme }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const pageInfo = PAGE_TITLES[location.pathname] || { title: 'FinTrack', subtitle: '' };
  const { token } = useAuthStore();
  const { loadAll } = useFinanceStore();

  useEffect(() => {
    if (token) {
      loadAll();
    }
  }, [token, loadAll]);

  if (location.pathname === '/login') {
    return (
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <LoginPage />} />
      </Routes>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Header
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          isDark={isDark}
          onToggleTheme={onToggleTheme}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="page-content">
          <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/income" element={<ProtectedRoute><IncomePage /></ProtectedRoute>} />
            <Route path="/expenses" element={<ProtectedRoute><ExpensePage /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/goals" element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
            <Route path="/budget" element={<ProtectedRoute><BudgetPage /></ProtectedRoute>} />
            <Route path="/calculator" element={<ProtectedRoute><SpendingCalculator /></ProtectedRoute>} />
            <Route path="/insights" element={<ProtectedRoute><InsightsPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage isDark={isDark} onToggleTheme={onToggleTheme} /></ProtectedRoute>} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('fintrack-theme') !== 'light';
  });

  useEffect(() => {
    document.body.classList.toggle('light-mode', !isDark);
    localStorage.setItem('fintrack-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(d => !d);

  return (
    <BrowserRouter>
      <AppContent isDark={isDark} onToggleTheme={toggleTheme} />
    </BrowserRouter>
  );
};

export default App;
