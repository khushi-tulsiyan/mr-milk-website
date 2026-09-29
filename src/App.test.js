import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

test('account links are hidden when Supabase is not configured', () => {
  render(<App />);
  expect(screen.queryByText(/Sign in \/ Create account/)).not.toBeInTheDocument();
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
  expect(cartSummary([{ productId: 'gone', variantId: 'x', quantity: 2 }]).subtotal).toBe(0);
});

test('checkout quotes delivery for the pincode before enabling payment', async () => {
  localStorage.clear();
  global.fetch = jest.fn(async (url, opts) => ({
    ok: true,
    json: async () => ({ delivery: 85, courier: 'Delhivery', etd: null, pincode: JSON.parse(opts.body).pincode }),
  }));
  render(<App />);
  fireEvent.click(screen.getAllByText('Add to cart')[0]);
  fireEvent.click(screen.getByText('Checkout'));
  expect(screen.getByText('Enter pincode to continue')).toBeDisabled();

  fireEvent.change(screen.getByLabelText('Pincode'), { target: { value: '333031' } });
  await waitFor(() => expect(screen.getByText('Pay ₹1,585')).toBeEnabled());
  expect(screen.getByText(/We deliver here via Delhivery/)).toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledWith('/api/shipping-quote', expect.anything());
});

test('unserviceable pincode keeps payment disabled', async () => {
  localStorage.clear();
  global.fetch = jest.fn(async () => ({
    ok: false,
    json: async () => ({ error: 'Sorry, we do not deliver to this pincode yet.' }),
  }));
  render(<App />);
  fireEvent.click(screen.getAllByText('Add to cart')[0]);
  fireEvent.click(screen.getByText('Checkout'));
  fireEvent.change(screen.getByLabelText('Pincode'), { target: { value: '999999' } });
  expect(await screen.findByText('Sorry, we do not deliver to this pincode yet.')).toBeInTheDocument();
  expect(screen.getByText('Enter pincode to continue')).toBeDisabled();
});
