const crypto = require('crypto');
const { getSupabase } = require('./_lib/supabase');
const shiprocket = require('./_lib/shiprocket');

// Marks the stored order paid, then creates it in Shiprocket once. A Shiprocket
// failure is saved on the order (shiprocket_error) for manual follow-up and
// never fails the customer's payment confirmation.
async function markPaidAndShip(supabase, orderId, paymentId) {
  const { data: order, error } = await supabase
    .from('orders')
    .update({ status: 'paid', razorpay_payment_id: paymentId, paid_at: new Date().toISOString() })
    .eq('razorpay_order_id', orderId)
    .select('*')
    .maybeSingle();
  if (error || !order) {
    console.error('Failed to mark order paid', orderId, error || 'order not found');
    return;
  }
  if (!shiprocket.isConfigured() || order.shiprocket_order_id) return;

  try {
    const { shiprocketOrderId, shipmentId } = await shiprocket.createShiprocketOrder(order);
    await supabase
      .from('orders')
      .update({ shiprocket_order_id: shiprocketOrderId, shiprocket_shipment_id: shipmentId || null, shiprocket_error: null })
      .eq('razorpay_order_id', orderId);
  } catch (err) {
    console.error('Shiprocket order creation failed', orderId, err);
    await supabase
      .from('orders')
      .update({ shiprocket_error: String(err.message).slice(0, 1000) })
      .eq('razorpay_order_id', orderId);
  }
}

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
    try {
      await markPaidAndShip(supabase, orderId, paymentId);
    } catch (err) {
      console.error('Post-payment processing failed', orderId, err);
    }
  }

  return res.status(200).json({ verified: true, orderId, paymentId });
};
