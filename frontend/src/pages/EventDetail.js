import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function EventDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { user, updateWallet } = useAuth();

  const [event,    setEvent]    = useState(null);
  const [tickets,  setTickets]  = useState([]);
  const [matched,  setMatched]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [buying,   setBuying]   = useState(null);
  const [msg,      setMsg]      = useState({ text: '', type: '' });

  // Sell form
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState({ price: '', seatNumber: '', category: 'General' });
  const [listing,  setListing]  = useState(false);

  const notify = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [evRes, tkRes, mtRes] = await Promise.all([
        api.get(`/events/${id}`),
        api.get(`/tickets/event/${id}`),
        api.get(`/tickets/match/${id}`),
      ]);
      setEvent(evRes.data);
      setTickets(tkRes.data);
      setMatched(mtRes.data);
    } catch {
      notify('Failed to load event', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleBuy = async (ticketId) => {
    if (!user) return navigate('/login');
    setBuying(ticketId);
    try {
      const { data } = await api.post(`/tickets/buy/${ticketId}`);
      updateWallet(data.walletBalance);
      notify(`🎉 Ticket purchased! New balance: ₹${data.walletBalance.toFixed(2)}`);
      fetchData();
    } catch (err) {
      notify(err.response?.data?.message || 'Purchase failed', 'error');
    } finally {
      setBuying(null);
    }
  };

  const handleList = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setListing(true);
    try {
      await api.post('/tickets/list', { eventId: id, ...form });
      notify('✅ Ticket listed successfully!');
      setForm({ price: '', seatNumber: '', category: 'General' });
      setShowForm(false);
      fetchData();
    } catch (err) {
      notify(err.response?.data?.message || 'Listing failed', 'error');
    } finally {
      setListing(false);
    }
  };

  if (loading) return <div className="spinner">⏳</div>;
  if (!event)  return <div className="page"><div className="alert alert-error">Event not found</div></div>;

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const catColor = { VIP: 'badge-purple', Premium: 'badge-yellow', General: 'badge-gray' };

  return (
    <div className="page">
      {msg.text && <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>{msg.text}</div>}

      {/* Event Header */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="event-cat" style={{ marginBottom: 6 }}>{event.category}</div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>{event.title}</h1>
            {event.description && <p style={{ color: 'var(--muted)', marginBottom: 12 }}>{event.description}</p>}
            <div className="event-meta">📍 {event.venue}</div>
            <div className="event-meta">📅 {formatDate(event.date)}</div>
            <div className="event-meta">🎫 {event.totalTickets} total tickets</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Base price</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>₹{event.basePrice}</div>
            {user && (
              <button className="btn btn-primary btn-sm mt-8" onClick={() => setShowForm(!showForm)}>
                {showForm ? '✕ Cancel' : '+ Sell a Ticket'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sell Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 28, border: '1px solid var(--primary)' }}>
          <h3 style={{ marginBottom: 16 }}>List a Ticket for Sale</h3>
          <form onSubmit={handleList} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Price (₹) *</label>
              <input type="number" min="1" placeholder="e.g. 1500"
                value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Seat Number</label>
              <input placeholder="e.g. A12 or Any"
                value={form.seatNumber} onChange={(e) => setForm({ ...form, seatNumber: e.target.value })} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option>General</option>
                <option>Premium</option>
                <option>VIP</option>
              </select>
            </div>
            <button className="btn btn-success" type="submit" disabled={listing}>
              {listing ? '…' : 'List'}
            </button>
          </form>
        </div>
      )}

      {/* Best Matched Tickets */}
      {matched.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ marginBottom: 4 }}>⚡ Best Deals (Dynamic Matching)</h2>
          <p className="text-muted" style={{ marginBottom: 16 }}>Lowest-priced tickets sorted for instant transaction</p>
          {matched.map((t) => (
            <div key={t._id} className="ticket-row" style={{ border: '1px solid var(--accent)' }}>
              <div className="ticket-info">
                <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                  <span className={`badge ${catColor[t.category] || 'badge-gray'}`}>{t.category}</span>
                  <span className="text-muted text-sm">Seat: {t.seatNumber}</span>
                </div>
                <div className="text-muted text-sm">Seller: {t.seller?.name}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div className="ticket-price">₹{t.price}</div>
                {user ? (
                  <button className="btn btn-success btn-sm"
                    onClick={() => handleBuy(t._id)}
                    disabled={buying === t._id || t.seller?._id === user._id}>
                    {buying === t._id ? '…' : t.seller?._id === user._id ? 'Yours' : 'Buy Now'}
                  </button>
                ) : (
                  <button className="btn btn-outline btn-sm" onClick={() => navigate('/login')}>Login to Buy</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All Available Tickets */}
      <div>
        <h2 style={{ marginBottom: 4 }}>All Available Tickets</h2>
        <p className="text-muted" style={{ marginBottom: 16 }}>{tickets.length} ticket{tickets.length !== 1 ? 's' : ''} available</p>
        {tickets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎫</div>
            <p>No tickets listed yet. Be the first to sell one!</p>
          </div>
        ) : (
          tickets.map((t) => (
            <div key={t._id} className="ticket-row">
              <div className="ticket-info">
                <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                  <span className={`badge ${catColor[t.category] || 'badge-gray'}`}>{t.category}</span>
                  <span className="text-muted text-sm">Seat: {t.seatNumber}</span>
                </div>
                <div className="text-muted text-sm">Seller: {t.seller?.name}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div className="ticket-price">₹{t.price}</div>
                {user ? (
                  <button className="btn btn-primary btn-sm"
                    onClick={() => handleBuy(t._id)}
                    disabled={buying === t._id || t.seller?._id === user._id}>
                    {buying === t._id ? '…' : t.seller?._id === user._id ? 'Yours' : 'Buy'}
                  </button>
                ) : (
                  <button className="btn btn-outline btn-sm" onClick={() => navigate('/login')}>Login to Buy</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
