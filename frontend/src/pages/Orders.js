import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders]   = useState([]);
  const [txns,   setTxns]     = useState([]);
  const [tab,    setTab]       = useState('orders');
  const [loading, setLoading]  = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [o, t] = await Promise.all([
          api.get('/orders/my'),
          api.get('/orders/transactions'),
        ]);
        setOrders(o.data);
        setTxns(t.data);
      } catch {}
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const fmt = (d) =>
    new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const statusBadge = { completed: 'badge-green', cancelled: 'badge-red', pending: 'badge-yellow', refunded: 'badge-purple' };
  const txnBadge    = { credit: 'badge-green', debit: 'badge-red', wallet_topup: 'badge-purple', refund: 'badge-yellow' };

  if (loading) return <div className="spinner">⏳</div>;

  return (
    <div className="page">
      <div className="page-title">Order & Transaction History</div>
      <div className="page-sub">Track all your buys, sells, and wallet activity</div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['orders', 'transactions'].map((t) => (
          <button
            key={t}
            className={`btn ${tab === t ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setTab(t)}
          >
            {t === 'orders' ? `🎫 Orders (${orders.length})` : `💳 Transactions (${txns.length})`}
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>No orders yet. Buy or sell your first ticket!</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Type</th>
                  <th>Other Party</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const isBuyer = o.buyer?._id === user?._id;
                  return (
                    <tr key={o._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{o.event?.title}</div>
                        <div className="text-muted text-sm">📍 {o.event?.venue}</div>
                      </td>
                      <td>
                        <span className={`badge ${isBuyer ? 'badge-red' : 'badge-green'}`}>
                          {isBuyer ? '⬇ Bought' : '⬆ Sold'}
                        </span>
                      </td>
                      <td className="text-sm">{isBuyer ? o.seller?.name : o.buyer?.name}</td>
                      <td style={{ fontWeight: 700, color: isBuyer ? 'var(--danger)' : 'var(--accent)' }}>
                        {isBuyer ? '-' : '+'}₹{o.amount}
                      </td>
                      <td><span className={`badge ${statusBadge[o.status] || 'badge-gray'}`}>{o.status}</span></td>
                      <td className="text-sm">{fmt(o.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {tab === 'transactions' && (
        txns.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💳</div>
            <p>No transactions yet. Top up your wallet to get started!</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Balance After</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {txns.map((t) => (
                  <tr key={t._id}>
                    <td><span className={`badge ${txnBadge[t.type] || 'badge-gray'}`}>{t.type.replace('_', ' ')}</span></td>
                    <td className="text-sm">{t.description}</td>
                    <td style={{ fontWeight: 700, color: t.type === 'debit' ? 'var(--danger)' : 'var(--accent)' }}>
                      {t.type === 'debit' ? '-' : '+'}₹{t.amount}
                    </td>
                    <td style={{ color: 'var(--muted)' }}>₹{t.balanceAfter?.toFixed(2)}</td>
                    <td className="text-sm">{fmt(t.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
