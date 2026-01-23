/**
 * PrivateRoute Component
 * 
 * A route protection component that restricts access to routes based on authentication
 * and user roles. Used to protect routes that require authentication and/or specific roles.
 * 
 * Behavior:
 * 1. Shows loading state while checking authentication
 * 2. Redirects to /login if user is not authenticated
 * 3. Redirects to home (/) if user doesn't have required role
 * 4. Renders children if user is authenticated and has required role (if specified)
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if access is granted
 * @param {string[]} props.allowedRoles - Array of allowed roles (empty array = any authenticated user)
 * @returns {JSX.Element} Protected route component or redirect
 * 
 * @author JobSpher Team
 * @version 1.0
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return <LoadingSpinner message="Authenticating..." />;
  }

  // If user is not authenticated, redirect to login page
  // Save the current location they were trying to access
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified and user doesn't have required role, redirect to home
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has required role (if specified), render children
  return children;
};

export default PrivateRoute;

