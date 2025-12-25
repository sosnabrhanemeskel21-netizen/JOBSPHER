import React from 'react';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <h2 className="logo">Josphere</h2>
        </div>
        <div className="navbar-right">
          <a href="/login" className="nav-link">Login</a>
          <a href="/register" className="nav-link signup-btn">Sign Up</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Josphere</h1>
          <p>Empowering your digital experience with seamless technology solutions.</p>
          <a href="#features" className="cta-button">Explore Features</a>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <h2>Why Josphere?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Fast & Reliable</h3>
            <p>Optimized for performance so you can focus on what matters most.</p>
          </div>
          <div className="feature-card">
            <h3>Secure & Trusted</h3>
            <p>We prioritize your data privacy and security above all else.</p>
          </div>
          <div className="feature-card">
            <h3>Intuitive Design</h3>
            <p>A clean, modern interface designed for efficiency and clarity.</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta">
        <h2>Get Started Today</h2>
        <p>Join thousands of users already enjoying Josphere’s cutting-edge features.</p>
        {/* <a href="/register" className="cta-button">Sign Up</a> */}
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Josphere. All rights reserved.</p>
        <div className="footer-links">
          {/* <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="/privacy">Privacy Policy</a> */}
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
