import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import { applicationService } from '../services/applicationService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import { Link } from 'react-router-dom';
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
        console.error('Failed to load applications:', err);
        // User requested to suppress this error message
        // setError('Failed to load your applications');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="jobseeker-page">
        <Navbar />
        <LoadingSpinner message="Retrieving your path..." />
      </div>
    );
  }

  return (
    <div className="jobseeker-page">
      <Navbar />

      <div className="page-header-hazy">
        <div className="container animate-fade">
          <h1>My Journey</h1>
          <p className="page-subtitle">Track your contributions and upcoming opportunities.</p>
        </div>
      </div>

      <div className="container applications-layout animate-slide">
        {error && <ErrorMessage message={error} dismissible onDismiss={() => setError(null)} />}

        {!error && applications.length === 0 ? (
          <div className="card empty-state-card animate-fade">
            <h2>No path chosen yet</h2>
            <p>You haven't applied to any opportunities. Start your journey today.</p>
            <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
          </div>
        ) : (
          <div className="applications-grid">
            {applications.map((app) => (
              <div key={app.id} className="card application-item-card">
                <div className="app-main-info">
                  <div className="app-title-group">
                    <h3>{app.job?.title}</h3>
                    <p className="company-text">{app.job?.company?.name}</p>
                  </div>
                  <div className="app-status-group">
                    <StatusBadge status={app.status} type="application" />
                    <p className="app-date">Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {app.employerNotes && (
                  <div className="notes-box">
                    <label>Note from Employer</label>
                    <p>{app.employerNotes}</p>
                  </div>
                )}

                <div className="app-footer">
                  <Link to={`/jobs/${app.job?.id}`} className="btn btn-outline btn-sm">
                    View Opportunity
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSeekerApplications;
