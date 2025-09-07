import React from 'react';
import { Page, User } from '../types';

interface SidebarProps {
  currentPage: Page;
  user: User | null;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, user, onNavigate, onLogout }) => {
  const navigationItems = [
    { page: 'landing' as Page, label: 'Home', icon: '🏠' },
    { page: 'account' as Page, label: 'Account', icon: '👤' },
    { page: 'cart' as Page, label: 'Cart', icon: '🛒' },
    { page: 'order' as Page, label: 'Orders', icon: '📦' },
    { page: 'post' as Page, label: 'Add Product', icon: '➕' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">StakeX</h2>
        {user && (
          <div className="sidebar-user">
            <div className="user-avatar">
              <img src={user.profilePicture} alt={user.name} />
            </div>
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-since">Member since {user.memberSince}</div>
            </div>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {navigationItems.map((item) => (
          <button
            key={item.page}
            className={`sidebar-nav-item ${currentPage === item.page ? 'active' : ''}`}
            onClick={() => onNavigate(item.page)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        {user ? (
          <button className="sidebar-logout" onClick={onLogout}>
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Logout</span>
          </button>
        ) : (
          <button className="sidebar-login" onClick={() => onNavigate('auth')}>
            <span className="nav-icon">🔑</span>
            <span className="nav-label">Login</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

