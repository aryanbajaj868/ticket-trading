import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const link = (label, path) => (
    <button
      className={`nav-link ${pathname === path ? 'active' : ''}`}
      onClick={() => navigate(path)}
    >
      {label}
    </button>
  );

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          Ticket<span>X</span>
        </div>
        <div className="navbar-links">
          {link('Events', '/events')}
          {user && (
            <>
              {link('My Tickets', '/my-tickets')}
              {link('Orders', '/orders')}
              {link('Wallet', '/wallet')}
              <span className="nav-wallet">₹{(user.walletBalance || 0).toFixed(2)}</span>
              <button className="btn btn-outline btn-sm" onClick={() => { logout(); navigate('/login'); }}>
                Logout
              </button>
            </>
          )}
          {!user && (
            <>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/login')}>Login</button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>Sign Up</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
