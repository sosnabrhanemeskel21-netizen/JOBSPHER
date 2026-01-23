import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobService } from '../services/jobService';
import { applicationService } from '../services/applicationService';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import { fileService } from '../services/fileService';
import './JobDetails.css';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await jobService.getJobById(id);
      setJob(data);
    } catch (err) {
      setLoadError(err.response?.data?.error || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setApplying(true);
    setError('');

    try {
      await applicationService.createApplication(id, resume, coverLetter);
      navigate('/my-applications');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="job-details-page">
        <Navbar />
        <LoadingSpinner message="Gathering details..." />
      </div>
    );
  }

  if (loadError || !job) {
    return (
      <div className="job-details-page">
        <Navbar />
        <div className="container animate-fade">
          <div className="error-card card">
            <h2>Something went wrong</h2>
            <p>{loadError || 'We couldn\'t find the opportunity you\'re looking for.'}</p>
            <Link to="/jobs" className="btn btn-outline">Back to Jobs</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="job-details-page">
      <Navbar />

      <div className="page-header-hazy">
        <div className="container animate-fade">
          <div className="header-flex-group">
            {job.company?.logoPath && (
              <div className="company-logo-header">
                <img src={fileService.getDownloadUrl(job.company.logoPath)} alt={job.company.name} />
              </div>
            )}
            <div className="header-text-group">
              <Link to="/jobs" className="back-link">← Back to opportunities</Link>
              <h1>{job.title}</h1>
              <p className="company-info">{job.company?.name} • {job.location}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container job-details-layout animate-slide">
        <main className="job-main-info">
          <div className="card description-card">
            <section className="detail-section">
              <h3>About the Role</h3>
              <p className="rich-text">{job.description}</p>
            </section>

            {job.requirements && (
              <section className="detail-section">
                <h3>What You'll Need</h3>
                <p className="rich-text">{job.requirements}</p>
              </section>
            )}

            {job.responsibilities && (
              <section className="detail-section">
                <h3>Your Responsibilities</h3>
                <p className="rich-text">{job.responsibilities}</p>
              </section>
            )}
          </div>
        </main>

        <aside className="job-sidebar">
          <div className="card info-sidebar-card">
            <div className="info-item">
              <label>Category</label>
              <p>{job.category}</p>
            </div>
            {job.employmentType && (
              <div className="info-item">
                <label>Job Type</label>
                <p>{job.employmentType}</p>
              </div>
            )}
            {job.minSalary && job.maxSalary && (
              <div className="info-item">
                <label>Compensation</label>
                <p>ETB {job.minSalary.toLocaleString()} - {job.maxSalary.toLocaleString()}</p>
              </div>
            )}
            <div className="info-item">
              <label>Posted On</label>
              <p>{new Date(job.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {user && user.role === 'JOB_SEEKER' && job.status === 'ACTIVE' && (
            <div className="card apply-card">
              <h3>Interested in this role?</h3>
              <p>Submit your details to start the conversation.</p>
              <form onSubmit={handleApply} className="apply-form">
                <div className="form-group">
                  <label>Resume</label>
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      id="resume-upload"
                      accept=".pdf,.doc,.docx,image/*"
                      onChange={(e) => setResume(e.target.files[0])}
                      required
                    />
                    <label htmlFor="resume-upload" className="file-label">
                      {resume ? resume.name : 'Choose a file (PDF/DOC)'}
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label>A short note (Optional)</label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={4}
                    placeholder="Tell us a bit about yourself..."
                  />
                </div>
                {error && <p className="error-text-small">{error}</p>}
                <button type="submit" disabled={applying} className="btn btn-primary auth-btn">
                  {applying ? 'Sending application...' : 'Apply Now'}
                </button>
              </form>
            </div>
          )}

          {!user && (
            <div className="card apply-card guest-card">
              <h3>Interested in this role?</h3>
              <p>Please sign in to apply for this opportunity.</p>
              <Link to="/login" className="btn btn-primary auth-btn">Sign In to Apply</Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default JobDetails;
