import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar       from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Login        from './pages/Login';
import Register     from './pages/Register';
import Events       from './pages/Events';
import EventDetail  from './pages/EventDetail';
import MyTickets    from './pages/MyTickets';
import Orders       from './pages/Orders';
import Wallet       from './pages/Wallet';
import CreateEvent  from './pages/CreateEvent';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"           element={<Navigate to="/events" replace />} />
          <Route path="/events"     element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/login"      element={<Login />} />
          <Route path="/register"   element={<Register />} />
          <Route path="/my-tickets"   element={<PrivateRoute><MyTickets /></PrivateRoute>} />
          <Route path="/orders"       element={<PrivateRoute><Orders /></PrivateRoute>} />
          <Route path="/wallet"       element={<PrivateRoute><Wallet /></PrivateRoute>} />
          <Route path="/create-event" element={<PrivateRoute><CreateEvent /></PrivateRoute>} />
          <Route path="*"           element={<Navigate to="/events" replace />} />
        </Routes>
        <footer style={{
          textAlign: 'center',
          padding: '24px',
          color: 'var(--muted)',
          fontSize: '0.85rem',
          borderTop: '1px solid var(--border)',
          marginTop: '40px'
        }}>
          Made with ❤️ by <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Aryan Bajaj</span>
        </footer>
      </BrowserRouter>
    </AuthProvider>
  );
}
