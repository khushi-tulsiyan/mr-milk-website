const crypto = require('crypto');
const { getSupabase } = require('./_lib/supabase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return res.status(500).json({ error: 'Payments are not configured yet' });
  }

  const {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
  } = req.body || {};

  if (![orderId, paymentId, signature].every((v) => typeof v === 'string' && v)) {
    return res.status(400).json({ verified: false, error: 'Missing payment details' });
  }

  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  const verified = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!verified) {
    return res.status(400).json({ verified: false, error: 'Payment verification failed' });
  }
  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'paid', razorpay_payment_id: paymentId, paid_at: new Date().toISOString() })
      .eq('razorpay_order_id', orderId);
    if (error) console.error('Failed to mark order paid', orderId, error);
  }

  return res.status(200).json({ verified: true, orderId, paymentId });
};
