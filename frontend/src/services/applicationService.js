import api from './api';

export const applicationService = {
    createApplication: async(jobId, resume, coverLetter) => {
        const formData = new FormData();
        formData.append('jobId', jobId);
        if (resume) {
            formData.append('resume', resume);
        }
        if (coverLetter) {
            formData.append('coverLetter', coverLetter);
        }
        const response = await api.post('/applications', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getMyApplications: async(signal) => {
        // accept an optional AbortSignal to allow request cancellation
        const config = {};
        if (signal) config.signal = signal;
        const response = await api.get('/applications/my', config);
        return response.data;
    },

    getApplicationsByJob: async(jobId) => {
        const response = await api.get(`/applications/job/${jobId}`);
        return response.data;
    },

    updateApplicationStatus: async(applicationId, status, notes) => {
        const response = await api.put(`/applications/${applicationId}/status`, {
            status,
            employerNotes: notes,
        });
        return response.data;
    },
};