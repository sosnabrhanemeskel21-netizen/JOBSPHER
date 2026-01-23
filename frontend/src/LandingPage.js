import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import './LandingPage.css';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <Navbar transparent />

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-glow"></div>
        <div className="container hero-content">
          <div className="hero-text-area animate-reveal">
            <h1 className="hero-title">
              Your Next Chapter <br />
              <span className="accent-gradient">Starts Here</span>
            </h1>
            <p className="hero-subtitle">
              A premium space connecting you with forward-thinking companies.
              Find roles that match your passion, expertise, and ambition.
            </p>
            <div className="hero-actions">
              <button onClick={() => navigate('/jobs')} className="btn btn-primary btn-lg">Explore Jobs</button>
              <button onClick={() => navigate('/register')} className="btn btn-outline btn-lg">Post a Job</button>
            </div>
          </div>
        </div>
      </header>

      {/* Dual Path Section */}
      <section className="path-section container">
        <div className="path-grid">
          <div className="path-text animate-reveal">
            <h2>For the <span className="accent-gradient">Ambitious</span></h2>
            <p>We prioritize transparency and direct connections so you can focus on what matters—your career.</p>
            <ul className="path-list">
              <li>Direct employer contact</li>
              <li>Verified opportunities</li>
              <li>Transparent salary data</li>
            </ul>
            <Link to="/register?role=JOB_SEEKER" className="btn btn-outline">Start Your Path</Link>
          </div>
          <div className="path-image animate-reveal">
            <div className="aesthetic-box"></div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="final-cta">
        <div className="container">
          <div className="cta-wrapper glass-card animate-reveal">
            <h2>Your Future Awaits</h2>
            <p>Join a community of professionals moving the world forward.</p>
            <button onClick={() => navigate('/register')} className="btn btn-primary">Join JobSpher Today</button>
          </div>
        </div>
      </section>

      <footer className="footer shadow-top">
        <div className="container footer-content">
          <div className="footer-logo">JobSpher</div>
          <div className="footer-links">
            <Link to="/jobs">Jobs</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
          <p className="copyright">© 2026 JobSpher. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
