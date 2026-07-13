import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Wallet, ArrowUpDown, PieChart, LogOut, X, TrendingUp } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={24} style={{ color: 'var(--primary)' }} />
          <span>FinanceFlow</span>
        </div>
        <button 
          className="menu-toggle btn-icon" 
          onClick={onClose} 
          style={{ padding: '0.25rem' }}
          aria-label="Close Sidebar"
        >
          <X size={20} />
        </button>
      </div>

      <ul className="sidebar-menu">
        <li className="sidebar-item">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
        </li>
        <li className="sidebar-item">
          <NavLink 
            to="/accounts" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <Wallet size={20} />
            <span>Accounts</span>
          </NavLink>
        </li>
        <li className="sidebar-item">
          <NavLink 
            to="/transactions" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <ArrowUpDown size={20} />
            <span>Transactions</span>
          </NavLink>
        </li>
        <li className="sidebar-item">
          <NavLink 
            to="/budgets" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <PieChart size={20} />
            <span>Budgets</span>
          </NavLink>
        </li>
      </ul>

      <div className="sidebar-footer">
        <button 
          className="sidebar-link" 
          onClick={() => {
            handleLinkClick();
            logout();
          }}
          style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <LogOut size={20} style={{ color: 'var(--danger)' }} />
          <span style={{ color: 'var(--danger)' }}>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
