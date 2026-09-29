const { priceCart, validatePincode } = require('./_lib/pricing');
const { quoteDelivery } = require('./_lib/shiprocket');

// Checkout calls this once a pincode is entered: returns the delivery charge,
// or 422 when no courier serves the pincode.
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const pricing = priceCart(req.body?.items);
    const pincode = validatePincode(req.body?.pincode);
    const quote = await quoteDelivery(pincode, pricing.package.weightKg);
    return res.status(200).json({ ...quote, subtotal: pricing.subtotal, total: pricing.subtotal + quote.delivery });
  } catch (err) {
    if (!err.status) console.error('Shipping quote error', err);
    return res.status(err.status || 500).json({ error: err.status ? err.message : 'Could not calculate delivery.' });
  }
};
