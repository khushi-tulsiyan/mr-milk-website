import catalog from '../data/gheeCatalog.json';

export const MAX_QTY = catalog.maxQuantityPerItem;

export const formatINR = (amount) => `₹${amount.toLocaleString('en-IN')}`;

export const findProduct = (productId) =>
  catalog.products.find((p) => p.id === productId);

// Display totals for the cart. The server recomputes the charged amount itself;
// items no longer in the catalog are skipped here.
export function cartSummary(items) {
  const lines = items.flatMap((item) => {
    const product = findProduct(item.productId);
    const variant = product?.variants.find((v) => v.id === item.variantId);
    if (!product || !variant) return [];
    return [{
      ...item,
      name: product.name,
      image: product.image,
      size: variant.label,
      unitPrice: variant.price,
      lineTotal: variant.price * item.quantity,
    }];
  });
  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const delivery = lines.length ? catalog.deliveryCharge : 0;
  const count = lines.reduce((sum, l) => sum + l.quantity, 0);
  return { lines, subtotal, delivery, total: subtotal + delivery, count };
}

export function cartReducer(items, action) {
  const sameLine = (i) => i.productId === action.productId && i.variantId === action.variantId;
  switch (action.type) {
    case 'add': {
      const existing = items.find(sameLine);
      if (existing) {
        return items.map((i) =>
          sameLine(i) ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + 1) } : i
        );
      }
      return [...items, { productId: action.productId, variantId: action.variantId, quantity: 1 }];
    }
    case 'setQuantity':
      if (action.quantity < 1) return items.filter((i) => !sameLine(i));
      return items.map((i) =>
        sameLine(i) ? { ...i, quantity: Math.min(MAX_QTY, action.quantity) } : i
      );
    case 'remove':
      return items.filter((i) => !sameLine(i));
    case 'clear':
      return [];
    default:
      return items;
  }
}
