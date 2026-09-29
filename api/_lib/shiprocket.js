// Shiprocket API client: delivery rates / pincode serviceability, and pushing
// paid orders. Uses a Shiprocket "API user" (Settings → API → Configure).
const { RequestError, catalog } = require('./pricing');

const BASE = 'https://apiv2.shiprocket.in/v1/external';

function isConfigured() {
  return Boolean(
    process.env.SHIPROCKET_EMAIL &&
    process.env.SHIPROCKET_PASSWORD &&
    process.env.SHIPROCKET_PICKUP_PINCODE &&
    process.env.SHIPROCKET_PICKUP_LOCATION
  );
}

// Tokens are valid for 10 days; reuse while the function instance is warm.
let cachedToken = null;
let tokenExpiresAt = 0;

async function getToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: process.env.SHIPROCKET_EMAIL, password: process.env.SHIPROCKET_PASSWORD }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.token) throw new Error(`Shiprocket login failed (${res.status})`);
  cachedToken = data.token;
  tokenExpiresAt = Date.now() + 9 * 24 * 60 * 60 * 1000;
  return cachedToken;
}

async function call(path, options = {}) {
  const token = await getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) cachedToken = null;
  return { ok: res.ok, status: res.status, data };
}

// Delivery charge (whole rupees) for a prepaid parcel to this pincode, using
// Shiprocket's recommended courier, or the cheapest if none is recommended.
// Throws RequestError when no courier delivers there.
async function quoteDelivery(pincode, weightKg) {
  if (!isConfigured()) {
    return { delivery: catalog.deliveryCharge, courier: null, etd: null };
  }
  const params = new URLSearchParams({
    pickup_postcode: process.env.SHIPROCKET_PICKUP_PINCODE,
    delivery_postcode: pincode,
    weight: String(weightKg),
    cod: '0',
  });
  let result;
  try {
    result = await call(`/courier/serviceability/?${params}`);
  } catch (err) {
    console.error('Shiprocket serviceability error', err);
    throw new RequestError('Could not calculate delivery right now. Please try again shortly.', 502);
  }
  const couriers = result.data?.data?.available_courier_companies || [];
  if (!result.ok && result.status !== 404) {
    console.error('Shiprocket serviceability failed', result.status, result.data);
    throw new RequestError('Could not calculate delivery right now. Please try again shortly.', 502);
  }
  if (!couriers.length) {
    throw new RequestError('Sorry, we do not deliver to this pincode yet.', 422);
  }
  const recommendedId = result.data?.data?.recommended_courier_company_id;
  const chosen = couriers.find((c) => c.courier_company_id === recommendedId)
    || couriers.reduce((a, b) => (Number(b.rate) < Number(a.rate) ? b : a));
  return {
    delivery: Math.ceil(Number(chosen.rate)),
    courier: chosen.courier_name,
    etd: chosen.etd || null,
  };
}

// "YYYY-MM-DD HH:mm" in IST, as Shiprocket expects.
function istTimestamp(date) {
  const ist = new Date(date.getTime() + 5.5 * 60 * 60 * 1000).toISOString();
  return `${ist.slice(0, 10)} ${ist.slice(11, 16)}`;
}

// Creates a prepaid order in Shiprocket from a stored `orders` row.
// Courier assignment / pickup / labels are then done in the Shiprocket panel.
async function createShiprocketOrder(order) {
  const body = {
    order_id: order.razorpay_order_id,
    order_date: istTimestamp(new Date(order.created_at)),
    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION,
    billing_customer_name: order.customer_name,
    billing_last_name: '',
    billing_address: order.address,
    billing_city: order.city,
    billing_state: order.state,
    billing_pincode: order.pincode,
    billing_country: 'India',
    billing_email: order.email,
    billing_phone: order.phone,
    shipping_is_billing: true,
    order_items: order.items.map((l) => ({
      name: `${l.name} ${l.size}`,
      sku: l.sku,
      units: l.quantity,
      selling_price: l.unitPrice,
    })),
    payment_method: 'Prepaid',
    shipping_charges: order.delivery,
    sub_total: order.subtotal,
    length: order.package.length,
    breadth: order.package.breadth,
    height: order.package.height,
    weight: order.package.weightKg,
  };
  const result = await call('/orders/create/adhoc', { method: 'POST', body: JSON.stringify(body) });
  if (!result.ok || !result.data?.order_id) {
    throw new Error(`Shiprocket order failed (${result.status}): ${JSON.stringify(result.data).slice(0, 500)}`);
  }
  return { shiprocketOrderId: String(result.data.order_id), shipmentId: String(result.data.shipment_id || '') };
}

module.exports = { isConfigured, quoteDelivery, createShiprocketOrder };
