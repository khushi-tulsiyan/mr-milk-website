import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { cartReducer, cartSummary } from './utils/cart';

beforeAll(() => {
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

test('ghee shop is separate; product catalogue keeps WhatsApp buttons', () => {
  render(<App />);
  expect(screen.getByText('Buy Ghee Online')).toBeInTheDocument();
  expect(screen.getAllByText('Add to cart')).toHaveLength(3);
  expect(screen.getAllByText('BUY NOW')).toHaveLength(10);
});

test('adding ghee opens the cart', () => {
  render(<App />);
  fireEvent.click(screen.getAllByText('Add to cart')[0]);
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByText('Checkout')).toBeInTheDocument();
});

test('cart totals use catalog prices', () => {
  let items = cartReducer([], { type: 'add', productId: 'cow-ghee', variantId: '1kg' });
  items = cartReducer(items, { type: 'add', productId: 'cow-ghee', variantId: '1kg' });
  items = cartReducer(items, { type: 'add', productId: 'a2-cow-ghee', variantId: '500g' });
  const summary = cartSummary(items);
  expect(summary.count).toBe(3);
  expect(summary.subtotal).toBe(1300 * 2 + 1200);
});

test('quantity below 1 removes the line; unknown items are ignored', () => {
  const items = cartReducer(
    [{ productId: 'cow-ghee', variantId: '1kg', quantity: 1 }],
    { type: 'setQuantity', productId: 'cow-ghee', variantId: '1kg', quantity: 0 }
  );
  expect(items).toEqual([]);
  expect(cartSummary([{ productId: 'gone', variantId: 'x', quantity: 2 }]).total).toBe(0);
});
