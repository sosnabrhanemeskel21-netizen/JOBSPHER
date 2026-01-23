import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobService } from '../services/jobService';
import { fileService } from '../services/fileService';
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
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500);

    return () => clearTimeout(handler);
  }, [filters]);

  useEffect(() => {
    loadJobs();
  }, [page, debouncedFilters]);

  const loadJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        size: 10,
        ...(debouncedFilters.keyword && { keyword: debouncedFilters.keyword }),
        ...(debouncedFilters.category && { category: debouncedFilters.category }),
        ...(debouncedFilters.location && { location: debouncedFilters.location }),
        ...(debouncedFilters.minSalary && { minSalary: debouncedFilters.minSalary }),
        ...(debouncedFilters.maxSalary && { maxSalary: debouncedFilters.maxSalary }),
      };
      const data = await jobService.getJobs(params);
      setJobs(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load jobs. Please try again.');
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
    <div className="job-browser-page">
      <Navbar />
      <div className="page-header-hazy">
        <div className="container animate-fade">
          <h1>Find Your Purpose</h1>
          <p className="page-subtitle">Meaningful opportunities for compassionate professionals.</p>
        </div>
      </div>

      <div className="container job-list-layout">
        <aside className="filters-sidebar animate-slide">
          <div className="card filter-card">
            <h3>Filters</h3>
            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                name="keyword"
                placeholder="Job title, keywords..."
                value={filters.keyword}
                onChange={handleFilterChange}
              />
            </div>
            <div className="filter-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                placeholder="City, state..."
                value={filters.location}
                onChange={handleFilterChange}
              />
            </div>
            <div className="filter-group">
              <label>Category</label>
              <input
                type="text"
                name="category"
                placeholder="e.g. Health, Education"
                value={filters.category}
                onChange={handleFilterChange}
              />
            </div>
            <div className="filter-row">
              <div className="filter-group">
                <label>Min Salary</label>
                <input
                  type="number"
                  name="minSalary"
                  placeholder="0"
                  value={filters.minSalary}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="filter-group">
                <label>Max Salary</label>
                <input
                  type="number"
                  name="maxSalary"
                  placeholder="100k"
                  value={filters.maxSalary}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
          </div>
        </aside>

        <main className="jobs-main-content">
          {error && <ErrorMessage message={error} dismissible onDismiss={() => setError('')} />}

          {loading ? (
            <LoadingSpinner message="Searching jobs..." />
          ) : jobs.length === 0 ? (
            <div className="empty-state card">
              <h3>No opportunities found</h3>
              <p>Try adjusting your search filters or browse all categories.</p>
            </div>
          ) : (
            <div className="job-grid animate-fade">
              {jobs.map((job) => (
                <div key={job.id} className="card job-item-card">
                  <div className="job-item-header">
                    <div className="header-flex-group-compact">
                      {job.company?.logoPath && (
                        <div className="company-logo-mini">
                          <img src={fileService.getDownloadUrl(job.company.logoPath)} alt={job.company.name} />
                        </div>
                      )}
                      <div className="job-title-group">
                        <h3>{job.title}</h3>
                        <p className="company-text">{job.company?.name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="job-tags">
                    <span className="job-tag">{job.location}</span>
                    <span className="job-tag">{job.category}</span>
                    {job.minSalary && (
                      <span className="job-tag salary-tag">
                        ETB {job.minSalary.toLocaleString()} - {job.maxSalary.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <p className="job-excerpt">
                    {job.description?.substring(0, 150)}...
                  </p>

                  <div className="job-card-actions">
                    <Link to={`/jobs/${job.id}`} className="btn btn-outline btn-sm">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline btn-sm"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <span className="page-indicator">Page {page + 1} of {totalPages}</span>
              <button
                className="btn btn-outline btn-sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default JobList;
