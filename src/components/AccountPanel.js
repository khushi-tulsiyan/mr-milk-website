import React, { useEffect, useState } from 'react';
import './CartDrawer.css';
import './AccountPanel.css';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/cart';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const sendCode = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (err) setError(err.message);
    else setSent(true);
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error: err } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' });
    setBusy(false);
    if (err) setError('That code is invalid or has expired.');
  };

  if (!sent) {
    return (
      <form className="cart-form" onSubmit={sendCode}>
        <div className="cart-body">
          <p className="account-intro">
            Sign in to save your delivery details and see your recent orders. No password needed.
          </p>
          <label>Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </label>
          {error && <p className="cart-error" role="alert">{error}</p>}
          <button type="submit" className="btn btn-primary cart-cta" disabled={busy}>
            {busy ? 'Sending…' : 'Email me a sign-in code'}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form className="cart-form" onSubmit={verifyCode}>
      <div className="cart-body">
        <p className="account-intro">
          We sent a code to <strong>{email}</strong>. Enter it below, or click the link in the email.
        </p>
        <label>Sign-in code
          <input value={code} onChange={(e) => setCode(e.target.value)} required inputMode="numeric"
            autoComplete="one-time-code" maxLength={10} />
        </label>
        {error && <p className="cart-error" role="alert">{error}</p>}
        <button type="submit" className="btn btn-primary cart-cta" disabled={busy}>
          {busy ? 'Checking…' : 'Sign in'}
        </button>
        <button type="button" className="cart-back" onClick={() => { setSent(false); setCode(''); }}>
          Use a different email
        </button>
      </div>
    </form>
  );
};

const ProfileForm = () => {
  const { profile, saveProfile } = useAuth();
  const [form, setForm] = useState({ full_name: '', phone: '', address: '', pincode: '' });
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        pincode: profile.pincode || '',
      });
    }
  }, [profile]);

  const update = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setStatus('');
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await saveProfile(form);
      setStatus('Saved');
    } catch (err) {
      setStatus(err.message);
    }
  };

  return (
    <form className="cart-form account-profile" onSubmit={submit}>
      <label>Full name
        <input name="full_name" value={form.full_name} onChange={update} autoComplete="name" maxLength={100} />
      </label>
      <label>Mobile number
        <input name="phone" value={form.phone} onChange={update} type="tel" inputMode="numeric" autoComplete="tel" />
      </label>
      <label>Delivery address
        <textarea name="address" value={form.address} onChange={update} rows={3} autoComplete="street-address" maxLength={250} />
      </label>
      <label>Pincode
        <input name="pincode" value={form.pincode} onChange={update} inputMode="numeric" autoComplete="postal-code"
          pattern="\d{6}" maxLength={6} />
      </label>
      <button type="submit" className="btn btn-primary cart-cta">Save details</button>
      {status && <p className="account-status" role="status">{status}</p>}
    </form>
  );
};

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    supabase
      .from('orders')
      .select('id, razorpay_payment_id, status, items, total, created_at')
      .eq('status', 'paid')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error('Failed to load orders', error);
        setOrders(data || []);
      });
  }, [user?.id]);

  if (!orders) return <p className="cart-muted">Loading orders…</p>;
  if (!orders.length) return <p className="cart-muted">No orders in the last 90 days.</p>;

  return (
    <ul className="account-orders">
      {orders.map((order) => (
        <li key={order.id} className="account-order">
          <div className="account-order-head">
            <span>{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <strong>{formatINR(order.total)}</strong>
          </div>
          <div className="account-order-items">
            {order.items.map((l) => `${l.name} ${l.size} × ${l.quantity}`).join(', ')}
          </div>
          <div className="cart-muted">Payment ID: {order.razorpay_payment_id}</div>
        </li>
      ))}
    </ul>
  );
};

const AccountPanel = () => {
  const { enabled, user, accountOpen, closeAccount, signOut } = useAuth();
  const [tab, setTab] = useState('profile');

  useEffect(() => {
    if (!accountOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && closeAccount();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [accountOpen, closeAccount]);

  if (!enabled || !accountOpen) return null;

  return (
    <div className="cart-overlay" onClick={closeAccount}>
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="account-title"
        onClick={(e) => e.stopPropagation()}>
        <header className="cart-header">
          <h2 id="account-title">{user ? 'My account' : 'Sign in'}</h2>
          <button className="cart-close" onClick={closeAccount} aria-label="Close account">×</button>
        </header>

        {!user ? <SignIn /> : (
          <>
            <div className="account-tabs" role="tablist">
              <button role="tab" aria-selected={tab === 'profile'} className={tab === 'profile' ? 'active' : ''}
                onClick={() => setTab('profile')}>Saved details</button>
              <button role="tab" aria-selected={tab === 'orders'} className={tab === 'orders' ? 'active' : ''}
                onClick={() => setTab('orders')}>My orders</button>
            </div>
            <div className="cart-body">
              <p className="cart-muted account-email">Signed in as {user.email}</p>
              {tab === 'profile' ? <ProfileForm /> : <OrderHistory />}
            </div>
            <footer className="cart-footer">
              <p className="cart-muted account-note">Order records are kept for 90 days, then deleted.</p>
              <button className="cart-back" onClick={signOut}>Sign out</button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
};

export default AccountPanel;
