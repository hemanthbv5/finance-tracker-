import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, TrendingDown, Wallet, Target,
  BarChart3, PiggyBank, List, Lightbulb, Settings, ChevronRight,
  CreditCard, Receipt
} from 'lucide-react';
import { useFinanceStore } from '../store/financeStore';
import { useAuthStore } from '../store/authStore';

const navItems = [
  { section: 'Overview' },
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/insights', icon: Lightbulb, label: 'Insights' },
  { section: 'Money' },
  { to: '/income', icon: TrendingUp, label: 'Income' },
  { to: '/expenses', icon: TrendingDown, label: 'Expenses' },
  { to: '/transactions', icon: List, label: 'Transactions' },
  { section: 'Planning' },
  { to: '/budget', icon: Wallet, label: 'Budget Planner' },
  { to: '/goals', icon: Target, label: 'Savings Goals' },
  { to: '/calculator', icon: Receipt, label: 'Spending Calc' },
  { section: 'More' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { notifications, profile } = useFinanceStore();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-90 md:hidden"
          style={{ background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
          onClick={onClose}
        />
      )}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">💰</div>
          <div className="logo-text">
            <div className="logo-name">FinTrack</div>
            <div className="logo-sub">Personal Finance</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, idx) => {
            if ('section' in item && !('to' in item)) {
              return (
                <div key={idx} className="nav-section-label">{item.section}</div>
              );
            }
            if ('to' in item && item.to) {
              const Icon = item.icon!;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <Icon size={18} className="nav-icon" />
                  <span>{item.label}</span>
                  {item.label === 'Insights' && unreadCount > 0 && (
                    <span className="nav-badge">{unreadCount}</span>
                  )}
                </NavLink>
              );
            }
            return null;
          })}
        </nav>

        <NavLink to="/settings" className="sidebar-user" onClick={onClose} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <div className="user-avatar">
            {(useAuthStore(s => s.user?.name) || profile.name).charAt(0).toUpperCase()}
          </div>
          <div className="user-info" style={{ flex: 1, minWidth: 0, marginLeft: '12px' }}>
            <div className="user-name" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {useAuthStore(s => s.user?.name) || profile.name}
            </div>
            <div className="user-role" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {useAuthStore(s => s.user?.currency) || profile.currency} · Personal
            </div>
          </div>
          <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
        </NavLink>
      </aside>
    </>
  );
};

export default Sidebar;
