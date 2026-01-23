import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import { fileService } from '../services/fileService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  // Data states
  const [pendingPayments, setPendingPayments] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [jobSeekers, setJobSeekers] = useState([]);
  const [stats, setStats] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Review Modal State
  const [reviewItem, setReviewItem] = useState(null);
  const [reviewType, setReviewType] = useState(null); // 'job' or 'payment'
  const [adminNotes, setAdminNotes] = useState('');

  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Payment/Job states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [showJobRejectModal, setShowJobRejectModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingJob, setProcessingJob] = useState(null);
  const [processingUser, setProcessingUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveJob = async (jobId) => {
    setProcessing(true);
    try {
      await adminService.approveJob(jobId);
      setReviewItem(null);
      await loadData();
    } catch (err) {
      console.error("Approval error:", err);
      setError('Failed to approve job');
    } finally {
      setProcessing(false);
    }
  };

  const handleVerifyPayment = async (paymentId, status) => {
    setProcessing(true);
    try {
      await adminService.verifyPayment(paymentId, status, adminNotes);
      setReviewItem(null);
      setAdminNotes('');
      await loadData();
    } catch (err) {
      setError('Failed to process payment verification');
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleUser = async (userId, currentState) => {
    setProcessing(true);
    try {
      await adminService.updateUserStatus(userId, !currentState);
      await loadData();
    } catch (err) {
      setError('Failed to update user status');
    } finally {
      setProcessing(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const results = await Promise.allSettled([
        adminService.getPendingPayments(),
        adminService.getPendingJobs(),
        adminService.getUsersByRole('EMPLOYER'),
        adminService.getUsersByRole('JOB_SEEKER'),
        adminService.getStats(),
      ]);

      if (results[0].status === 'fulfilled') setPendingPayments(results[0].value || []);
      if (results[1].status === 'fulfilled') setPendingJobs(results[1].value || []);
      if (results[2].status === 'fulfilled') setEmployers(results[2].value || []);
      if (results[3].status === 'fulfilled') setJobSeekers(results[3].value || []);
      if (results[4].status === 'fulfilled') setStats(results[4].value);
    } catch (err) {
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) return <><Navbar /><LoadingSpinner /></>;

  return (
    <div className="admin-page">
      <Navbar />
      <div className="page-header-hazy">
        <div className="container animate-fade">
          <h1>Admin Suite</h1>
          <p className="page-subtitle">Overseeing the JobSpher ecosystem with care.</p>
        </div>
      </div>

      <div className="container dashboard-layout">
        <aside className="dashboard-sidebar animate-slide">
          <div className="card nav-card">
            <button
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              Payments <span>{pendingPayments.length}</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'jobs' ? 'active' : ''}`}
              onClick={() => setActiveTab('jobs')}
            >
              Jobs <span>{pendingJobs.length}</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'employers' ? 'active' : ''}`}
              onClick={() => setActiveTab('employers')}
            >
              Employers <span>{employers.length}</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'jobseekers' ? 'active' : ''}`}
              onClick={() => setActiveTab('jobseekers')}
            >
              Job Seekers <span>{jobSeekers.length}</span>
            </button>
          </div>
        </aside>

        <main className="dashboard-main animate-fade">
          {error && <ErrorMessage message={error} />}

          {activeTab === 'overview' && stats && (
            <section className="dashboard-section">
              <div className="section-header-compact">
                <h2>System Overview</h2>
                <button className="btn btn-outline btn-sm" onClick={loadData}>Refresh</button>
              </div>
              <div className="stats-grid">
                <div className="card stat-card">
                  <label>Total Users</label>
                  <h3>{stats.totalUsers}</h3>
                  <div className="stat-meta">
                    <span>{stats.totalEmployers} Employers</span>
                    <span>{stats.totalJobSeekers} Seekers</span>
                  </div>
                </div>
                <div className="card stat-card">
                  <label>Job Postings</label>
                  <h3>{stats.totalJobs}</h3>
                  <div className="stat-meta">
                    <span>{stats.activeJobs} Active</span>
                    <span>{stats.pendingJobs} Pending</span>
                  </div>
                </div>
                <div className="card stat-card">
                  <label>Applications</label>
                  <h3>{stats.totalApplications}</h3>
                </div>
                <div className="card stat-card">
                  <label>Companies</label>
                  <h3>{stats.totalCompanies}</h3>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'payments' && (
            <section className="dashboard-section">
              <div className="section-header-compact">
                <h2>Pending Payments</h2>
                <button className="btn btn-outline btn-sm" onClick={loadData}>Refresh</button>
              </div>

              <div className="card-list">
                {pendingPayments.length === 0 ? (
                  <div className="card empty-card"><p>No pending payments at this time.</p></div>
                ) : (
                  pendingPayments.map(payment => (
                    <div key={payment.id} className="card item-card-admin">
                      <div className="item-info">
                        <h3>Payment #{payment.id}</h3>
                        <p><strong>Employer:</strong> {payment.employer?.email}</p>
                        <p><strong>Ref:</strong> {payment.referenceNumber}</p>
                        <p><strong>Date:</strong> {formatDate(payment.uploadDate)}</p>
                      </div>
                      <div className="item-actions">
                        <button onClick={() => { setReviewItem(payment); setReviewType('payment'); }} className="btn btn-outline btn-sm">Review</button>
                        <button onClick={() => handleVerifyPayment(payment.id, 'VERIFIED')} disabled={processing} className="btn btn-primary btn-sm">Verify</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {activeTab === 'jobs' && (
            <section className="dashboard-section">
              <div className="section-header-compact">
                <h2>Pending Jobs</h2>
                <button className="btn btn-outline btn-sm" onClick={loadData}>Refresh</button>
              </div>
              <div className="card-list">
                {pendingJobs.length === 0 ? (
                  <div className="card empty-card"><p>No jobs pending approval.</p></div>
                ) : (
                  pendingJobs.map(job => (
                    <div key={job.id} className="card item-card-admin">
                      <div className="item-info">
                        <h3>{job.title}</h3>
                        <p><strong>Company:</strong> {job.company?.name}</p>
                        <p><strong>Category:</strong> {job.category}</p>
                      </div>
                      <div className="item-actions">
                        <button onClick={() => { setReviewItem(job); setReviewType('job'); }} className="btn btn-outline btn-sm">Review</button>
                        <button onClick={() => handleApproveJob(job.id)} disabled={processing} className="btn btn-primary btn-sm">Approve</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {activeTab === 'employers' && (
            <section className="dashboard-section">
              <h2>Employer Directory</h2>
              <div className="card user-table-card">
                <table className="user-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employers.map(user => (
                      <tr key={user.id}>
                        <td>{user.firstName} {user.lastName}</td>
                        <td>{user.email}</td>
                        <td><span className={`status-pill ${user.enabled ? 'active' : 'inactive'}`}>{user.enabled ? 'Active' : 'Inactive'}</span></td>
                        <td>
                          <button onClick={() => handleToggleUser(user.id, user.enabled)} disabled={processing} className="btn btn-outline btn-sm">
                            {user.enabled ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'jobseekers' && (
            <section className="dashboard-section">
              <h2>Job Seeker Directory</h2>
              <div className="card user-table-card">
                <table className="user-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobSeekers.map(user => (
                      <tr key={user.id}>
                        <td>{user.firstName} {user.lastName}</td>
                        <td>{user.email}</td>
                        <td><span className={`status-pill ${user.enabled ? 'active' : 'inactive'}`}>{user.enabled ? 'Active' : 'Inactive'}</span></td>
                        <td>
                          <button onClick={() => handleToggleUser(user.id, user.enabled)} disabled={processing} className="btn btn-outline btn-sm">
                            {user.enabled ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </main>
      </div>
      {/* Admin Review Modal */}
      {reviewItem && (
        <div className="modal-overlay" onClick={() => setReviewItem(null)}>
          <div className="modal-card card" onClick={e => e.stopPropagation()}>
            {reviewType === 'payment' ? (
              <>
                <h2>Payment Review</h2>
                <div className="app-details-view">
                  <div className="detail-row">
                    <label>Employer</label>
                    <p>{reviewItem.employer?.firstName} {reviewItem.employer?.lastName} ({reviewItem.employer?.email})</p>
                  </div>
                  <div className="detail-row">
                    <label>Reference</label>
                    <p>{reviewItem.referenceNumber}</p>
                  </div>
                  <div className="detail-row">
                    <label>Proof Document</label>
                    <a href={fileService.getDownloadUrl(reviewItem.filePath)} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">View Full Document</a>
                  </div>
                  <hr className="modal-divider" />
                  <div className="form-group">
                    <label>Admin Notes (for rejection)</label>
                    <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={3} placeholder="Provide missing info or rejection reason..." />
                  </div>
                  <div className="hero-btns">
                    <button onClick={() => handleVerifyPayment(reviewItem.id, 'VERIFIED')} className="btn btn-primary">Verify Payment</button>
                    <button onClick={() => handleVerifyPayment(reviewItem.id, 'REJECTED')} className="btn btn-outline">Reject</button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2>Job Review</h2>
                <div className="app-details-view">
                  <div className="detail-row">
                    <label>Job Title</label>
                    <p>{reviewItem.title}</p>
                  </div>
                  <div className="detail-row">
                    <label>Company</label>
                    <p>{reviewItem.company?.name}</p>
                  </div>
                  <div className="detail-row">
                    <label>Description</label>
                    <p className="rich-text">{reviewItem.description}</p>
                  </div>
                  <div className="detail-row">
                    <label>Payment Proof</label>
                    {reviewItem.paymentProofPath ? (
                      <a
                        href={fileService.getDownloadUrl(reviewItem.paymentProofPath)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline btn-sm"
                      >
                        View Payment Receipt
                      </a>
                    ) : (
                      <p className="text-muted">No payment proof uploaded.</p>
                    )}
                  </div>
                  <div className="detail-row">
                    <label>Requirements</label>
                    <p className="rich-text">{reviewItem.requirements || 'No specific requirements listed.'}</p>
                  </div>
                  <hr className="modal-divider" />
                  <div className="hero-btns">
                    <button onClick={() => handleApproveJob(reviewItem.id)} className="btn btn-primary">Approve Post</button>
                    <button onClick={() => setReviewItem(null)} className="btn btn-outline">Cancel</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
