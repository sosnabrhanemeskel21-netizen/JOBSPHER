/**
 * AuthContext - Authentication Context Provider
 * 
 * Provides authentication state and methods throughout the application.
 * Manages user authentication, token storage, and user session.
 * 
 * Features:
 * - User state management
 * - Token persistence in localStorage
 * - Login/register/logout functionality
 * - Loading state during authentication check
 * 
 * @author JobSpher Team
 * @version 1.0
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

// Create the authentication context
const AuthContext = createContext();

/**
 * Custom hook to access authentication context
 * 
 * Must be used within an AuthProvider component.
 * Throws an error if used outside of AuthProvider.
 * 
 * @returns {Object} Authentication context value containing user, login, register, logout, etc.
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * AuthProvider Component
 * 
 * Provides authentication context to all child components.
 * Manages user state, token storage, and authentication operations.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} AuthContext provider component
 */
export const AuthProvider = ({ children }) => {
  // Current authenticated user (null if not authenticated)
  const [user, setUser] = useState(null);
  
  // Loading state during initial authentication check
  const [loading, setLoading] = useState(true);

  /**
   * Effect hook to restore user session on component mount
   * 
   * Checks localStorage for saved token and user data.
   * If found, restores the user session.
   */
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    // If token and user data exist, restore the session
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing user data', e);
        // If parsing fails, clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    // Mark loading as complete
    setLoading(false);
  }, []);

  /**
   * Login function
   * 
   * Authenticates a user with email and password, stores the JWT token
   * and user data in localStorage, and updates the user state.
   * 
   * @param {string} email - User email address
   * @param {string} password - User password
   * @returns {Promise<Object>} Response object containing token and user data
   * @throws {Error} If authentication fails
   */
  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      
      // Store token and user data in localStorage for persistence
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response));
      
      // Update user state
      setUser(response);
      return response;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Register function
   * 
   * Registers a new user, stores the JWT token and user data in localStorage,
   * and updates the user state. Automatically logs in the user after registration.
   * 
   * @param {Object} userData - Registration data (email, password, firstName, lastName, role, etc.)
   * @returns {Promise<Object>} Response object containing token and user data
   * @throws {Error} If registration fails
   */
  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      
      // Store token and user data in localStorage for persistence
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response));
      
      // Update user state
      setUser(response);
      return response;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Logout function
   * 
   * Clears the user session by removing token and user data from localStorage
   * and resetting the user state to null.
   */
  const logout = () => {
    authService.logout(); // Clear localStorage
    setUser(null); // Clear user state
  };

  // Context value to be provided to consumers
  const value = {
    user,                    // Current user object (null if not authenticated)
    login,                   // Login function
    register,                // Register function
    logout,                  // Logout function
    loading,                 // Loading state during authentication check
    isAuthenticated: !!user, // Boolean indicating if user is authenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

