import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const active = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  const handleLogout = () => { logout(); navigate('/login'); setMenuOpen(false); };
  const go = (path) => { navigate(path); setMenuOpen(false); };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand" onClick={() => go('/')} style={{ cursor: 'pointer' }}>
          Ticket<span>X</span>
        </div>

        {/* Desktop links */}
        <div className="navbar-links desktop-nav">
          <button className={active('/')} onClick={() => go('/')}>Events</button>
          {user && <>
            <button className={active('/my-tickets')} onClick={() => go('/my-tickets')}>My Tickets</button>
            <button className={active('/orders')} onClick={() => go('/orders')}>Orders</button>
            <button className={active('/wallet')} onClick={() => go('/wallet')}>
              <span className="nav-wallet">₹{(user.walletBalance || 0).toFixed(2)}</span>
            </button>
            {user.role === 'admin' && <button className={active('/create-event')} onClick={() => go('/create-event')}>+ Event</button>}
            <button className="nav-link" onClick={handleLogout}>Logout</button>
          </>}
          {!user && <>
            <button className={active('/login')} onClick={() => go('/login')}>Login</button>
            <button className="btn btn-primary btn-sm" onClick={() => go('/register')}>Sign Up</button>
          </>}
        </div>

        {/* Mobile: wallet + hamburger */}
        <div className="mobile-nav">
          {user && <span className="nav-wallet" style={{ marginRight: 10 }}>₹{(user.walletBalance || 0).toFixed(2)}</span>}
          <button className="nav-link" onClick={() => setMenuOpen(!menuOpen)} style={{ fontSize: '1.3rem', padding: '4px 8px' }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div style={{
          background: 'var(--bg2)', borderTop: '1px solid var(--border)',
          padding: '8px 16px 16px', display: 'flex', flexDirection: 'column', gap: 4
        }}>
          <button className={active('/')} onClick={() => go('/')} style={{ textAlign: 'left' }}>Events</button>
          {user && <>
            <button className={active('/my-tickets')} onClick={() => go('/my-tickets')} style={{ textAlign: 'left' }}>My Tickets</button>
            <button className={active('/orders')} onClick={() => go('/orders')} style={{ textAlign: 'left' }}>Orders</button>
            <button className={active('/wallet')} onClick={() => go('/wallet')} style={{ textAlign: 'left' }}>Wallet</button>
            {user.role === 'admin' && <button className={active('/create-event')} onClick={() => go('/create-event')} style={{ textAlign: 'left' }}>+ Create Event</button>}
            <button className="nav-link" onClick={handleLogout} style={{ textAlign: 'left', color: 'var(--danger)' }}>Logout</button>
          </>}
          {!user && <>
            <button className={active('/login')} onClick={() => go('/login')} style={{ textAlign: 'left' }}>Login</button>
            <button className="btn btn-primary" onClick={() => go('/register')} style={{ marginTop: 4 }}>Sign Up</button>
          </>}
        </div>
      )}
    </nav>
  );
}
