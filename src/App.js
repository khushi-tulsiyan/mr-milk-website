import React from 'react';
import './App.css';
import HeroSection from './components/HeroSection';
import AboutUs from './components/AboutUs';
import ContactSection from './components/ContactSection';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';

function App() {
  return (
    <div className="App">
      <HeroSection />
      <AboutUs />
      <ContactSection />
      <Testimonials />
      <Footer />
    </div>
  );
}

export default App;