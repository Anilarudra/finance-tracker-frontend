import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, LogOut, User, Bell } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="menu-toggle btn-icon" onClick={onToggleSidebar} aria-label="Toggle Sidebar">
          <Menu size={24} />
        </button>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, fontFamily: 'var(--font-family-base)' }}>
          Welcome back, <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{user?.username}</span>
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <button className="btn-icon" aria-label="Notifications">
          <Bell size={20} />
        </button>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          background: 'rgba(255,255,255,0.04)', 
          padding: '0.4rem 0.8rem', 
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)'
        }}>
          <User size={16} style={{ color: 'var(--primary)' }} />
          <span>{user?.email}</span>
        </div>

        <button className="btn-icon" onClick={logout} title="Sign Out" style={{ color: 'var(--danger)' }}>
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
