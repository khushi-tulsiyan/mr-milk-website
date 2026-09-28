import React from 'react';
import './App.css';
import HeroSection from './components/HeroSection';
import AboutUs from './components/AboutUs';
import ContactSection from './components/ContactSection';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import GheeShop from './components/GheeShop';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import AccountPanel from './components/AccountPanel';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="App">
          <HeroSection />
          <GheeShop />
          <AboutUs />
          <ContactSection />
          <Testimonials />
          <Footer />
        </div>
        <CartDrawer />
        <AccountPanel />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
