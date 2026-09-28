const { priceCart, validateCustomer } = require('./_lib/pricing');

// Razorpay allows at most 256 characters per note value.
function chunk(text, size) {
  const parts = [];
  for (let i = 0; i < text.length; i += size) parts.push(text.slice(i, i + size));
  return parts;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    console.error('RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set');
    return res.status(500).json({ error: 'Payments are not configured yet' });
  }

  let pricing;
  let customer;
  try {
    pricing = priceCart(req.body?.items);
    customer = validateCustomer(req.body?.customer);
  } catch (err) {
    return res.status(err.status || 400).json({ error: err.message });
  }

  const itemSummary = pricing.lines
    .map((l) => `${l.name} ${l.size} x${l.quantity}`)
    .join('; ');

  const notes = {
    customer_name: customer.name,
    customer_phone: customer.phone,
    customer_email: customer.email || '-',
    delivery_address: customer.address,
    pincode: customer.pincode,
  };
  chunk(itemSummary, 250).slice(0, 5).forEach((part, i) => {
    notes[i === 0 ? 'items' : `items_${i + 1}`] = part;
  });

  try {
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: pricing.total * 100, // paise
        currency: pricing.currency,
        receipt: `ghee_${Date.now()}`,
        notes,
      }),
    });
    const order = await response.json();
    if (!response.ok) {
      console.error('Razorpay order creation failed', order);
      return res.status(502).json({ error: 'Could not start payment. Please try again.' });
    }

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (err) {
    console.error('Razorpay request error', err);
    return res.status(502).json({ error: 'Could not start payment. Please try again.' });
  }
};
