import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';
import './Navbar.css';

const Navbar = ({ transparent }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to fetch unread count');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={`main-navbar ${transparent && !scrolled ? 'is-transparent' : ''} ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container navbar-inner animate-fade">
        <Link to="/" className="navbar-logo">
          Job<span className="accent-gradient">Spher</span>
        </Link>
        <div className="navbar-links">
          {user ? (
            <>
              {user.role === 'JOB_SEEKER' && (
                <>
                  <Link to="/jobs" className="navbar-link">Browse Jobs</Link>
                  <Link to="/my-applications" className="navbar-link">My Applications</Link>
                </>
              )}
              {user.role === 'EMPLOYER' && (
                <Link to="/employer" className="navbar-link">Employer Hub</Link>
              )}
              {user.role === 'ADMIN' && (
                <Link to="/admin" className="navbar-link">Admin Suite</Link>
              )}
              <div className="navbar-user-section">
                <Link to="/notifications" className="notif-link">
                  <span className="notif-icon">🔔</span>
                  {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                </Link>
                <div className="user-profile-nav">
                  <Link to="/profile" className="navbar-user-name">Hello, {user.firstName}</Link>
                  <button onClick={handleLogout} className="btn-logout-icon" title="Logout">
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="navbar-link">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Join Today</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
