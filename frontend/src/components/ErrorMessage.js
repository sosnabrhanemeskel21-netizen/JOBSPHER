import React from 'react';
import './ErrorMessage.css';

const ErrorMessage = ({ message, dismissible = false, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="error-message-hazy animate-fade">
      <div className="error-content">
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
