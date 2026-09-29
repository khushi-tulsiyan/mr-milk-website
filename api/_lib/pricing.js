// Server-side pricing. The amount charged is always computed here from the
// catalog, never taken from the browser.
const catalog = require('../../src/data/gheeCatalog.json');

class RequestError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

const MAX_LINES = 20;

// Shipping package for the whole order: jars stacked in one box, so the box
// takes the widest footprint and the summed height.
function packageFor(entries) {
  const weightKg = entries.reduce((sum, e) => sum + e.variant.weightKg * e.quantity, 0);
  return {
    weightKg: Math.round(weightKg * 100) / 100,
    length: Math.max(...entries.map((e) => e.variant.boxCm[0])),
    breadth: Math.max(...entries.map((e) => e.variant.boxCm[1])),
    height: entries.reduce((sum, e) => sum + e.variant.boxCm[2] * e.quantity, 0),
  };
}

function priceCart(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new RequestError('Cart is empty');
  }
  if (items.length > MAX_LINES) {
    throw new RequestError('Too many items in cart');
  }

  const entries = items.map((item) => {
    const product = catalog.products.find((p) => p.id === item?.productId);
    const variant = product?.variants.find((v) => v.id === item?.variantId);
    if (!product || !variant) {
      throw new RequestError('Unknown product in cart');
    }
    const quantity = item.quantity;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > catalog.maxQuantityPerItem) {
      throw new RequestError(`Invalid quantity for ${product.name}`);
    }
    return { product, variant, quantity };
  });

  const lines = entries.map(({ product, variant, quantity }) => ({
    sku: `${product.id}-${variant.id}`,
    name: product.name,
    size: variant.label,
    quantity,
    unitPrice: variant.price,
    lineTotal: variant.price * quantity,
  }));

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  return { lines, subtotal, package: packageFor(entries), currency: catalog.currency };
}

function validatePincode(value) {
  const pincode = String(value || '').trim();
  if (!/^[1-9]\d{5}$/.test(pincode)) throw new RequestError('Please enter a valid 6-digit pincode');
  return pincode;
}

function validateCustomer(customer) {
  const name = String(customer?.name || '').trim();
  const phone = String(customer?.phone || '').replace(/[\s-]/g, '').replace(/^(\+91|0)/, '');
  const email = String(customer?.email || '').trim();
  const address = String(customer?.address || '').trim();
  const city = String(customer?.city || '').trim();
  const state = String(customer?.state || '').trim();

  if (name.length < 2 || name.length > 100) throw new RequestError('Please enter your full name');
  if (!/^[6-9]\d{9}$/.test(phone)) throw new RequestError('Please enter a valid 10-digit mobile number');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) throw new RequestError('Please enter a valid email');
  if (address.length < 10 || address.length > 250) throw new RequestError('Please enter your full delivery address');
  if (city.length < 2 || city.length > 60) throw new RequestError('Please enter your city');
  if (state.length < 2 || state.length > 60) throw new RequestError('Please enter your state');
  const pincode = validatePincode(customer?.pincode);

  return { name, phone, email, address, city, state, pincode };
}

module.exports = { priceCart, validateCustomer, validatePincode, RequestError, catalog };
