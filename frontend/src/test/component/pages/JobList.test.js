import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { jobService } from '../../../services/jobService';
import JobList from '../../../pages/JobList';
import { useAuth } from '../../../context/AuthContext';

// Mock services and context
jest.mock('../../../services/jobService', () => ({
    jobService: {
        getJobs: jest.fn()
    }
}));
jest.mock('../../../context/AuthContext');

// Mock Components
jest.mock('../../../components/Navbar', () => () => <div data-testid="navbar">Navbar</div>);

describe('JobList Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Default AuthContext mock
        useAuth.mockReturnValue({
            user: { role: 'JOB_SEEKER' },
            logout: jest.fn()
        });
    });

    const renderJobList = () => {
        render(
            <BrowserRouter>
                <JobList />
            </BrowserRouter>
        );
    };

    test('renders loading spinner initially', () => {
        // Return a promise that doesn't resolve immediately to check loading state
        jobService.getJobs.mockImplementation(() => new Promise(() => { }));
        renderJobList();
        expect(screen.getByText(/loading jobs/i)).toBeInTheDocument();
    });

    test('renders jobs when loaded', async () => {
        const mockJobs = {
            content: [
                { id: 1, title: 'Software Engineer', location: 'Remote', company: { name: 'Tech Co' } },
                { id: 2, title: 'Product Manager', location: 'New York', company: { name: 'Biz Co' } }
            ],
            totalPages: 1
        };
        jobService.getJobs.mockResolvedValue(mockJobs);

        renderJobList();

        await waitFor(() => {
            expect(screen.getByText('Software Engineer')).toBeInTheDocument();
            expect(screen.getByText('Tech Co')).toBeInTheDocument();
            expect(screen.getByText('Product Manager')).toBeInTheDocument();
        });
    });

    test('renders empty state when no jobs found', async () => {
        jobService.getJobs.mockResolvedValue({ content: [], totalPages: 0 });

        renderJobList();

        await waitFor(() => {
            expect(screen.getByText(/no jobs found/i)).toBeInTheDocument();
        });
    });

    test('filters fetch jobs with correct parameters', async () => {
        jobService.getJobs.mockResolvedValue({ content: [], totalPages: 0 });
        renderJobList();

        await waitFor(() => expect(jobService.getJobs).toHaveBeenCalled());

        const searchInput = screen.getByPlaceholderText(/search jobs/i);
        fireEvent.change(searchInput, { target: { value: 'Java', name: 'keyword' } });

        // useEffect triggers on filter change
        await waitFor(() => {
            expect(jobService.getJobs).toHaveBeenCalledWith(expect.objectContaining({
                keyword: 'Java',
                page: 0
            }));
        });
    });
});
