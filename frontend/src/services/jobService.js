import api from './api';

export const jobService = {
  getJobs: async (params = {}) => {
    const response = await api.get('/jobs', {
      params: {
        keyword: params.keyword || undefined,
        category: params.category || undefined,
        location: params.location || undefined,
        minSalary: params.minSalary || undefined,
        maxSalary: params.maxSalary || undefined,
        page: params.page || 0,
        size: params.size || 10
      }
    });
    return response.data;
  },

  getJobById: async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  createJob: async (jobData) => {
    const formData = new FormData();
    Object.keys(jobData).forEach(key => {
      if (jobData[key] !== null && jobData[key] !== undefined) {
        formData.append(key, jobData[key]);
      }
    });
    const response = await api.post('/jobs', formData);
    return response.data;
  },

  getMyJobs: async () => {
    const response = await api.get('/jobs/my');
    return response.data;
  },
};

