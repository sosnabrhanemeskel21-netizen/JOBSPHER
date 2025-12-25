/**
 * AdminDashboard Component
 * 
 * Main dashboard for administrators to manage the platform.
 * 
 * Features:
 * - View and verify/reject payment proofs
 * - Approve/reject job postings
 * - Manage employers (activate/deactivate accounts)
 * - Manage job seekers (activate/deactivate accounts)
 * - View user details and activity
 * 
 * @author JobSpher Team
 * @version 3.0
 */

import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import './AdminDashboard.css';

const AdminDashboard = () => {
  // Data states
  const [pendingPayments, setPendingPayments] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [jobSeekers, setJobSeekers] = useState([]);

  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('payments'); // payments, jobs, employers, jobseekers

  // Payment verification modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  // Job rejection modal
  const [showJobRejectModal, setShowJobRejectModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingJob, setProcessingJob] = useState(null);

  // User management
  const [processingUser, setProcessingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    // Check if user is authenticated before loading data
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!token) {
      setError('Please log in to access the admin dashboard.');
      setLoading(false);
      return;
    }

    if (user && user.role !== 'ADMIN') {
      setError('Access denied. Administrator privileges required.');
      setLoading(false);
      return;
    }

    loadData();
  }, []);

  /**
   * Load all data for admin review
   */
  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      // Load data with individual error handling for better debugging
      const results = await Promise.allSettled([
        adminService.getPendingPayments(),
        adminService.getPendingJobs(),
        adminService.getUsersByRole('EMPLOYER'),
        adminService.getUsersByRole('JOB_SEEKER'),
      ]);

      // Handle payments
      if (results[0].status === 'fulfilled') {
        const payments = results[0].value || [];
        console.log('Loaded pending payments:', payments);
        setPendingPayments(payments);
      } else {
        console.error('Error loading payments:', results[0].reason);
        const errorMsg = results[0].reason?.response?.data?.error ||
          results[0].reason?.response?.data?.message ||
          results[0].reason?.message;
        if (results[0].reason?.response?.status === 401 || results[0].reason?.response?.status === 403) {
          setError('Authentication required. Please log in as an administrator.');
        } else {
          setError(`Failed to load payments: ${errorMsg}`);
        }
        setPendingPayments([]);
      }

      // Handle jobs
      if (results[1].status === 'fulfilled') {
        const jobs = results[1].value || [];
        console.log('Loaded pending jobs:', jobs);
        setPendingJobs(jobs);
      } else {
        console.error('Error loading jobs:', results[1].reason);
        const errorMsg = results[1].reason?.response?.data?.error ||
          results[1].reason?.response?.data?.message ||
          results[1].reason?.message;
        if (results[1].reason?.response?.status === 401 || results[1].reason?.response?.status === 403) {
          // Error already handled in payments section
        } else if (!error) {
          setError(`Failed to load jobs: ${errorMsg}`);
        }
        setPendingJobs([]);
      }

      // Handle employers
      if (results[2].status === 'fulfilled') {
        setEmployers(results[2].value);
      } else {
        console.error('Error loading employers:', results[2].reason);
        setEmployers([]);
      }

      // Handle job seekers
      if (results[3].status === 'fulfilled') {
        setJobSeekers(results[3].value);
      } else {
        console.error('Error loading job seekers:', results[3].reason);
        setJobSeekers([]);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to load admin data';
      const status = err.response?.status;

      if (status === 401) {
        setError('Session expired. Please log in again.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (status === 403) {
        setError('Access denied. Administrator privileges required.');
      } else if (status === 400) {
        setError(`Bad request: ${errorMsg}. Please check your authentication and try again.`);
      } else {
        setError(`Error loading data: ${errorMsg}`);
      }
      console.error('Error loading data:', {
        message: err.message,
        status: status,
        data: err.response?.data,
        fullError: err
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * View payment proof document
   */
  const viewPaymentProof = (filePath) => {
    const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
    const fileUrl = `${apiBaseUrl}/files/download/${filePath.split('/').map(encodeURIComponent).join('/')}`;
    window.open(fileUrl, '_blank');
  };

  /**
   * Open payment verification modal
   */
  const openPaymentModal = (payment, status) => {
    setSelectedPayment(payment);
    setVerificationStatus(status);
    setVerificationNotes('');
    setShowPaymentModal(true);
  };

  /**
   * Close payment verification modal
   */
  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedPayment(null);
    setVerificationStatus('');
    setVerificationNotes('');
  };

  /**
   * Handle payment verification (verify or reject)
   */
  const handleVerifyPayment = async () => {
    if (verificationStatus === 'REJECTED' && !verificationNotes.trim()) {
      setError('Rejection reason is required');
      return;
    }

    if (!selectedPayment || !selectedPayment.id) {
      setError('Invalid payment selected');
      return;
    }

    setVerifyingPayment(true);
    setError('');
    try {
      const result = await adminService.verifyPayment(
        selectedPayment.id,
        verificationStatus,
        verificationNotes || ''
      );
      console.log('Payment verification successful:', result);
      closePaymentModal();
      // Reload data to refresh the list
      await loadData();
      // Show success message
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Payment verification error:', err);
      const errorMessage = err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        `Failed to ${verificationStatus.toLowerCase()} payment`;
      setError(errorMessage);
    } finally {
      setVerifyingPayment(false);
    }
  };

  /**
   * Open job rejection modal
   */
  const openJobRejectModal = (job) => {
    setSelectedJob(job);
    setRejectionReason('');
    setShowJobRejectModal(true);
  };

  /**
   * Close job rejection modal
   */
  const closeJobRejectModal = () => {
    setShowJobRejectModal(false);
    setSelectedJob(null);
    setRejectionReason('');
  };

  /**
   * Handle job approval
   */
  const handleApproveJob = async (jobId) => {
    if (!jobId) {
      setError('Invalid job selected');
      return;
    }

    if (!window.confirm('Are you sure you want to approve this job posting? It will become visible to job seekers.')) {
      return;
    }

    setProcessingJob(jobId);
    setError('');
    try {
      const result = await adminService.approveJob(jobId);
      console.log('Job approval successful:', result);
      // Reload data to refresh the list
      await loadData();
      // Clear any previous errors
      setError('');
    } catch (err) {
      console.error('Job approval error:', err);
      const errorMessage = err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to approve job';
      setError(errorMessage);
    } finally {
      setProcessingJob(null);
    }
  };

  /**
   * Handle job rejection
   */
  const handleRejectJob = async () => {
    if (!selectedJob || !selectedJob.id) {
      setError('Invalid job selected');
      return;
    }

    if (!rejectionReason.trim()) {
      setError('Rejection reason is required');
      return;
    }

    setProcessingJob(selectedJob.id);
    setError('');
    try {
      const result = await adminService.rejectJob(selectedJob.id, rejectionReason);
      console.log('Job rejection successful:', result);
      closeJobRejectModal();
      // Reload data to refresh the list
      await loadData();
      // Clear any previous errors
      setError('');
    } catch (err) {
      console.error('Job rejection error:', err);
      const errorMessage = err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to reject job';
      setError(errorMessage);
    } finally {
      setProcessingJob(null);
    }
  };

  /**
   * View user details
   */
  const viewUserDetails = async (userId) => {
    try {
      const user = await adminService.getUserById(userId);
      setSelectedUser(user);
      setShowUserModal(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load user details');
    }
  };

  /**
   * Handle user status update (activate/deactivate)
   */
  const handleUpdateUserStatus = async (userId, enabled) => {
    if (!window.confirm(`Are you sure you want to ${enabled ? 'activate' : 'deactivate'} this user?`)) {
      return;
    }

    setProcessingUser(userId);
    setError('');
    try {
      await adminService.updateUserStatus(userId, enabled);
      await loadData();
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, enabled });
      }
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${enabled ? 'activate' : 'deactivate'} user`);
    } finally {
      setProcessingUser(null);
    }
  };

  /**
   * Close user details modal
   */
  const closeUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <LoadingSpinner message="Loading admin dashboard..." />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="admin-dashboard">
        <h1>Admin Dashboard</h1>

        {error && <ErrorMessage message={error} dismissible onDismiss={() => setError('')} />}

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            Payments ({pendingPayments.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            Jobs ({pendingJobs.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'employers' ? 'active' : ''}`}
            onClick={() => setActiveTab('employers')}
          >
            Employers ({employers.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'jobseekers' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobseekers')}
          >
            Job Seekers ({jobSeekers.length})
          </button>
        </div>

        {/* Pending Payments Section */}
        {activeTab === 'payments' && (
          <div className="card">
            <div className="card-header">
              <div>
                <h2>Pending Payment Verifications</h2>
                <p className="card-subtitle">Review and verify payment proofs submitted by employers</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="badge-count">{pendingPayments.length}</span>
                <button
                  onClick={loadData}
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                  disabled={loading}
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>

            {pendingPayments.length === 0 ? (
              <div className="empty-state">
                <p>No pending payment verifications</p>
                <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
                  All payment proofs have been reviewed, or no payments have been submitted yet.
                </p>
                <button
                  onClick={loadData}
                  className="btn-secondary"
                  style={{ marginTop: '15px' }}
                  disabled={loading}
                >
                  Refresh List
                </button>
              </div>
            ) : (
              <div className="list-container">
                {pendingPayments.map((payment) => (
                  <div key={payment.id} className="item-card">
                    <div className="item-header">
                      <div>
                        <h3>Payment #{payment.id}</h3>
                        <p className="item-meta">
                          <strong>Employer:</strong> {payment.employer?.email || 'N/A'}
                        </p>
                        <p className="item-meta">
                          <strong>Reference Number:</strong> {payment.referenceNumber}
                        </p>
                        {payment.uploadDate && (
                          <p className="item-meta">
                            <strong>Uploaded:</strong> {formatDate(payment.uploadDate)}
                          </p>
                        )}
                        {payment.adminNotes && (
                          <p className="item-meta">
                            <strong>Admin Notes:</strong> {payment.adminNotes}
                          </p>
                        )}
                        {payment.verifiedDate && (
                          <p className="item-meta">
                            <strong>Verified Date:</strong> {formatDate(payment.verifiedDate)}
                          </p>
                        )}
                      </div>
                      <StatusBadge status={payment.status} type="payment" />
                    </div>

                    <div className="item-actions">
                      <button
                        onClick={() => viewPaymentProof(payment.filePath)}
                        className="btn-secondary"
                      >
                        View Payment Proof
                      </button>
                      <button
                        onClick={() => openPaymentModal(payment, 'VERIFIED')}
                        disabled={verifyingPayment}
                        className="btn-success"
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => openPaymentModal(payment, 'REJECTED')}
                        disabled={verifyingPayment}
                        className="btn-danger"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pending Jobs Section */}
        {activeTab === 'jobs' && (
          <div className="card">
            <div className="card-header">
              <div>
                <h2>Pending Job Approvals</h2>
                <p className="card-subtitle">Review and approve job postings submitted by employers</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="badge-count">{pendingJobs.length}</span>
                <button
                  onClick={loadData}
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                  disabled={loading}
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>

            {pendingJobs.length === 0 ? (
              <div className="empty-state">
                <p>No pending job approvals</p>
                <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
                  All job postings have been reviewed, or no jobs are pending approval.
                </p>
                <button
                  onClick={loadData}
                  className="btn-secondary"
                  style={{ marginTop: '15px' }}
                  disabled={loading}
                >
                  Refresh List
                </button>
              </div>
            ) : (
              <div className="list-container">
                {pendingJobs.map((job) => (
                  <div key={job.id} className="item-card">
                    <div className="item-header">
                      <div>
                        <h3>{job.title}</h3>
                        <p className="item-meta">
                          <strong>Company:</strong> {job.company?.name || 'N/A'}
                        </p>
                        <p className="item-meta">
                          <strong>Location:</strong> {job.location} • <strong>Category:</strong> {job.category}
                        </p>
                        {job.employmentType && (
                          <p className="item-meta">
                            <strong>Type:</strong> {job.employmentType}
                          </p>
                        )}
                        {job.minSalary && job.maxSalary && (
                          <p className="item-meta">
                            <strong>Salary:</strong> ${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()}
                          </p>
                        )}
                        {job.description && (
                          <div className="job-description-preview">
                            <p>{job.description.substring(0, 200)}...</p>
                          </div>
                        )}
                        {job.createdAt && (
                          <p className="item-meta">
                            <strong>Posted:</strong> {formatDate(job.createdAt)}
                          </p>
                        )}
                        {job.rejectionReason && (
                          <p className="item-meta" style={{ color: '#dc3545' }}>
                            <strong>Previous Rejection Reason:</strong> {job.rejectionReason}
                          </p>
                        )}
                      </div>
                      <StatusBadge status={job.status} type="job" />
                    </div>

                    <div className="item-actions">
                      <button
                        onClick={() => window.open(`/jobs/${job.id}`, '_blank')}
                        className="btn-secondary"
                      >
                        View Full Details
                      </button>
                      <button
                        onClick={() => handleApproveJob(job.id)}
                        disabled={processingJob === job.id}
                        className="btn-success"
                      >
                        {processingJob === job.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => openJobRejectModal(job)}
                        disabled={processingJob === job.id}
                        className="btn-danger"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Employers Section */}
        {activeTab === 'employers' && (
          <div className="card">
            <div className="card-header">
              <h2>Employer Management</h2>
              <span className="badge-count">{employers.length}</span>
            </div>

            {employers.length === 0 ? (
              <p className="empty-state">No employers found</p>
            ) : (
              <div className="list-container">
                {employers.map((employer) => (
                  <div key={employer.id} className="item-card">
                    <div className="item-header">
                      <div>
                        <h3>{employer.firstName} {employer.lastName}</h3>
                        <p className="item-meta">
                          <strong>Email:</strong> {employer.email}
                        </p>
                        {employer.phoneNumber && (
                          <p className="item-meta">
                            <strong>Phone:</strong> {employer.phoneNumber}
                          </p>
                        )}
                        {employer.address && (
                          <p className="item-meta">
                            <strong>Address:</strong> {employer.address}
                          </p>
                        )}
                        <p className="item-meta">
                          <strong>Account Created:</strong> {formatDate(employer.createdAt)}
                        </p>
                        <p className="item-meta">
                          <strong>Status:</strong> {employer.enabled ? (
                            <span className="status-active">Active</span>
                          ) : (
                            <span className="status-inactive">Inactive</span>
                          )}
                        </p>
                      </div>
                      <StatusBadge status={employer.enabled ? 'ACTIVE' : 'INACTIVE'} type="user" />
                    </div>

                    <div className="item-actions">
                      <button
                        onClick={() => viewUserDetails(employer.id)}
                        className="btn-secondary"
                      >
                        View Details
                      </button>
                      {employer.enabled ? (
                        <button
                          onClick={() => handleUpdateUserStatus(employer.id, false)}
                          disabled={processingUser === employer.id}
                          className="btn-warning"
                        >
                          {processingUser === employer.id ? 'Processing...' : 'Deactivate'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateUserStatus(employer.id, true)}
                          disabled={processingUser === employer.id}
                          className="btn-success"
                        >
                          {processingUser === employer.id ? 'Processing...' : 'Activate'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Job Seekers Section */}
        {activeTab === 'jobseekers' && (
          <div className="card">
            <div className="card-header">
              <h2>Job Seeker Management</h2>
              <span className="badge-count">{jobSeekers.length}</span>
            </div>

            {jobSeekers.length === 0 ? (
              <p className="empty-state">No job seekers found</p>
            ) : (
              <div className="list-container">
                {jobSeekers.map((jobSeeker) => (
                  <div key={jobSeeker.id} className="item-card">
                    <div className="item-header">
                      <div>
                        <h3>{jobSeeker.firstName} {jobSeeker.lastName}</h3>
                        <p className="item-meta">
                          <strong>Email:</strong> {jobSeeker.email}
                        </p>
                        {jobSeeker.phoneNumber && (
                          <p className="item-meta">
                            <strong>Phone:</strong> {jobSeeker.phoneNumber}
                          </p>
                        )}
                        {jobSeeker.address && (
                          <p className="item-meta">
                            <strong>Address:</strong> {jobSeeker.address}
                          </p>
                        )}
                        {jobSeeker.resumePath && (
                          <p className="item-meta">
                            <strong>Resume:</strong> Uploaded
                          </p>
                        )}
                        <p className="item-meta">
                          <strong>Account Created:</strong> {formatDate(jobSeeker.createdAt)}
                        </p>
                        <p className="item-meta">
                          <strong>Status:</strong> {jobSeeker.enabled ? (
                            <span className="status-active">Active</span>
                          ) : (
                            <span className="status-inactive">Inactive</span>
                          )}
                        </p>
                      </div>
                      <StatusBadge status={jobSeeker.enabled ? 'ACTIVE' : 'INACTIVE'} type="user" />
                    </div>

                    <div className="item-actions">
                      <button
                        onClick={() => viewUserDetails(jobSeeker.id)}
                        className="btn-secondary"
                      >
                        View Details
                      </button>
                      {jobSeeker.enabled ? (
                        <button
                          onClick={() => handleUpdateUserStatus(jobSeeker.id, false)}
                          disabled={processingUser === jobSeeker.id}
                          className="btn-warning"
                        >
                          {processingUser === jobSeeker.id ? 'Processing...' : 'Deactivate'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateUserStatus(jobSeeker.id, true)}
                          disabled={processingUser === jobSeeker.id}
                          className="btn-success"
                        >
                          {processingUser === jobSeeker.id ? 'Processing...' : 'Activate'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Payment Verification Modal */}
        {showPaymentModal && selectedPayment && (
          <div className="modal-overlay" onClick={closePaymentModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  {verificationStatus === 'VERIFIED' ? 'Verify Payment' : 'Reject Payment'}
                </h3>
                <button className="modal-close" onClick={closePaymentModal}>×</button>
              </div>
              <div className="modal-body">
                <div style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '6px' }}>
                  <p><strong>Payment ID:</strong> #{selectedPayment.id}</p>
                  <p><strong>Employer Email:</strong> {selectedPayment.employer?.email || 'N/A'}</p>
                  <p><strong>Reference Number:</strong> {selectedPayment.referenceNumber || 'N/A'}</p>
                  {selectedPayment.uploadDate && (
                    <p><strong>Uploaded:</strong> {formatDate(selectedPayment.uploadDate)}</p>
                  )}
                  {selectedPayment.status && (
                    <p><strong>Current Status:</strong> <StatusBadge status={selectedPayment.status} type="payment" /></p>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    {verificationStatus === 'VERIFIED' ? 'Verification Notes (Optional):' : 'Rejection Reason (Required):'}
                  </label>
                  <textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder={verificationStatus === 'VERIFIED'
                      ? 'Add any notes about this verification...'
                      : 'Enter the reason for rejection...'}
                    rows={4}
                    required={verificationStatus === 'REJECTED'}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={closePaymentModal}>
                  Cancel
                </button>
                <button
                  className={verificationStatus === 'VERIFIED' ? 'btn-success' : 'btn-danger'}
                  onClick={handleVerifyPayment}
                  disabled={verifyingPayment || (verificationStatus === 'REJECTED' && !verificationNotes.trim())}
                >
                  {verifyingPayment ? 'Processing...' : verificationStatus === 'VERIFIED' ? 'Verify' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Job Rejection Modal */}
        {showJobRejectModal && selectedJob && (
          <div className="modal-overlay" onClick={closeJobRejectModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Reject Job Posting</h3>
                <button className="modal-close" onClick={closeJobRejectModal}>×</button>
              </div>
              <div className="modal-body">
                <div style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '6px' }}>
                  <p><strong>Job ID:</strong> #{selectedJob.id}</p>
                  <p><strong>Job Title:</strong> {selectedJob.title}</p>
                  <p><strong>Company:</strong> {selectedJob.company?.name || 'N/A'}</p>
                  <p><strong>Location:</strong> {selectedJob.location || 'N/A'}</p>
                  <p><strong>Category:</strong> {selectedJob.category || 'N/A'}</p>
                  {selectedJob.createdAt && (
                    <p><strong>Created:</strong> {formatDate(selectedJob.createdAt)}</p>
                  )}
                  {selectedJob.status && (
                    <p><strong>Status:</strong> <StatusBadge status={selectedJob.status} type="job" /></p>
                  )}
                </div>

                <div className="form-group">
                  <label>Rejection Reason (Required):</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter the reason for rejecting this job posting..."
                    rows={4}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={closeJobRejectModal}>
                  Cancel
                </button>
                <button
                  className="btn-danger"
                  onClick={handleRejectJob}
                  disabled={processingJob === selectedJob.id || !rejectionReason.trim()}
                >
                  {processingJob === selectedJob.id ? 'Processing...' : 'Reject Job'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {showUserModal && selectedUser && (
          <div className="modal-overlay" onClick={closeUserModal}>
            <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>User Details</h3>
                <button className="modal-close" onClick={closeUserModal}>×</button>
              </div>
              <div className="modal-body">
                <div className="user-details">
                  <div className="detail-row">
                    <strong>Name:</strong>
                    <span>{selectedUser.firstName} {selectedUser.lastName}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Email:</strong>
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Role:</strong>
                    <span>{selectedUser.role}</span>
                  </div>
                  {selectedUser.phoneNumber && (
                    <div className="detail-row">
                      <strong>Phone:</strong>
                      <span>{selectedUser.phoneNumber}</span>
                    </div>
                  )}
                  {selectedUser.address && (
                    <div className="detail-row">
                      <strong>Address:</strong>
                      <span>{selectedUser.address}</span>
                    </div>
                  )}
                  {selectedUser.resumePath && (
                    <div className="detail-row">
                      <strong>Resume:</strong>
                      <span>Uploaded</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <strong>Account Created:</strong>
                    <span>{formatDate(selectedUser.createdAt)}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Last Updated:</strong>
                    <span>{formatDate(selectedUser.updatedAt)}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Status:</strong>
                    <span>
                      {selectedUser.enabled ? (
                        <span className="status-active">Active</span>
                      ) : (
                        <span className="status-inactive">Inactive</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={closeUserModal}>
                  Close
                </button>
                {selectedUser.enabled ? (
                  <button
                    className="btn-warning"
                    onClick={() => handleUpdateUserStatus(selectedUser.id, false)}
                    disabled={processingUser === selectedUser.id}
                  >
                    {processingUser === selectedUser.id ? 'Processing...' : 'Deactivate Account'}
                  </button>
                ) : (
                  <button
                    className="btn-success"
                    onClick={() => handleUpdateUserStatus(selectedUser.id, true)}
                    disabled={processingUser === selectedUser.id}
                  >
                    {processingUser === selectedUser.id ? 'Processing...' : 'Activate Account'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
