const { priceCart, validateCustomer } = require('./_lib/pricing');
const { getSupabase, getUserId } = require('./_lib/supabase');
const { quoteDelivery } = require('./_lib/shiprocket');

// Razorpay allows at most 256 characters per note value.
function chunk(text, size) {
  const parts = [];
  for (let i = 0; i < text.length; i += size) parts.push(text.slice(i, i + size));
  return parts;
}

// Stores the order for 90 days (see supabase/schema.sql). A storage failure is
// logged but doesn't block payment; Razorpay still has the details in its notes.
async function saveOrder(req, razorpayOrderId, customer, pricing) {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    await insertOrder(supabase, req, razorpayOrderId, customer, pricing);
  } catch (err) {
    console.error('Failed to store order', razorpayOrderId, err);
  }
}

async function insertOrder(supabase, req, razorpayOrderId, customer, pricing) {
  const { error } = await supabase.from('orders').insert({
    razorpay_order_id: razorpayOrderId,
    user_id: await getUserId(req),
    customer_name: customer.name,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    city: customer.city,
    state: customer.state,
    pincode: customer.pincode,
    items: pricing.lines,
    package: pricing.package,
    subtotal: pricing.subtotal,
    delivery: pricing.delivery,
    total: pricing.total,
  });
  if (error) console.error('Failed to store order', razorpayOrderId, error);
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
    // Delivery is re-quoted here so the charged amount never comes from the browser.
    const { delivery } = await quoteDelivery(customer.pincode, pricing.package.weightKg);
    pricing = { ...pricing, delivery, total: pricing.subtotal + delivery };
  } catch (err) {
    if (!err.status) console.error('Order validation error', err);
    return res.status(err.status || 500).json({ error: err.status ? err.message : 'Something went wrong. Please try again.' });
  }

  const itemSummary = pricing.lines
    .map((l) => `${l.name} ${l.size} x${l.quantity}`)
    .join('; ');

  const notes = {
    customer_name: customer.name,
    customer_phone: customer.phone,
    customer_email: customer.email,
    delivery_address: customer.address,
    city_state: `${customer.city}, ${customer.state}`,
    pincode: customer.pincode,
    delivery_charge: String(pricing.delivery),
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

    await saveOrder(req, order.id, customer, pricing);

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      delivery: pricing.delivery,
      keyId,
    });
  } catch (err) {
    console.error('Razorpay request error', err);
    return res.status(502).json({ error: 'Could not start payment. Please try again.' });
  }
};
