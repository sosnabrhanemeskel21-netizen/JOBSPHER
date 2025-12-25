/**
 * LoadingSpinner Component
 * 
 * A reusable loading spinner component for displaying loading states throughout the application.
 * Provides consistent loading UI across all pages.
 * 
 * @param {Object} props - Component props
 * @param {string} props.message - Optional message to display below spinner (default: "Loading...")
 * @param {string} props.size - Size of spinner: "small", "medium", "large" (default: "medium")
 * @returns {JSX.Element} Loading spinner component
 * 
 * @author JobSpher Team
 * @version 1.0
 */

import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ message = 'Loading...', size = 'medium' }) => {
  return (
    <div className={`loading-spinner-container ${size}`}>
      <div className="spinner"></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;

