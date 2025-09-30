import React from 'react';
import './App.css';
import HeroSection from './components/HeroSection';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';

function App() {
  return (
    <div className="App">
      <HeroSection />
      <Testimonials />
      <Footer />
    </div>
  );
}

export default App;