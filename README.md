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
