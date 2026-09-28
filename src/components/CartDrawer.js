import React, { useEffect, useState } from 'react';
import './CartDrawer.css';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatINR, MAX_QTY } from '../utils/cart';

const RAZORPAY_SRC = 'https://checkout.razorpay.com/v1/checkout.js';
const EMPTY_FORM = { name: '', phone: '', email: '', address: '', pincode: '' };

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = RAZORPAY_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

async function postJSON(url, body, token) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
}

const CartDrawer = () => {
  const { items, summary, isOpen, openCart, closeCart, setQuantity, removeItem, clearCart } = useCart();
  const [step, setStep] = useState('cart'); // cart | checkout | success
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [saveDetails, setSaveDetails] = useState(true);
  const auth = useAuth();

  // Prefill empty checkout fields from the signed-in customer's saved details,
  // including when they sign in partway through checkout.
  const { profile, user } = auth;
  useEffect(() => {
    if (step !== 'checkout') return;
    const saved = profile || {};
    setForm((f) => ({
      name: f.name || saved.full_name || '',
      phone: f.phone || saved.phone || '',
      email: f.email || user?.email || '',
      address: f.address || saved.address || '',
      pincode: f.pincode || saved.pincode || '',
    }));
  }, [step, profile, user]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && !paying && closeCart();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, paying, closeCart]);

  const handleClose = () => {
    if (paying) return;
    closeCart();
    if (step === 'success') setStep('cart');
    setError('');
  };

  const updateField = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePay = async (e) => {
    e.preventDefault();
    setError('');
    setPaying(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error('Could not load the payment window. Check your internet connection.');

      const order = await postJSON('/api/create-order', { items, customer: form }, auth.session?.access_token);

      const rzp = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: 'JFAM',
        description: 'Ghee order',
        image: '/images/mr/logo.png',
        prefill: { name: form.name, contact: form.phone, email: form.email },
        theme: { color: '#2563eb' },
        handler: async (response) => {
          try {
            const result = await postJSON('/api/verify-payment', response);
            setPaymentId(result.paymentId);
            if (auth.user && saveDetails) {
              auth.saveProfile({ full_name: form.name, phone: form.phone, address: form.address, pincode: form.pincode })
                .catch((err) => console.error(err));
            }
            clearCart();
            setForm(EMPTY_FORM);
            setStep('success');
          } catch (err) {
            setError(`${err.message} If money was deducted, contact us at +91 72309 20774 with payment ID ${response.razorpay_payment_id}.`);
          } finally {
            setPaying(false);
          }
        },
        modal: { ondismiss: () => setPaying(false) },
      });
      rzp.on('payment.failed', (resp) => {
        setError(resp.error?.description || 'Payment failed. Please try again.');
      });
      rzp.open();
    } catch (err) {
      setError(err.message);
      setPaying(false);
    }
  };

  return (
    <>
      {summary.count > 0 && !isOpen && (
        <button className="cart-fab" onClick={openCart} aria-label={`Open cart, ${summary.count} items`}>
          <span aria-hidden="true">🛒</span>
          <span className="cart-fab-count">{summary.count}</span>
        </button>
      )}

      {isOpen && (
        <div className="cart-overlay" onClick={handleClose}>
          <aside
            className="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="cart-header">
              <h2 id="cart-title">
                {step === 'checkout' ? 'Delivery details' : step === 'success' ? 'Order placed' : 'Your cart'}
              </h2>
              <button className="cart-close" onClick={handleClose} aria-label="Close cart" disabled={paying}>×</button>
            </header>

            {step === 'success' && (
              <div className="cart-body cart-success">
                <p className="cart-success-title">Thank you! Your payment was successful.</p>
                <p>We will contact you shortly to confirm delivery.</p>
                <p className="cart-muted">Payment ID: {paymentId}</p>
                <button className="btn btn-primary cart-cta" onClick={handleClose}>Continue shopping</button>
              </div>
            )}

            {step === 'cart' && (
              <>
                <div className="cart-body">
                  {summary.lines.length === 0 ? (
                    <p className="cart-muted">Your cart is empty.</p>
                  ) : (
                    <ul className="cart-lines">
                      {summary.lines.map((line) => (
                        <li key={`${line.productId}-${line.variantId}`} className="cart-line">
                          <img src={line.image} alt="" className="cart-line-img" />
                          <div className="cart-line-info">
                            <div className="cart-line-name">{line.name}</div>
                            <div className="cart-muted">{line.size} · {formatINR(line.unitPrice)}</div>
                            <div className="cart-qty">
                              <button
                                onClick={() => setQuantity(line.productId, line.variantId, line.quantity - 1)}
                                aria-label={`Decrease ${line.name} ${line.size}`}
                              >−</button>
                              <span>{line.quantity}</span>
                              <button
                                onClick={() => setQuantity(line.productId, line.variantId, line.quantity + 1)}
                                disabled={line.quantity >= MAX_QTY}
                                aria-label={`Increase ${line.name} ${line.size}`}
                              >+</button>
                              <button className="cart-remove" onClick={() => removeItem(line.productId, line.variantId)}>
                                Remove
                              </button>
                            </div>
                          </div>
                          <div className="cart-line-total">{formatINR(line.lineTotal)}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {summary.lines.length > 0 && (
                  <footer className="cart-footer">
                    <Totals summary={summary} />
                    <button className="btn btn-primary cart-cta" onClick={() => setStep('checkout')}>
                      Checkout
                    </button>
                  </footer>
                )}
              </>
            )}

            {step === 'checkout' && (
              <form className="cart-form" onSubmit={handlePay}>
                <div className="cart-body">
                  {auth.enabled && (
                    <p className="cart-muted cart-account-hint">
                      {auth.user ? `Signed in as ${auth.user.email}` : (
                        <>
                          Have an account?{' '}
                          <button type="button" className="cart-link" onClick={auth.openAccount}>
                            Sign in
                          </button>{' '}
                          to use your saved details.
                        </>
                      )}
                    </p>
                  )}
                  <label>Full name
                    <input name="name" value={form.name} onChange={updateField} required autoComplete="name" maxLength={100} />
                  </label>
                  <label>Mobile number
                    <input name="phone" value={form.phone} onChange={updateField} required type="tel"
                      inputMode="numeric" autoComplete="tel" placeholder="10-digit mobile" />
                  </label>
                  <label>Email (optional)
                    <input name="email" value={form.email} onChange={updateField} type="email" autoComplete="email" />
                  </label>
                  <label>Delivery address
                    <textarea name="address" value={form.address} onChange={updateField} required rows={3}
                      autoComplete="street-address" maxLength={250} />
                  </label>
                  <label>Pincode
                    <input name="pincode" value={form.pincode} onChange={updateField} required inputMode="numeric"
                      autoComplete="postal-code" pattern="\d{6}" maxLength={6} />
                  </label>
                  {auth.user && (
                    <label className="cart-checkbox">
                      <input type="checkbox" checked={saveDetails} onChange={(e) => setSaveDetails(e.target.checked)} />
                      Save these details to my account
                    </label>
                  )}
                  <p className="cart-muted cart-privacy">
                    We keep your order details for 90 days to process and deliver your order, then delete them.
                  </p>
                  {error && <p className="cart-error" role="alert">{error}</p>}
                </div>
                <footer className="cart-footer">
                  <Totals summary={summary} />
                  <button type="submit" className="btn btn-primary cart-cta" disabled={paying || !summary.lines.length}>
                    {paying ? 'Processing…' : `Pay ${formatINR(summary.total)}`}
                  </button>
                  <button type="button" className="cart-back" onClick={() => setStep('cart')} disabled={paying}>
                    ← Back to cart
                  </button>
                </footer>
              </form>
            )}
          </aside>
        </div>
      )}
    </>
  );
};

const Totals = ({ summary }) => (
  <dl className="cart-totals">
    <div><dt>Subtotal</dt><dd>{formatINR(summary.subtotal)}</dd></div>
    <div><dt>Delivery</dt><dd>{summary.delivery ? formatINR(summary.delivery) : 'Free'}</dd></div>
    <div className="cart-grand"><dt>Total</dt><dd>{formatINR(summary.total)}</dd></div>
  </dl>
);

export default CartDrawer;
