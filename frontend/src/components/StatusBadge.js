/**
 * StatusBadge Component
 * 
 * A reusable status badge component for displaying status information with color coding.
 * Used for job status, application status, payment status, etc.
 * 
 * @param {Object} props - Component props
 * @param {string} props.status - Status value to display
 * @param {string} props.type - Type of status: "job", "application", "payment", "user" (default: "job")
 * @returns {JSX.Element} Status badge component
 * 
 * @author JobSpher Team
 * @version 1.0
 */

import React from 'react';
import './StatusBadge.css';

const StatusBadge = ({ status, type = 'job' }) => {
  if (!status) return null;

  // Normalize status to uppercase for consistent comparison
  const normalizedStatus = status.toUpperCase();

  // Get status configuration based on type
  const getStatusConfig = () => {
    if (type === 'job') {
      switch (normalizedStatus) {
        case 'PENDING_APPROVAL':
          return { label: 'Pending Approval', className: 'status-pending' };
        case 'ACTIVE':
          return { label: 'Active', className: 'status-active' };
        case 'REJECTED':
          return { label: 'Rejected', className: 'status-rejected' };
        case 'CLOSED':
          return { label: 'Closed', className: 'status-closed' };
        default:
          return { label: status, className: 'status-default' };
      }
    } else if (type === 'application') {
      switch (normalizedStatus) {
        case 'SUBMITTED':
          return { label: 'Submitted', className: 'status-pending' };
        case 'SHORTLISTED':
          return { label: 'Shortlisted', className: 'status-active' };
        case 'REJECTED':
          return { label: 'Rejected', className: 'status-rejected' };
        case 'HIRED':
          return { label: 'Hired', className: 'status-success' };
        default:
          return { label: status, className: 'status-default' };
      }
    } else if (type === 'payment') {
      switch (normalizedStatus) {
        case 'PENDING_REVIEW':
          return { label: 'Pending Review', className: 'status-pending' };
        case 'VERIFIED':
          return { label: 'Verified', className: 'status-success' };
        case 'REJECTED':
          return { label: 'Rejected', className: 'status-rejected' };
        default:
          return { label: status, className: 'status-default' };
      }
    } else if (type === 'user') {
      switch (normalizedStatus) {
        case 'ACTIVE':
          return { label: 'Active', className: 'status-success' };
        case 'INACTIVE':
          return { label: 'Inactive', className: 'status-rejected' };
        default:
          return { label: status, className: 'status-default' };
      }
    }
    return { label: status, className: 'status-default' };
  };

  const config = getStatusConfig();

  return (
    <span className={`status-badge ${config.className}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;

