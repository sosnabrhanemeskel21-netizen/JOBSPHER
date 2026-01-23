import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import JobDetails from '../../pages/JobDetails';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { fileService } from '../../services/fileService';
import { useAuth } from '../../context/AuthContext';

// Mock services
jest.mock('../../services/jobService');
jest.mock('../../services/applicationService');
jest.mock('../../services/fileService');
jest.mock('../../context/AuthContext');

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
}));

describe('Job Application Flow Integration', () => {
    const mockJob = {
        id: 1,
        title: 'Senior React Developer',
        description: 'Great job opportunity',
        company: { name: 'Tech Co', logoPath: 'path/to/logo.png' },
        location: 'Remote',
        category: 'Engineering',
        minSalary: 100000,
        maxSalary: 120000,
        createdAt: '2023-01-01T00:00:00.000Z',
        status: 'ACTIVE'
    };

    const mockUser = {
        id: 100,
        role: 'JOB_SEEKER',
        email: 'seeker@example.com'
    };

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup default mock responses
        jobService.getJobById.mockResolvedValue(mockJob);
        applicationService.createApplication.mockResolvedValue({ success: true });
        fileService.getDownloadUrl.mockReturnValue('http://localhost:8080/files/logo.png');
        useAuth.mockReturnValue({ user: mockUser });
    });

    test('User can view job details and submit application successfully', async () => {
        // Render with specific route to access URL params
        render(
            <MemoryRouter initialEntries={['/jobs/1']}>
                <Routes>
                    <Route path="/jobs/:id" element={<JobDetails />} />
                </Routes>
            </MemoryRouter>
        );

        // 1. Verify Job Details Loaded
        expect(screen.getByText(/Gathering details/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Senior React Developer')).toBeInTheDocument();
            expect(screen.getByText('Tech Co')).toBeInTheDocument();
        });

        // 2. Verify Apply Form logic
        const applyButton = screen.getByText('Apply Now');
        expect(applyButton).toBeInTheDocument();

        // 3. Fill out the application form
        // Upload Resume
        const file = new File(['dummy content'], 'resume.pdf', { type: 'application/pdf' });
        const fileInput = screen.getByLabelText(/Choose a file/i);

        // Note: In the component, the input has id="resume-upload" and a label with htmlFor="resume-upload"
        // The text content of label changes.
        // Let's use getByLabelText or fetch by ID if needed.
        // The label initially says "Choose a file (PDF/DOC)" inside the file-input-wrapper.
        // However, standard file input handling:
        const hiddenInput = document.getElementById('resume-upload');
        fireEvent.change(hiddenInput, { target: { files: [file] } });

        // Verify label updated
        await waitFor(() => {
            expect(screen.getByText('resume.pdf')).toBeInTheDocument();
        });

        // Fill Cover Letter
        const coverLetterInput = screen.getByPlaceholderText(/Tell us a bit about yourself/i);
        fireEvent.change(coverLetterInput, { target: { value: 'I am highly interested.' } });

        // 4. Submit Application
        fireEvent.click(applyButton);

        // 5. Verify Service Call
        expect(screen.getByText(/Sending application/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(applicationService.createApplication).toHaveBeenCalledWith(
                '1', // ID from params is string
                file,
                'I am highly interested.'
            );
            expect(mockNavigate).toHaveBeenCalledWith('/my-applications');
        });
    });

    test('Guest user is redirected to login when trying to apply', async () => {
        useAuth.mockReturnValue({ user: null }); // No user

        render(
            <MemoryRouter initialEntries={['/jobs/1']}>
                <Routes>
                    <Route path="/jobs/:id" element={<JobDetails />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Senior React Developer')).toBeInTheDocument();
        });

        // Check for Guest message
        expect(screen.getByText('Sign In to Apply')).toBeInTheDocument();
        expect(screen.queryByText('Apply Now')).not.toBeInTheDocument();
    });
});
