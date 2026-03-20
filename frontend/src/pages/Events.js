import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Concert', 'Sports', 'Theatre', 'Conference', 'Festival', 'Other'];

const catEmoji = {
  Concert: '🎵', Sports: '⚽', Theatre: '🎭',
  Conference: '💼', Festival: '🎉', Other: '🎟️',
};

export default function Events() {
  const [events,   setEvents]   = useState([]);
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('');
  const [loading,  setLoading]  = useState(true);
  const navigate = useNavigate();
  const { user }  = useAuth();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search)   params.search   = search;
      if (category) params.category = category;
      const { data } = await api.get('/events', { params });
      setEvents(data);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, [category]);                   // re-fetch on category change
  const handleSearch = (e) => { e.preventDefault(); fetchEvents(); }; // search on submit

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="page">
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #1e0a3c 0%, #0f172a 100%)',
        borderRadius: 16, padding: '40px 32px', marginBottom: 32, textAlign: 'center',
        border: '1px solid var(--border)',
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🎟️</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>
          Buy &amp; Sell Event Tickets
        </h1>
        <p style={{ color: 'var(--muted)', marginBottom: 20 }}>
          Dynamic pricing · Instant matching · Secure wallet payments
        </p>
        {!user && (
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate('/register')}>Get Started</button>
            <button className="btn btn-outline"  onClick={() => navigate('/login')}>Log In</button>
          </div>
        )}
        {user && (
          <button className="btn btn-primary" onClick={() => navigate('/my-tickets')}>
            My Tickets →
          </button>
        )}
      </div>

      {/* Search + Filter */}
      <form className="search-bar" onSubmit={handleSearch}>
        <input
          placeholder="🔍  Search events…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button type="submit" className="btn btn-primary">Search</button>
        {user?.role === 'admin' && (
          <button type="button" className="btn btn-success" onClick={() => navigate('/create-event')}>
            + Create Event
          </button>
        )}
        {user && (
          <button type="button" className="btn btn-outline" onClick={() => navigate('/my-tickets')}>
            + List My Ticket
          </button>
        )}
      </form>

      {/* Events Grid */}
      {loading ? (
        <div className="spinner">⏳</div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎫</div>
          <p>No events found. {user?.role === 'admin' ? 'Create the first one!' : 'Check back soon!'}</p>
        </div>
      ) : (
        <div className="grid-2">
          {events.map((event) => (
            <div key={event._id} className="card event-card" onClick={() => navigate(`/events/${event._id}`)}>
              <div className="event-cat">{catEmoji[event.category]} {event.category}</div>
              <div className="event-title">{event.title}</div>
              <div className="event-meta">📍 {event.venue}</div>
              <div className="event-meta">📅 {formatDate(event.date)}</div>
              <div className="event-meta" style={{ marginTop: 6, fontSize: '0.8rem' }}>
                By {event.createdBy?.name || 'Unknown'}
              </div>
              <div className="flex-between mt-8">
                <div className="event-price">from ₹{event.basePrice}</div>
                <span className={`badge badge-${new Date(event.date) > new Date() ? 'green' : 'gray'}`}>
                  {new Date(event.date) > new Date() ? 'Upcoming' : 'Past'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
