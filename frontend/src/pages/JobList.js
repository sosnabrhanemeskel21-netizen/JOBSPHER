import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobService } from '../services/jobService';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import './JobList.css';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    location: '',
    minSalary: '',
    maxSalary: '',
  });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadJobs();
  }, [page, filters]);

  const loadJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        size: 10,
        ...(filters.keyword && { keyword: filters.keyword }),
        ...(filters.category && { category: filters.category }),
        ...(filters.location && { location: filters.location }),
        ...(filters.minSalary && { minSalary: filters.minSalary }),
        ...(filters.maxSalary && { maxSalary: filters.maxSalary }),
      };
      const data = await jobService.getJobs(params);
      setJobs(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load jobs. Please try again.');
      console.error('Error loading jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
    setPage(0);
  };

  return (
    <div>
      <Navbar />
      <div className="job-list-container">
        <div className="filters-section">
          <h2>Find Your Dream Job</h2>
          <div className="filters">
            <input
              type="text"
              name="keyword"
              placeholder="Search jobs..."
              value={filters.keyword}
              onChange={handleFilterChange}
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={filters.location}
              onChange={handleFilterChange}
            />
            <input
              type="text"
              name="category"
              placeholder="Category"
              value={filters.category}
              onChange={handleFilterChange}
            />
            <input
              type="number"
              name="minSalary"
              placeholder="Min Salary"
              value={filters.minSalary}
              onChange={handleFilterChange}
            />
            <input
              type="number"
              name="maxSalary"
              placeholder="Max Salary"
              value={filters.maxSalary}
              onChange={handleFilterChange}
            />
          </div>
        </div>

        <div className="jobs-section">
          {error && <ErrorMessage message={error} dismissible onDismiss={() => setError('')} />}
          {loading ? (
            <LoadingSpinner message="Loading jobs..." />
          ) : jobs.length === 0 ? (
            <div className="empty-state">No jobs found. Try adjusting your filters.</div>
          ) : (
            <>
              {jobs.map((job) => (
                <div key={job.id} className="job-card">
                  <div className="job-card-header">
                    <h3>{job.title}</h3>
                    <StatusBadge status={job.status} type="job" />
                  </div>
                  <p className="company-name">{job.company?.name}</p>
                  <p className="job-location">{job.location}</p>
                  <p className="job-category">{job.category}</p>
                  {job.minSalary && job.maxSalary && (
                    <p className="job-salary">
                      ${job.minSalary} - ${job.maxSalary}
                    </p>
                  )}
                  <p className="job-description">
                    {job.description?.substring(0, 200)}...
                  </p>
                  <Link to={`/jobs/${job.id}`} className="btn-view-job">
                    View Details
                  </Link>
                </div>
              ))}
              <div className="pagination">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>
                <span>Page {page + 1} of {totalPages || 1}</span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobList;

