// Server-side pricing. The amount charged is always computed here from the
// catalog, never taken from the browser.
const catalog = require('../../src/data/gheeCatalog.json');

class RequestError extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
  }
}

const MAX_LINES = 20;

function priceCart(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new RequestError('Cart is empty');
  }
  if (items.length > MAX_LINES) {
    throw new RequestError('Too many items in cart');
  }

  const lines = items.map((item) => {
    const product = catalog.products.find((p) => p.id === item?.productId);
    const variant = product?.variants.find((v) => v.id === item?.variantId);
    if (!product || !variant) {
      throw new RequestError('Unknown product in cart');
    }
    const quantity = item.quantity;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > catalog.maxQuantityPerItem) {
      throw new RequestError(`Invalid quantity for ${product.name}`);
    }
    return {
      name: product.name,
      size: variant.label,
      quantity,
      unitPrice: variant.price,
      lineTotal: variant.price * quantity,
    };
  });

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const delivery = catalog.deliveryCharge;
  return { lines, subtotal, delivery, total: subtotal + delivery, currency: catalog.currency };
}

function validateCustomer(customer) {
  const name = String(customer?.name || '').trim();
  const phone = String(customer?.phone || '').replace(/[\s-]/g, '').replace(/^(\+91|0)/, '');
  const email = String(customer?.email || '').trim();
  const address = String(customer?.address || '').trim();
  const pincode = String(customer?.pincode || '').trim();

  if (name.length < 2 || name.length > 100) throw new RequestError('Please enter your full name');
  if (!/^[6-9]\d{9}$/.test(phone)) throw new RequestError('Please enter a valid 10-digit mobile number');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new RequestError('Please enter a valid email');
  if (address.length < 10 || address.length > 250) throw new RequestError('Please enter your full delivery address');
  if (!/^\d{6}$/.test(pincode)) throw new RequestError('Please enter a valid 6-digit pincode');

  return { name, phone, email, address, pincode };
}

module.exports = { priceCart, validateCustomer, RequestError };
