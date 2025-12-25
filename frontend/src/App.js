/**
 * App.js - Main Application Component
 * 
 * This is the root component of the React application. It sets up:
 * - React Router for navigation
 * - Authentication context provider
 * - Application routing configuration
 * 
 * Route Structure:
 * - Public routes: /login, /register, /jobs, /jobs/:id
 * - Protected routes (role-based):
 *   - /employer (EMPLOYER role)
 *   - /admin (ADMIN role)
 *   - /my-applications (JOB_SEEKER role)
 * 
 * @author JobSpher Team
 * @version 1.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import JobList from './pages/JobList';
import JobDetails from './pages/JobDetails';
import EmployerDashboard from './pages/EmployerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LandingPage from './LandingPage';
import JobSeekerApplications from './pages/JobSeekerApplications';
import './App.css';

/**
 * AppRoutes Component
 * 
 * Defines all application routes. Uses authentication context to conditionally
 * render routes (e.g., redirect authenticated users away from login/register).
 * 
 * Note: Navbar is included in individual page components for better control
 * over layout and to allow pages to customize navbar behavior if needed.
 * 
 * @returns {JSX.Element} Routes configuration
 */
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      {/* Public Routes - Redirect to home if already authenticated */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
      
      {/* Public Job Browsing Routes */}
      <Route path="/jobs" element={<JobList />} />
      <Route path="/jobs/:id" element={<JobDetails />} />
      
      {/* Protected Routes - Role-based access control */}
      {/* Employer Dashboard - Only accessible to users with EMPLOYER role */}
      <Route
        path="/employer"
        element={
          <PrivateRoute allowedRoles={['EMPLOYER']}>
            <EmployerDashboard />
          </PrivateRoute>
        }
      />
      
      {/* Admin Dashboard - Only accessible to users with ADMIN role */}
      <Route
        path="/admin"
        element={
          <PrivateRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </PrivateRoute>
        }
      />
      
      {/* Job Seeker Applications - Only accessible to users with JOB_SEEKER role */}
      <Route
        path="/my-applications"
        element={
          <PrivateRoute allowedRoles={['JOB_SEEKER']}>
            <JobSeekerApplications />
          </PrivateRoute>
        }
      />
      
      {/* Default route - Redirect to jobs list */}
      <Route path="/" element={<Navigate to="/jobs" />} />
    </Routes>
  );
};

/**
 * Main App Component
 * 
 * Wraps the entire application with:
 * - AuthProvider: Provides authentication context to all child components
 * - Router: Enables client-side routing
 * 
 * @returns {JSX.Element} Root application component
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
