import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import { applicationService } from '../services/applicationService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import './JobSeekerApplications.css';

const JobSeekerApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const controllerRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;
    loadApplications(controller.signal);

    return () => controller.abort();
  }, []);

  const loadApplications = async (signal) => {
    try {
      const data = await applicationService.getMyApplications(signal);
      setApplications(data || []);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Failed to load applications'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <LoadingSpinner message="Loading your applications..." />
      </div>
    );
  }

  return (
    <div>
      <Navbar/>

      <div className="applications-container">
        <h1>My Applications</h1>

        {error && <ErrorMessage message={error} dismissible onDismiss={() => setError(null)} />}

        {!error && applications.length === 0 ? (
          <div className="empty-state">
            <p>You haven't applied to any jobs yet.</p>
            <a href="/jobs" className="btn-primary">Browse Jobs</a>
          </div>
        ) : (
          <div className="applications-list">
            {applications.map((app) => (
              <div key={app.id} className="application-card">
                <div className="application-header">
                  <div>
                    <h3>{app.job?.title ?? 'Job title not available'}</h3>
                    <p className="company-name">
                      {app.job?.company?.name ?? 'Company not available'}
                    </p>
                    <p className="applied-date">
                      Applied: {app.appliedAt
                        ? new Date(app.appliedAt).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                  <StatusBadge status={app.status} type="application" />
                </div>

                {app.employerNotes && (
                  <div className="employer-notes">
                    <strong>Employer Notes:</strong>
                    <p>{app.employerNotes}</p>
                  </div>
                )}
                
                {app.job?.id && (
                  <a href={`/jobs/${app.job.id}`} className="btn-secondary">
                    View Job Details
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSeekerApplications;
