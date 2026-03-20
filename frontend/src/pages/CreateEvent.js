import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CATEGORIES = ['Concert', 'Sports', 'Theatre', 'Conference', 'Festival', 'Other'];

export default function CreateEvent() {
  const navigate = useNavigate();
  const [form, setForm]     = useState({
    title: '', description: '', venue: '', date: '',
    totalTickets: '', basePrice: '', category: 'Concert',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/events', form);
      navigate(`/events/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 600 }}>
      <div className="page-title">Create Event</div>
      <div className="page-sub">List a new event that users can trade tickets for</div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Event Title *</label>
            <input name="title" placeholder="e.g. Coldplay World Tour 2026"
              value={form.title} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" placeholder="Brief description of the event…"
              value={form.description} onChange={handleChange} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Venue *</label>
              <input name="venue" placeholder="e.g. DY Patil Stadium, Mumbai"
                value={form.venue} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Date & Time *</label>
              <input name="date" type="datetime-local"
                value={form.date} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Total Tickets *</label>
              <input name="totalTickets" type="number" min="1" placeholder="e.g. 5000"
                value={form.totalTickets} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Base Price (₹) *</label>
              <input name="basePrice" type="number" min="0" placeholder="e.g. 999"
                value={form.basePrice} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label>Category</label>
            <select name="category" value={form.category} onChange={handleChange}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/events')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating…' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
