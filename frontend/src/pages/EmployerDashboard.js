import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { companyService } from '../services/companyService';
import { paymentService } from '../services/paymentService';
import { jobService } from '../services/jobService';
import { applicationService } from '../services/applicationService';
import { fileService } from '../services/fileService';
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

  // Form visibility
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showAppModal, setShowAppModal] = useState(false);
  const [appStatusUpdate, setAppStatusUpdate] = useState({ status: '', notes: '' });

  // Company form data
  const [companyFormData, setCompanyFormData] = useState({
    name: '',
    description: '',
    industry: '',
    website: '',
    address: '',
    phoneNumber: '',
  });

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
  const [logoFile, setLogoFile] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [creatingJob, setCreatingJob] = useState(false);
  const [jobPaymentFile, setJobPaymentFile] = useState(null);

  // Candidate Pipeline State
  const [allCandidates, setAllCandidates] = useState([]);
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [companyData, paymentData, jobsData, allAppsData] = await Promise.all([
        companyService.getMyCompany().catch(() => null),
        paymentService.getPaymentStatus().catch(() => null),
        jobService.getMyJobs().catch(() => []),
        applicationService.getApplicationsForEmployer().catch(() => [])
      ]);
      setCompany(companyData);
      setPaymentStatus(paymentData);
      setJobs(jobsData);
      setAllCandidates(allAppsData || []);

      if (companyData) {
        setCompanyFormData({
          name: companyData.name || '',
          description: companyData.description || '',
          industry: companyData.industry || '',
          website: companyData.website || '',
          address: companyData.address || '',
          phoneNumber: companyData.phoneNumber || '',
          logoPath: companyData.logoPath || '',
        });
      }
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUploadingLogo(true);
    try {
      let logoPath = companyFormData.logoPath;

      if (logoFile) {
        const uploadResponse = await fileService.uploadFile(logoFile, 'logo');
        logoPath = uploadResponse.filePath;
      }

      const submissionData = { ...companyFormData, logoPath };
      const data = company
        ? await companyService.updateCompany(submissionData)
        : await companyService.createCompany(submissionData);

      setCompany(data);
      setShowCompanyForm(false);
      setLogoFile(null);
      await loadData();
    } catch (err) {
      setError('Failed to save company information');
    } finally {
      setUploadingLogo(false);
    }
  };


  const handleJobSubmit = async (e) => {
    e.preventDefault();
    setCreatingJob(true);
    setError('');
    try {
      const jobData = {
        ...jobFormData,
        minSalary: jobFormData.minSalary ? parseFloat(jobFormData.minSalary) : null,
        maxSalary: jobFormData.maxSalary ? parseFloat(jobFormData.maxSalary) : null,
        paymentProof: jobPaymentFile
      };

      // Ensure we don't send NaN
      if (isNaN(jobData.minSalary)) jobData.minSalary = null;
      if (isNaN(jobData.maxSalary)) jobData.maxSalary = null;

      await jobService.createJob(jobData);
      setShowJobForm(false);
      setJobFormData({
        title: '', description: '', category: '', location: '',
        employmentType: '', minSalary: '', maxSalary: '',
        requirements: '', responsibilities: '',
      });
      setJobPaymentFile(null);
      await loadData();
    } catch (err) {
      console.error("Job creation error:", err);
      setError(err.response?.data?.message || 'Failed to create job');
    } finally {
      setCreatingJob(false);
    }
  };



  const handleQuickUpdate = async (app, newStatus) => {
    try {
      await applicationService.updateApplicationStatus(
        app.id,
        newStatus,
        app.employerNotes || '' // Keep existing notes
      );

      // Refresh logic identical to handleAppUpdate to ensure UI sync
      const allApps = await applicationService.getApplicationsForEmployer();
      setAllCandidates(allApps);

      if (selectedJobId) {
        const updatedJobApps = await applicationService.getApplicationsByJob(selectedJobId);
        setApplications(prev => ({ ...prev, [selectedJobId]: updatedJobApps }));
      }

      // If we are currently sorting/viewing the pipeline, this helps the UI feel responsive
      // The state update above will eventually consistency the view
    } catch (err) {
      console.error("Quick update error:", err);
      setError('Failed to update status');
    }
  };

  const handleAppUpdate = async (e) => {
    e.preventDefault();
    try {
      await applicationService.updateApplicationStatus(
        selectedApplication.id,
        appStatusUpdate.status,
        appStatusUpdate.notes
      );
      setShowAppModal(false);

      // 1. Always refresh the global pipeline list
      const allApps = await applicationService.getApplicationsForEmployer();
      setAllCandidates(allApps);

      // 2. If a specific job view is currently open, refresh that too
      if (selectedJobId) {
        const updatedJobApps = await applicationService.getApplicationsByJob(selectedJobId);
        setApplications(prev => ({ ...prev, [selectedJobId]: updatedJobApps }));
      }

    } catch (err) {
      console.error("Update error:", err);
      setError('Failed to update application status');
    }
  };

  const openAppReview = (app) => {
    setSelectedApplication(app);
    setAppStatusUpdate({ status: app.status, notes: app.employerNotes || '' });
    setShowAppModal(true);
  };

  const loadApplications = async (jobId) => {
    if (selectedJobId === jobId) {
      setSelectedJobId(null);
      return;
    }
    try {
      const apps = await applicationService.getApplicationsByJob(jobId);
      setApplications({ ...applications, [jobId]: apps });
      setSelectedJobId(jobId);
    } catch (err) {
      setError('Failed to load applications');
    }
  };

  if (loading) {
    return (
      <div className="employer-page">
        <Navbar />
        <LoadingSpinner message="Opening your portal..." />
      </div>
    );
  }

  return (
    <div className="employer-page">
      <Navbar />

      <div className="page-header-hazy">
        <div className="container animate-fade">
          <h1>Employer Hub</h1>
          <p className="page-subtitle">Manage your company and find the right hands to help.</p>
        </div>
      </div>

      <div className="container employer-layout">
        {error && <div className="container"><ErrorMessage message={error} /></div>}

        {/* Setup Flow */}
        {!company ? (
          <section className="setup-section animate-slide">
            <div className="setup-grid">
              <div className={`card setup-card active`}>
                <div className="setup-number">1</div>
                <h3>Organization Profile</h3>
                <p>Register your company to start posting opportunities immediately.</p>
                <button onClick={() => setShowCompanyForm(true)} className="btn btn-primary btn-sm">Create Profile</button>
              </div>

              <div className={`card setup-card disabled`}>
                <div className="setup-number">2</div>
                <h3>Start Posting</h3>
                <p>Once registered, you can immediately connect with job seekers.</p>
                <div className="status-indicator">Locked until step 1 complete</div>
              </div>
            </div>
          </section>
        ) : (
          <section className="setup-section animate-slide">
            <div className="setup-grid">
              <div className="card setup-card completed">
                <div className="setup-number">✓</div>
                <h3>Profile Ready</h3>
                <p>Your organization is registered and active.</p>
                {company.logoPath && (
                  <div className="setup-logo-preview">
                    <img src={fileService.getDownloadUrl(company.logoPath)} alt="Logo" />
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        <div className="dashboard-content animate-fade">
          {/* Company Details */}
          {company && (
            <div className="card company-detail-card">
              <div className="card-header-flex">
                <div>
                  <h2>{company.name}</h2>
                  <p className="industry-text">{company.industry || 'Community Organization'}</p>
                </div>
                <div className="header-actions">
                  <button onClick={() => setShowCompanyForm(true)} className="btn btn-outline btn-sm">Edit Profile</button>
                </div>
              </div>
              <div className="company-stats">
                <div className="stat-item">
                  <label>Positions</label>
                  <p>{jobs.length}</p>
                </div>
                <div className="stat-item">
                  <label>Status</label>
                  <p className="status-verified">Verified Partner</p>
                </div>
              </div>
            </div>
          )}

          {/* Jobs List */}
          {(
            <div className="jobs-dashboard">
              <div className="section-header-flex">
                <h2>Active Opportunities</h2>
                <button onClick={() => setShowJobForm(true)} className="btn btn-primary">+ New Posting</button>
              </div>

              {jobs.length === 0 ? (
                <div className="card empty-card">
                  <p>You haven't posted any opportunities yet.</p>
                </div>
              ) : (
                <div className="job-cards-container">
                  {jobs.map(job => (
                    <div key={job.id} className="card dashboard-job-card">
                      <div className="job-card-main">
                        <div className="job-title-row">
                          <h3>{job.title}</h3>
                          <StatusBadge status={job.status} type="job" />
                        </div>
                        <p className="job-info-row">{job.location} • {job.category}</p>
                        <div className="job-footer">
                          <button onClick={() => loadApplications(job.id)} className="btn btn-outline btn-sm">
                            {selectedJobId === job.id ? 'Hide Applications' : `View Applications`}
                          </button>
                          <Link to={`/jobs/${job.id}`} className="view-link">View Public Page →</Link>
                        </div>
                      </div>

                      {selectedJobId === job.id && (
                        <div className="applications-panel animate-slide">
                          <h4>Applications for this role</h4>
                          {applications[job.id]?.length === 0 ? (
                            <p className="no-apps">No candidates have applied yet.</p>
                          ) : (
                            <div className="apps-list">
                              {applications[job.id]?.map(app => (
                                <div key={app.id} className="app-item-card">
                                  <div className="app-info">
                                    <p className="candidate-name">{app.jobSeeker?.firstName} {app.jobSeeker?.lastName}</p>
                                    <p className="app-meta">{app.jobSeeker?.email} • Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
                                  </div>
                                  <div className="app-actions">
                                    <StatusBadge status={app.status} type="application" />
                                    <div className="action-buttons-group" style={{ display: 'flex', gap: '0.5rem' }}>
                                      <button onClick={() => openAppReview(app)} className="btn btn-outline btn-sm">Details</button>
                                      {app.status !== 'SHORTLISTED' && (
                                        <button onClick={() => handleQuickUpdate(app, 'SHORTLISTED')} className="btn btn-outline btn-sm">Shortlist</button>
                                      )}
                                      {app.status !== 'HIRED' && (
                                        <button onClick={() => handleQuickUpdate(app, 'HIRED')} className="btn btn-primary btn-sm">Hire</button>
                                      )}
                                      {app.status !== 'REJECTED' && (
                                        <button onClick={() => handleQuickUpdate(app, 'REJECTED')} className="btn btn-danger btn-sm" style={{ borderColor: 'rgba(239, 68, 68, 0.5)', color: '#fca5a5' }}>Reject</button>
                                      )}
                                    </div>
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

              {/* Candidates Pipeline Section */}
              <div className="candidates-pipeline-section" style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="section-header-flex">
                  <h2>Talent Pipeline</h2>
                </div>

                <div className="card-list">
                  {allCandidates.length === 0 ? (
                    <div className="card empty-card"><p>No candidates found.</p></div>
                  ) : (
                    allCandidates.map(app => (
                      <div key={app.id} className="card item-card-admin" style={{ marginBottom: '1rem', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="item-info">
                          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>{app.jobSeeker?.firstName} {app.jobSeeker?.lastName}</h3>
                          <p className="text-dim">{app.job?.title}</p>
                        </div>
                        <div className="item-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <StatusBadge status={app.status} type="application" />
                          <div className="action-buttons-group" style={{ display: 'flex', gap: '0.5rem' }}>
                            {app.status !== 'SHORTLISTED' && (
                              <button onClick={() => handleQuickUpdate(app, 'SHORTLISTED')} className="btn btn-outline btn-sm">Shortlist</button>
                            )}
                            {app.status !== 'HIRED' && (
                              <button onClick={() => handleQuickUpdate(app, 'HIRED')} className="btn btn-primary btn-sm">Hire</button>
                            )}
                            {app.status !== 'REJECTED' && (
                              <button onClick={() => handleQuickUpdate(app, 'REJECTED')} className="btn btn-danger btn-sm" style={{ borderColor: 'rgba(239, 68, 68, 0.5)', color: '#fca5a5' }}>Reject</button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Forms Modals - Simplistic for now */}
      {(showCompanyForm || showJobForm || showAppModal) && (
        <div className="modal-overlay" onClick={() => {
          setShowCompanyForm(false);
          setShowJobForm(false);
          setShowAppModal(false);
        }}>
          <div className="modal-card card animate-slide" onClick={e => e.stopPropagation()}>

            {showCompanyForm && (
              <>
                <h2>Company Profile</h2>
                <form onSubmit={handleCompanySubmit} className="hazy-form">
                  <div className="form-group">
                    <label htmlFor="companyLogoUpload">Company Logo</label>
                    <input xmlns="http://www.w3.org/1999/xhtml"
                      id="companyLogoUpload"
                      type="file"
                      accept="image/*"
                      onChange={e => setLogoFile(e.target.files[0])}
                      style={{ display: 'block', width: '100%', padding: '10px', background: 'rgba(255,255,255,0.1)', cursor: 'pointer' }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Organization Name</label>
                    <input type="text" value={companyFormData.name} onChange={e => setCompanyFormData({ ...companyFormData, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea rows={3} value={companyFormData.description} onChange={e => setCompanyFormData({ ...companyFormData, description: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Industry</label>
                    <select value={companyFormData.industry} onChange={e => setCompanyFormData({ ...companyFormData, industry: e.target.value })}>
                      <option value="">Select Industry</option>
                      <option value="Technology">Technology</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                      <option value="Finance">Finance</option>
                      <option value="Retail">Retail</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Website</label>
                    <input type="url" value={companyFormData.website} onChange={e => setCompanyFormData({ ...companyFormData, website: e.target.value })} placeholder="https://..." />
                  </div>
                  <div className="form-group">
                    <label>Address</label>
                    <input type="text" value={companyFormData.address} onChange={e => setCompanyFormData({ ...companyFormData, address: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" value={companyFormData.phoneNumber} onChange={e => setCompanyFormData({ ...companyFormData, phoneNumber: e.target.value })} />
                  </div>
                  <button type="submit" disabled={uploadingLogo} className="btn btn-primary auth-btn">
                    {uploadingLogo ? 'Saving...' : 'Save Organization'}
                  </button>
                </form>
              </>
            )}

            {showJobForm && (
              <>
                <h2>Post New Opportunity</h2>
                <form onSubmit={handleJobSubmit} className="hazy-form grid-form">
                  <div className="form-group full-width">
                    <label>Title</label>
                    <input type="text" value={jobFormData.title} onChange={e => setJobFormData({ ...jobFormData, title: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <input type="text" value={jobFormData.category} onChange={e => setJobFormData({ ...jobFormData, category: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input type="text" value={jobFormData.location} onChange={e => setJobFormData({ ...jobFormData, location: e.target.value })} required />
                  </div>
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea rows={4} value={jobFormData.description} onChange={e => setJobFormData({ ...jobFormData, description: e.target.value })} required />
                  </div>
                  <div className="form-group full-width">
                    <label>Requirements</label>
                    <textarea rows={3} value={jobFormData.requirements} onChange={e => setJobFormData({ ...jobFormData, requirements: e.target.value })} placeholder="List key requirements..." />
                  </div>
                  <div className="form-group full-width">
                    <label htmlFor="jobPaymentProof">Upload Payment Proof (Required)</label>
                    <input
                      id="jobPaymentProof"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={e => setJobPaymentFile(e.target.files[0])}
                      required
                      style={{ display: 'block', width: '100%', padding: '10px', background: 'rgba(255,255,255,0.1)', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    />
                    <small className="form-hint">Please upload receipt for this job posting.</small>
                  </div>
                  <button type="submit" disabled={creatingJob || !jobPaymentFile} className="btn btn-primary auth-btn full-width">
                    {creatingJob ? 'Posting...' : 'Post Opportunity'}
                  </button>
                </form>
              </>
            )}

            {showAppModal && selectedApplication && (
              <>
                <h2>Review Application</h2>
                <div className="app-details-view">
                  <div className="detail-row">
                    <label>Candidate</label>
                    <p>{selectedApplication.jobSeeker?.firstName} {selectedApplication.jobSeeker?.lastName}</p>
                  </div>
                  <div className="detail-row">
                    <label>Cover Letter</label>
                    <p className="rich-text">{selectedApplication.coverLetter || 'No cover letter provided.'}</p>
                  </div>
                  <div className="detail-row">
                    <label>Resume</label>
                    <a href={fileService.getDownloadUrl(selectedApplication.resumePath)} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                      Download Resume
                    </a>
                  </div>
                </div>

                <hr className="modal-divider" />

                <form onSubmit={handleAppUpdate} className="hazy-form">
                  <div className="form-group">
                    <label>Update Status</label>
                    <select
                      value={appStatusUpdate.status}
                      onChange={e => setAppStatusUpdate({ ...appStatusUpdate, status: e.target.value })}
                      required
                    >
                      <option value="SUBMITTED">Submitted</option>
                      <option value="SHORTLISTED">Shortlisted</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="HIRED">Hired</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Notes for Candidate</label>
                    <textarea
                      rows={3}
                      value={appStatusUpdate.notes}
                      onChange={e => setAppStatusUpdate({ ...appStatusUpdate, notes: e.target.value })}
                      placeholder="Share your thoughts or next steps..."
                    />
                  </div>
                  <button type="submit" className="btn btn-primary auth-btn">Update Application</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerDashboard;
