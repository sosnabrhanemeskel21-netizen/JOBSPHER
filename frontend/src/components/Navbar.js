import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/jobs" className="navbar-logo">
          Jobspher
        </Link>
        <div className="navbar-menu">
          {user ? (
            <>
              {user.role === 'JOB_SEEKER' && (
                <>
                  <Link to="/jobs">Browse Jobs</Link>
                  <Link to="/my-applications">My Applications</Link>
                </>
              )}
              {user.role === 'EMPLOYER' && (
                <Link to="/employer">Dashboard</Link>
              )}
              {user.role === 'ADMIN' && (
                <Link to="/admin">Admin Dashboard</Link>
              )}
              <span className="navbar-user">{user.firstName} {user.lastName}</span>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

