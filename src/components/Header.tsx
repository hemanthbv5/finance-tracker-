import React, { useState, useRef, useEffect } from 'react';
import { Bell, Sun, Moon, Menu, LogOut } from 'lucide-react';
import { useFinanceStore } from '../store/financeStore';
import { useAuthStore } from '../store/authStore';
import { formatDate } from '../utils/finance';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  subtitle?: string;
  isDark: boolean;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
}

const NOTIFICATION_ICONS: Record<string, string> = {
  budget_exceeded: '⚠️',
  goal_achieved: '🎯',
  bill_due: '📅',
  savings_milestone: '🏆',
  info: 'ℹ️',
};

const Header: React.FC<HeaderProps> = ({ title, subtitle, isDark, onToggleTheme, onToggleSidebar }) => {
  const { notifications, markNotificationRead, clearNotifications } = useFinanceStore();
  const { logout } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <button
        className="header-btn mobile-menu-btn"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Menu size={18} />
      </button>

      <div style={{ flex: 1 }}>
        <div className="header-title">{title}</div>
        {subtitle && <div className="header-subtitle">{subtitle}</div>}
      </div>

      <div className="header-actions">
        <button
          className="header-btn"
          onClick={onToggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            className="header-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="notification-dot" />}
          </button>

          {showNotifications && (
            <div className="notification-panel">
              <div style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--border-glass)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontWeight: 700, fontSize: '14px' }}>Notifications</span>
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    style={{
                      fontSize: '12px', color: 'var(--accent-purple-light)',
                      cursor: 'pointer', background: 'none', border: 'none'
                    }}
                  >
                    Clear all
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="empty-state" style={{ padding: '24px' }}>
                  <div className="empty-state-icon">🔔</div>
                  <div className="empty-state-text">No notifications</div>
                </div>
              ) : (
                notifications.slice(0, 10).map(n => (
                  <div
                    key={n.id}
                    className={`notification-item ${!n.read ? 'unread' : ''}`}
                    onClick={() => markNotificationRead(n.id)}
                  >
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '18px', lineHeight: 1 }}>
                        {NOTIFICATION_ICONS[n.type] || 'ℹ️'}
                      </span>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {n.message}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {formatDate(n.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <button
          className="header-btn"
          onClick={handleLogout}
          title="Sign Out"
        >
          <LogOut size={18} color="var(--accent-red)" />
        </button>
      </div>
    </header>
  );
};

export default Header;
