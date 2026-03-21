import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [qrTicket, setQrTicket] = useState(null);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  const notify = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/tickets/my');
      setTickets(data);
    } catch { notify('Failed to load tickets', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleCancel = async (ticketId) => {
    if (!window.confirm('Cancel this listing?')) return;
    setCancelling(ticketId);
    try {
      await api.patch(`/tickets/cancel/${ticketId}`);
      notify('Listing cancelled successfully');
      fetchTickets();
    } catch (err) {
      notify(err.response?.data?.message || 'Cancel failed', 'error');
    } finally { setCancelling(null); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const statusBadge = { available: 'badge-green', sold: 'badge-gray', cancelled: 'badge-red' };

  if (loading) return <div className="spinner">⏳</div>;

  return (
    <div className="page">
      {msg.text && <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>{msg.text}</div>}

      <div className="flex-between mb-16">
        <div>
          <div className="page-title">My Tickets</div>
          <div className="page-sub">All tickets you own or have listed</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Browse Events</button>
      </div>

      {tickets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎫</div>
          <p>You don't have any tickets yet.</p>
          <button className="btn btn-primary mt-16" onClick={() => navigate('/')}>Browse Events</button>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Seat</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{t.event?.title}</div>
                    <div className="text-muted text-sm">📍 {t.event?.venue}</div>
                  </td>
                  <td className="text-sm">{t.event?.date ? formatDate(t.event.date) : '—'}</td>
                  <td className="text-sm">{t.seatNumber}</td>
                  <td>
                    <span className={`badge ${t.category === 'VIP' ? 'badge-purple' : t.category === 'Premium' ? 'badge-yellow' : 'badge-gray'}`}>
                      {t.category}
                    </span>
                  </td>
                  <td style={{ color: 'var(--accent)', fontWeight: 700 }}>₹{t.price}</td>
                  <td><span className={`badge ${statusBadge[t.status] || 'badge-gray'}`}>{t.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => setQrTicket(t)}>🎟️ QR</button>
                      <button className="btn btn-outline btn-sm" onClick={() => navigate(`/events/${t.event?._id}`)}>View</button>
                      {t.status === 'available' && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(t._id)} disabled={cancelling === t._id}>
                          {cancelling === t._id ? '…' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* QR Modal */}
      {qrTicket && (
        <div onClick={() => setQrTicket(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 16, padding: 32, textAlign: 'center', maxWidth: 340, width: '90%'
          }}>
            <h3 style={{ marginBottom: 4 }}>{qrTicket.event?.title}</h3>
            <p className="text-muted text-sm" style={{ marginBottom: 20 }}>
              Seat: {qrTicket.seatNumber} · {qrTicket.category} · ₹{qrTicket.price}
            </p>
            <div style={{ background: '#fff', padding: 16, borderRadius: 12, display: 'inline-block', marginBottom: 16 }}>
              <QRCodeSVG
                value={JSON.stringify({ ticketId: qrTicket._id, event: qrTicket.event?.title, seat: qrTicket.seatNumber, category: qrTicket.category, price: qrTicket.price })}
                size={200}
              />
            </div>
            <p className="text-muted text-sm" style={{ marginBottom: 16 }}>Show this QR at the venue</p>
            <button className="btn btn-outline btn-sm" onClick={() => setQrTicket(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
