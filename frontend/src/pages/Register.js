import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Register.css';
import './Login.css'; // Reusing common auth styles

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'JOB_SEEKER',
    phoneNumber: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(formData.firstName) || !nameRegex.test(formData.lastName)) {
      setError('Names must contain only letters.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    const phoneRegex = /^\+?[\d\s-]{10,15}$/;
    if (!formData.phoneNumber || !phoneRegex.test(formData.phoneNumber)) {
      setError('Please enter a valid phone number (10-15 digits).');
      return;
    }

    setLoading(true);

    try {
      const user = await register(formData);
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'EMPLOYER') {
        navigate('/employer');
      } else {
        navigate('/jobs');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page hazy-bg" style={{ backgroundImage: `url('/images/auth_bg.png')` }}>
      <div className="hazy-content container flex-center">
        <div className="auth-card register-card animate-slide">
          <div className="auth-header">
            <Link to="/" className="auth-logo">JobSpher</Link>
            <h2>Join Our Community</h2>
            <p className="auth-subtitle">Start your journey with us today</p>
          </div>

          {error && <div className="error-badge">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="John"
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="name@example.com"
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                placeholder="+1 234 567 890"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="••••••••"
                />
              </div>
              <div className="form-group">
                <label>I am a</label>
                <select name="role" value={formData.role} onChange={handleChange} required>
                  <option value="JOB_SEEKER">Job Seeker</option>
                  <option value="EMPLOYER">Employer</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary auth-btn">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Sign In</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
