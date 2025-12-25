/**
 * EmployerDashboard Component
 * 
 * Main dashboard for employers to manage their company, payment verification,
 * job postings, and applications.
 * 
 * Features:
 * - Company profile creation/editing
 * - Payment proof upload (required before posting jobs)
 * - Job creation (only if payment is verified)
 * - Job listing with status
 * - Application management for each job
 * 
 * Workflow:
 * 1. Employer must create company profile
 * 2. Employer must upload payment proof
 * 3. Admin verifies payment
 * 4. Once verified, employer can post jobs
 * 5. Jobs require admin approval before becoming active
 * 6. Employers can manage applications for their jobs
 * 
 * @author JobSpher Team
 * @version 2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { companyService } from '../services/companyService';
import { paymentService } from '../services/paymentService';
import { jobService } from '../services/jobService';
import { applicationService } from '../services/applicationService';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import './EmployerDashboard.css';

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState({}); // jobId -> applications array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form states
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null); // For viewing applications
  
  // Company form data
  const [companyFormData, setCompanyFormData] = useState({
    name: '',
    description: '',
    industry: '',
    website: '',
    address: '',
    phoneNumber: '',
  });
  
  // Payment form data
  const [paymentFile, setPaymentFile] = useState(null);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [uploadingPayment, setUploadingPayment] = useState(false);
  
  // Job form data
  const [jobFormData, setJobFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    employmentType: '',
    minSalary: '',
    maxSalary: '',
    requirements: '',
    responsibilities: '',
  });
  const [creatingJob, setCreatingJob] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  /**
   * Load all dashboard data: company, payment status, jobs
   */
  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [companyData, paymentData, jobsData] = await Promise.all([
        companyService.getMyCompany().catch(() => null),
        paymentService.getPaymentStatus().catch(() => null),
        jobService.getMyJobs().catch(() => []),
      ]);
      setCompany(companyData);
      setPaymentStatus(paymentData);
      setJobs(jobsData);
      
      // If company exists, populate form for editing
      if (companyData) {
        setCompanyFormData({
          name: companyData.name || '',
          description: companyData.description || '',
          industry: companyData.industry || '',
          website: companyData.website || '',
          address: companyData.address || '',
          phoneNumber: companyData.phoneNumber || '',
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle company profile creation/update
   */
  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = company
        ? await companyService.updateCompany(companyFormData)
        : await companyService.createCompany(companyFormData);
      setCompany(data);
      setShowCompanyForm(false);
      // Reload to get updated payment status
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save company information');
    }
  };

  /**
   * Handle payment proof upload
   * Required before employer can post jobs
   */
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentFile) {
      setError('Please select a payment proof file');
      return;
    }
    if (!referenceNumber.trim()) {
      setError('Please enter a payment reference number');
      return;
    }
    
    setUploadingPayment(true);
    setError('');
    try {
      await paymentService.uploadPayment(paymentFile, referenceNumber);
      setShowPaymentForm(false);
      setPaymentFile(null);
      setReferenceNumber('');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload payment proof');
    } finally {
      setUploadingPayment(false);
    }
  };

  /**
   * Handle job creation
   * Only allowed if payment is verified
   */
  const handleJobSubmit = async (e) => {
    e.preventDefault();
    if (!company?.paymentVerified) {
      setError('Payment must be verified before posting jobs');
      return;
    }
    
    setCreatingJob(true);
    setError('');
    try {
      // Convert salary strings to numbers if provided
      const jobData = {
        ...jobFormData,
        minSalary: jobFormData.minSalary ? parseFloat(jobFormData.minSalary) : null,
        maxSalary: jobFormData.maxSalary ? parseFloat(jobFormData.maxSalary) : null,
      };
      
      await jobService.createJob(jobData);
      setShowJobForm(false);
      // Reset form
      setJobFormData({
        title: '',
        description: '',
        category: '',
        location: '',
        employmentType: '',
        minSalary: '',
        maxSalary: '',
        requirements: '',
        responsibilities: '',
      });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create job');
    } finally {
      setCreatingJob(false);
    }
  };

  /**
   * Load applications for a specific job
   */
  const loadApplications = async (jobId) => {
    if (applications[jobId]) {
      // Already loaded, just toggle view
      setSelectedJobId(selectedJobId === jobId ? null : jobId);
      return;
    }
    
    try {
      const apps = await applicationService.getApplicationsByJob(jobId);
      setApplications({ ...applications, [jobId]: apps });
      setSelectedJobId(jobId);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load applications');
    }
  };

  /**
   * Update application status (shortlist, reject, hire)
   */
  const handleUpdateApplicationStatus = async (applicationId, status, notes = '') => {
    try {
      await applicationService.updateApplicationStatus(applicationId, status, notes);
      // Reload applications for the selected job
      if (selectedJobId) {
        const apps = await applicationService.getApplicationsByJob(selectedJobId);
        setApplications({ ...applications, [selectedJobId]: apps });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update application status');
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <LoadingSpinner message="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="employer-dashboard">
        <h1>Employer Dashboard</h1>
        
        {error && <ErrorMessage message={error} dismissible onDismiss={() => setError('')} />}

        {/* Company Profile Section */}
        {!company ? (
          <div className="card">
            <h2>Create Your Company Profile</h2>
            <p className="info-text">You must create a company profile before you can post jobs.</p>
            {!showCompanyForm ? (
              <button onClick={() => setShowCompanyForm(true)} className="btn-primary">
                Create Company Profile
              </button>
            ) : (
              <form onSubmit={handleCompanySubmit}>
                <div className="form-group">
                  <label>Company Name *</label>
                  <input
                    type="text"
                    value={companyFormData.name}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, name: e.target.value })}
                    required
                    placeholder="Enter company name"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={companyFormData.description}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, description: e.target.value })}
                    rows={4}
                    placeholder="Describe your company"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Industry</label>
                    <input
                      type="text"
                      value={companyFormData.industry}
                      onChange={(e) => setCompanyFormData({ ...companyFormData, industry: e.target.value })}
                      placeholder="e.g., Technology, Healthcare"
                    />
                  </div>
                  <div className="form-group">
                    <label>Website</label>
                    <input
                      type="url"
                      value={companyFormData.website}
                      onChange={(e) => setCompanyFormData({ ...companyFormData, website: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Address *</label>
                  <input
                    type="text"
                    value={companyFormData.address}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, address: e.target.value })}
                    required
                    placeholder="Company address"
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={companyFormData.phoneNumber}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, phoneNumber: e.target.value })}
                    placeholder="+1234567890"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">Save Company</button>
                  <button type="button" onClick={() => setShowCompanyForm(false)} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <>
            {/* Company Information Card */}
            <div className="card">
              <div className="card-header">
                <h2>Company Information</h2>
                <button onClick={() => setShowCompanyForm(true)} className="btn-secondary">
                  Edit
                </button>
              </div>
              <div className="company-info">
                <p><strong>Name:</strong> {company.name}</p>
                {company.industry && <p><strong>Industry:</strong> {company.industry}</p>}
                {company.website && <p><strong>Website:</strong> <a href={company.website} target="_blank" rel="noopener noreferrer">{company.website}</a></p>}
                <p><strong>Payment Verified:</strong> 
                  {company.paymentVerified ? (
                    <span className="verified-badge">✓ Verified</span>
                  ) : (
                    <span className="not-verified-badge">✗ Not Verified</span>
                  )}
                </p>
              </div>
              
              {showCompanyForm && (
                <form onSubmit={handleCompanySubmit} className="edit-form">
                  <div className="form-group">
                    <label>Company Name *</label>
                    <input
                      type="text"
                      value={companyFormData.name}
                      onChange={(e) => setCompanyFormData({ ...companyFormData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={companyFormData.description}
                      onChange={(e) => setCompanyFormData({ ...companyFormData, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Industry</label>
                      <input
                        type="text"
                        value={companyFormData.industry}
                        onChange={(e) => setCompanyFormData({ ...companyFormData, industry: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Website</label>
                      <input
                        type="url"
                        value={companyFormData.website}
                        onChange={(e) => setCompanyFormData({ ...companyFormData, website: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Address *</label>
                    <input
                      type="text"
                      value={companyFormData.address}
                      onChange={(e) => setCompanyFormData({ ...companyFormData, address: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={companyFormData.phoneNumber}
                      onChange={(e) => setCompanyFormData({ ...companyFormData, phoneNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-primary">Update</button>
                    <button type="button" onClick={() => setShowCompanyForm(false)} className="btn-secondary">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Payment Verification Section */}
            {!company.paymentVerified && (
              <div className="card payment-card">
                <h2>Payment Verification Required</h2>
                <p className="info-text">
                  You must upload payment proof and wait for admin verification before you can post jobs.
                </p>
                
                {paymentStatus && (
                  <div className="payment-status">
                    <p><strong>Current Status:</strong> <StatusBadge status={paymentStatus.status} type="payment" /></p>
                    {paymentStatus.adminNotes && (
                      <p className="admin-notes"><strong>Admin Notes:</strong> {paymentStatus.adminNotes}</p>
                    )}
                    {paymentStatus.uploadDate && (
                      <p><strong>Uploaded:</strong> {new Date(paymentStatus.uploadDate).toLocaleDateString()}</p>
                    )}
                  </div>
                )}
                
                {showPaymentForm ? (
                  <form onSubmit={handlePaymentSubmit}>
                    <div className="form-group">
                      <label>Payment Proof (Image or PDF) *</label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setPaymentFile(e.target.files[0])}
                        required
                      />
                      <small>Accepted formats: JPG, PNG, PDF (Max 10MB)</small>
                    </div>
                    <div className="form-group">
                      <label>Reference Number *</label>
                      <input
                        type="text"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        required
                        placeholder="Enter payment reference number"
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" disabled={uploadingPayment} className="btn-primary">
                        {uploadingPayment ? 'Uploading...' : 'Upload Payment Proof'}
                      </button>
                      <button type="button" onClick={() => setShowPaymentForm(false)} className="btn-secondary">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button onClick={() => setShowPaymentForm(true)} className="btn-primary">
                    {paymentStatus ? 'Upload New Payment Proof' : 'Upload Payment Proof'}
                  </button>
                )}
              </div>
            )}

            {/* Job Management Section - Only if payment verified */}
            {company.paymentVerified && (
              <div className="card">
                <div className="card-header">
                  <h2>My Jobs ({jobs.length})</h2>
                  <button onClick={() => setShowJobForm(true)} className="btn-primary">
                    + Post New Job
                  </button>
                </div>

                {showJobForm && (
                  <form onSubmit={handleJobSubmit} className="job-form">
                    <h3>Create New Job Posting</h3>
                    <div className="form-group">
                      <label>Job Title *</label>
                      <input
                        type="text"
                        value={jobFormData.title}
                        onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
                        required
                        placeholder="e.g., Senior Software Engineer"
                      />
                    </div>
                    <div className="form-group">
                      <label>Description *</label>
                      <textarea
                        value={jobFormData.description}
                        onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })}
                        required
                        rows={5}
                        placeholder="Describe the job position"
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Category *</label>
                        <input
                          type="text"
                          value={jobFormData.category}
                          onChange={(e) => setJobFormData({ ...jobFormData, category: e.target.value })}
                          required
                          placeholder="e.g., Technology, Healthcare"
                        />
                      </div>
                      <div className="form-group">
                        <label>Location *</label>
                        <input
                          type="text"
                          value={jobFormData.location}
                          onChange={(e) => setJobFormData({ ...jobFormData, location: e.target.value })}
                          required
                          placeholder="e.g., New York, NY"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Employment Type</label>
                        <select
                          value={jobFormData.employmentType}
                          onChange={(e) => setJobFormData({ ...jobFormData, employmentType: e.target.value })}
                        >
                          <option value="">Select type</option>
                          <option value="FULL_TIME">Full Time</option>
                          <option value="PART_TIME">Part Time</option>
                          <option value="CONTRACT">Contract</option>
                          <option value="INTERNSHIP">Internship</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Min Salary</label>
                        <input
                          type="number"
                          value={jobFormData.minSalary}
                          onChange={(e) => setJobFormData({ ...jobFormData, minSalary: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div className="form-group">
                        <label>Max Salary</label>
                        <input
                          type="number"
                          value={jobFormData.maxSalary}
                          onChange={(e) => setJobFormData({ ...jobFormData, maxSalary: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Requirements</label>
                      <textarea
                        value={jobFormData.requirements}
                        onChange={(e) => setJobFormData({ ...jobFormData, requirements: e.target.value })}
                        rows={4}
                        placeholder="List job requirements"
                      />
                    </div>
                    <div className="form-group">
                      <label>Responsibilities</label>
                      <textarea
                        value={jobFormData.responsibilities}
                        onChange={(e) => setJobFormData({ ...jobFormData, responsibilities: e.target.value })}
                        rows={4}
                        placeholder="List job responsibilities"
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" disabled={creatingJob} className="btn-primary">
                        {creatingJob ? 'Creating...' : 'Create Job'}
                      </button>
                      <button type="button" onClick={() => setShowJobForm(false)} className="btn-secondary">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {jobs.length === 0 ? (
                  <p className="empty-state">No jobs posted yet. Create your first job posting!</p>
                ) : (
                  <div className="jobs-list">
                    {jobs.map((job) => (
                      <div key={job.id} className="job-item">
                        <div className="job-header">
                          <div>
                            <h3>{job.title}</h3>
                            <p className="job-meta">{job.location} • {job.category}</p>
                          </div>
                          <StatusBadge status={job.status} type="job" />
                        </div>
                        {job.status === 'REJECTED' && job.rejectionReason && (
                          <p className="rejection-reason"><strong>Rejection Reason:</strong> {job.rejectionReason}</p>
                        )}
                        <div className="job-actions">
                          <button
                            onClick={() => loadApplications(job.id)}
                            className="btn-secondary"
                          >
                            {selectedJobId === job.id ? 'Hide' : 'View'} Applications
                          </button>
                          <button
                            onClick={() => navigate(`/jobs/${job.id}`)}
                            className="btn-secondary"
                          >
                            View Job
                          </button>
                        </div>
                        
                        {/* Applications Section */}
                        {selectedJobId === job.id && applications[job.id] && (
                          <div className="applications-section">
                            <h4>Applications ({applications[job.id].length})</h4>
                            {applications[job.id].length === 0 ? (
                              <p className="empty-state">No applications yet</p>
                            ) : (
                              <div className="applications-list">
                                {applications[job.id].map((app) => (
                                  <div key={app.id} className="application-item">
                                    <div className="application-header">
                                      <div>
                                        <p><strong>{app.jobSeeker?.firstName} {app.jobSeeker?.lastName}</strong></p>
                                        <p className="application-meta">
                                          {app.jobSeeker?.email} • Applied: {new Date(app.appliedAt).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <StatusBadge status={app.status} type="application" />
                                    </div>
                                    {app.coverLetter && (
                                      <div className="cover-letter">
                                        <strong>Cover Letter:</strong>
                                        <p>{app.coverLetter}</p>
                                      </div>
                                    )}
                                    {app.employerNotes && (
                                      <p className="employer-notes"><strong>Your Notes:</strong> {app.employerNotes}</p>
                                    )}
                                    <div className="application-actions">
                                      <button
                                        onClick={() => {
                                          const notes = prompt('Add notes (optional):');
                                          handleUpdateApplicationStatus(app.id, 'SHORTLISTED', notes || '');
                                        }}
                                        className="btn-success"
                                        disabled={app.status === 'SHORTLISTED' || app.status === 'HIRED'}
                                      >
                                        Shortlist
                                      </button>
                                      <button
                                        onClick={() => {
                                          const notes = prompt('Rejection reason (optional):');
                                          handleUpdateApplicationStatus(app.id, 'REJECTED', notes || '');
                                        }}
                                        className="btn-danger"
                                        disabled={app.status === 'REJECTED'}
                                      >
                                        Reject
                                      </button>
                                      <button
                                        onClick={() => {
                                          const notes = prompt('Add notes (optional):');
                                          handleUpdateApplicationStatus(app.id, 'HIRED', notes || '');
                                        }}
                                        className="btn-success"
                                        disabled={app.status === 'HIRED'}
                                      >
                                        Hire
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboard;
