# M.R. MILK Website

A modern, responsive website for M.R. MILK dairy products, built from Figma design.

## Features

- **Hero Section**: Beautiful sky background with animated clouds, milk splash, and product showcase
- **Product Grid**: Interactive product cards for ghee and dairy products with hover effects
- **Customer Testimonials**: Star-rated customer feedback section
- **Footer**: Brand information, delivery areas, social media links, and decorative cow silhouettes

## Technology Stack

- **React 18** - Modern React with hooks
- **CSS3** - Custom CSS with animations and responsive design
- **HTML5** - Semantic markup for accessibility

## Design Features

- **Responsive Design**: Mobile-first approach with breakpoints for tablet and desktop
- **Animations**: Smooth hover effects, floating clouds, and interactive elements
- **Accessibility**: Semantic HTML, ARIA labels, and keyboard navigation
- **Modern UI**: Clean design with proper spacing, typography, and color scheme

## Components

1. **HeroSection**: Sky background with clouds, milk splash, grassy field, and product showcase
2. **ProductGrid**: Two rows of product cards (ghee products and dairy products)
3. **Testimonials**: Customer feedback cards with star ratings
4. **Footer**: Brand information, government logos, social media, and cow silhouettes

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

```
src/
├── components/
│   ├── HeroSection.js
│   ├── HeroSection.css
│   ├── ProductGrid.js
│   ├── ProductGrid.css
│   ├── Testimonials.js
│   ├── Testimonials.css
│   ├── Footer.js
│   └── Footer.css
├── App.js
├── App.css
└── index.css
```

## Design Implementation

The website faithfully implements the Figma design with:
- Exact color schemes and typography
- Responsive layout that works on all devices
- Interactive elements with smooth animations
- Professional product showcase
- Customer testimonials with star ratings
- Complete branding and footer information

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)
## Ghee online ordering (cart + Razorpay)

The "Buy Ghee Online" section (`src/components/GheeShop.js`, below the product catalogue) sells the three ghee products online. The product catalogue is unchanged and still orders via WhatsApp.

- **Prices / sizes:** `src/data/gheeCatalog.json` (rupees). The browser and the payment API both read this file, so it is the only place to change prices. `deliveryCharge` is added to every order (0 = free).
- **API (Vercel serverless functions):** `api/create-order.js` recomputes the total from the catalog and creates a Razorpay order; `api/verify-payment.js` checks Razorpay's payment signature.
- **Orders:** every paid order appears in the Razorpay Dashboard → Transactions → Orders, with customer name, phone, address, pincode and items in the order's *Notes*.

### Setup
1. In Vercel → Project → Settings → Environment Variables add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` (see `.env.example`). Start with `rzp_test_...` keys, switch to live keys when ready, then redeploy.
2. In Razorpay → Account & Settings → Payment Capture, keep **automatic capture** on.
3. Local testing of payments needs the API, so run `npx vercel dev` (with keys in `.env.local`) instead of `npm start`.

## Customer accounts and 90-day order storage (Supabase)

- Customers can sign in from the Buy Ghee section or at checkout using an emailed code/link (no password). Their profile stores name, phone, address and pincode (pre-filled at checkout) and shows their paid orders.
- Every ghee order (guest or signed-in) is stored in the `orders` table. A daily database job deletes orders older than **90 days**. Profiles stay until the customer's account is deleted (Supabase → Authentication → Users; this also deletes the profile).
- If the Supabase variables are not set, the site still works: account links are hidden and orders are only recorded in Razorpay.

### Setup
1. Create a Supabase project (region: Mumbai).
2. Supabase → SQL Editor → run `supabase/schema.sql`.
3. Authentication → Sign In / Providers → keep **Email** enabled. Authentication → URL Configuration → set **Site URL** to the live site URL.
4. Authentication → Email Templates → **Magic Link**: add `{{ .Token }}` to the email so customers get a code as well as the link.
5. Add the four Supabase variables from `.env.example` in Vercel, then redeploy.
6. Supabase's built-in email sender is limited to a few emails per hour; before launch, set up custom SMTP (e.g. Resend) under Authentication → SMTP Settings.

## Shipping (Shiprocket)

- **Checkout:** once the customer enters a pincode, `api/shipping-quote.js` asks Shiprocket which couriers deliver there. The delivery charge is the rate of Shiprocket's recommended courier (else the cheapest), rounded up to the rupee. Unserviceable pincodes cannot pay. `api/create-order.js` re-quotes on the server, so the charged amount never comes from the browser.
- **After payment:** `api/verify-payment.js` creates a **prepaid order in Shiprocket** (order ID = Razorpay order ID). Assign a courier, schedule pickup and print the label in the Shiprocket panel. If the push fails, the payment still succeeds and the reason is saved in `orders.shiprocket_error` in Supabase for manual follow-up. Pushing orders requires Supabase to be configured.
- **Weights/boxes:** `weightKg` (packed) and `boxCm` [L, B, H] per size in `src/data/gheeCatalog.json`. Multiple jars are treated as stacked in one box. **The current values are estimates.**
- Checkout now requires email, city and state (Shiprocket needs them).

### Setup
1. Shiprocket → Settings → API → Configure → create an API user.
2. Add the four `SHIPROCKET_*` variables from `.env.example` in Vercel and redeploy.
3. Re-run `supabase/schema.sql` in Supabase (adds city/state and Shiprocket columns; safe to re-run).
4. Keep enough Shiprocket wallet balance for shipping charges.
