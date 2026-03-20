import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Wallet() {
  const { user, updateWallet } = useAuth();
  const [amount,   setAmount]   = useState('');
  const [loading,  setLoading]  = useState(false);
  const [testLoad, setTestLoad] = useState(false);
  const [msg,      setMsg]      = useState({ text: '', type: '' });

  const notify = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 5000);
  };

  const handleTestTopUp = async (amt) => {
    setTestLoad(true);
    try {
      const { data } = await api.post('/payments/test-topup', { amount: amt });
      updateWallet(data.walletBalance);
      notify('🎉 ₹' + amt + ' added! New balance: ₹' + data.walletBalance.toFixed(2));
    } catch (err) {
      notify(err.response?.data?.message || 'Test top-up failed', 'error');
    } finally {
      setTestLoad(false);
    }
  };

  const testAmounts = [100, 500, 1000, 2000];

  return (
    <div className="page" style={{ maxWidth: 600 }}>
      {msg.text && (
        <div className={'alert alert-' + (msg.type === 'error' ? 'error' : 'success')}>
          {msg.text}
        </div>
      )}
      <div className="wallet-balance">
        <div className="wallet-label">💰 Wallet Balance</div>
        <div className="wallet-amount">₹{(user?.walletBalance || 0).toFixed(2)}</div>
        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>
          Available to spend on tickets
        </div>
      </div>
      <div className="card" style={{ border: '1px solid var(--accent)', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: '1.2rem' }}>🧪</span>
          <h3 style={{ color: 'var(--accent)' }}>Test Mode — Add Money Instantly</h3>
        </div>
        <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 16 }}>
          No Razorpay needed. Click any button to instantly credit your wallet.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {testAmounts.map((a) => (
            <button key={a} className="btn btn-success"
              onClick={() => handleTestTopUp(a)} disabled={testLoad}
              style={{ flex: 1, minWidth: 80 }}>
              {testLoad ? '…' : '+ ₹' + a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
