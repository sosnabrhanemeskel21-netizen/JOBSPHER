import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobService } from '../services/jobService';
import { applicationService } from '../services/applicationService';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
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
      console.error('Error loading job:', err);
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
      alert('Application submitted successfully!');
      navigate('/my-applications');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <LoadingSpinner message="Loading job details..." />
      </div>
    );
  }
  
  if (loadError || !job) {
    return (
      <div>
        <Navbar />
        <div className="job-details-container">
          <ErrorMessage message={loadError || 'Job not found'} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="job-details-container">
        {error && <ErrorMessage message={error} dismissible onDismiss={() => setError('')} />}
        <div className="job-details">
          <div className="job-header">
            <div>
              <h1>{job.title}</h1>
              <p className="company-name">{job.company?.name}</p>
            </div>
            <StatusBadge status={job.status} type="job" />
          </div>
          <div className="job-meta">
            <span>{job.location}</span>
            <span>{job.category}</span>
            {job.employmentType && <span>{job.employmentType}</span>}
            {job.minSalary && job.maxSalary && (
              <span>${job.minSalary} - ${job.maxSalary}</span>
            )}
          </div>
          <div className="job-description">
            <h3>Description</h3>
            <p>{job.description}</p>
          </div>
          {job.requirements && (
            <div className="job-requirements">
              <h3>Requirements</h3>
              <p>{job.requirements}</p>
            </div>
          )}
          {job.responsibilities && (
            <div className="job-responsibilities">
              <h3>Responsibilities</h3>
              <p>{job.responsibilities}</p>
            </div>
          )}
        </div>

        {user && user.role === 'JOB_SEEKER' && job.status === 'ACTIVE' && (
          <div className="apply-section">
            <h2>Apply for this Job</h2>
            <form onSubmit={handleApply}>
              <div className="form-group">
                <label>Resume (PDF or DOC)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResume(e.target.files[0])}
                  required
                />
              </div>
              <div className="form-group">
                <label>Cover Letter (Optional)</label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={5}
                />
              </div>
              <button type="submit" disabled={applying} className="btn-primary">
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetails;

