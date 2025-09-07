import React from 'react';
import { Page, User } from '../types';

type Props = {
  user: User | null;
  currentPage: Page;
  onNavigate: (p: Page) => void;
  onLogout: () => void;
};

const FixedSidebar: React.FC<Props> = ({ user, currentPage, onNavigate, onLogout }) => {
  return (
    <aside className="fixedSidebar">
      <div className="sidebarHeader">
        <div className="hello">{user ? `Hello, ${user.name}` : 'Hello'}</div>
      </div>

      <nav className="sidebarNav">
        <button type="button" className={currentPage==='landing' ? 'active' : ''} onClick={() => onNavigate('landing')}>
          Home / Feed
        </button>
        <button type="button" className={currentPage==='account' ? 'active' : ''} onClick={() => onNavigate('account')}>
          My Account
        </button>
        <button type="button" className={currentPage==='post' ? 'active' : ''} onClick={() => onNavigate('post')}>
          Post an Item
        </button>
        <button type="button" className={currentPage==='cart' ? 'active' : ''} onClick={() => onNavigate('cart')}>
          Cart
        </button>
        <button type="button" className={currentPage==='order' ? 'active' : ''} onClick={() => onNavigate('order')}>
          Orders
        </button>
      </nav>

      <div className="sidebarFooter">
        <button type="button" className="logoutBtn" onClick={onLogout}>
          Log out
        </button>
      </div>
    </aside>
  );
};

export default FixedSidebar;
