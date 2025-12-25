/**
 * ErrorMessage Component
 * 
 * A reusable error message component for displaying error states throughout the application.
 * Provides consistent error UI with optional dismiss functionality.
 * 
 * @param {Object} props - Component props
 * @param {string} props.message - Error message to display
 * @param {boolean} props.dismissible - Whether the error can be dismissed (default: false)
 * @param {Function} props.onDismiss - Callback function when error is dismissed
 * @returns {JSX.Element} Error message component
 * 
 * @author JobSpher Team
 * @version 1.0
 */

import React from 'react';
import './ErrorMessage.css';

const ErrorMessage = ({ message, dismissible = false, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="error-message-container">
      <div className="error-content">
        <span className="error-icon">⚠️</span>
        <span className="error-text">{message}</span>
      </div>
      {dismissible && onDismiss && (
        <button className="error-dismiss" onClick={onDismiss} aria-label="Dismiss error">
          ×
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;

