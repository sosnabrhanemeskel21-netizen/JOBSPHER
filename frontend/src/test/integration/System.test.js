import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../App';
import { JobStatus } from '../../services/jobService';

// Mock both services to control the flow
jest.mock('../../services/authService', () => ({
    authService: {
        login: jest.fn(),
        logout: jest.fn(),
        getCurrentUser: jest.fn(),
    }
}));

jest.mock('../../services/jobService', () => ({
    jobService: {
        getJobs: jest.fn(),
        JobStatus: { ACTIVE: 'ACTIVE' }
    }
}));

// Import mocked services to define return values
import { authService } from '../../services/authService';
import { jobService } from '../../services/jobService';

describe('System E2E: User Journey', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test('User logs in, views jobs, filters, and logs out', async () => {
        // 1. Setup Mock Responses
        // User is initially NOT logged in
        authService.getCurrentUser.mockReturnValue(null);

        // Login successful response
        authService.login.mockResolvedValue({
            token: 'fake-jwt-token',
            role: 'JOB_SEEKER',
            firstName: 'System',
            lastName: 'Tester'
        });

        // Jobs response
        const mockJobs = {
            content: [
                { id: 1, title: 'Frontend Developer', company: { name: 'Tech Co' }, location: 'Remote', status: 'ACTIVE' },
                { id: 2, title: 'Backend Engineer', company: { name: 'Data Inc' }, location: 'New York', status: 'ACTIVE' }
            ],
            totalPages: 1
        };
        jobService.getJobs.mockResolvedValue(mockJobs);

        // 2. Render App (Starts at / -> redirects to /jobs or /login?) 
        // Usually App handles routing. We rely on App's internal Router.
        render(<App />);

        // 3. Navigate to Login (if not already there, but Navbar is present)
        // Clicking Login on Navbar
        const loginLink = screen.getByText(/login/i, { selector: 'a' });
        fireEvent.click(loginLink);

        // 4. Perform Login
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const loginButton = screen.getByRole('button', { name: /login/i });

        fireEvent.change(emailInput, { target: { value: 'test@system.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        // Update authService to return user AFTER login call
        authService.getCurrentUser.mockReturnValue({
            token: 'fake-jwt-token',
            role: 'JOB_SEEKER',
            firstName: 'System',
            lastName: 'Tester'
        });

        fireEvent.click(loginButton);

        // 5. Verify Redirect to Job List and Greeting
        await waitFor(() => {
            expect(screen.getByText(/System/i)).toBeInTheDocument();
            // Or exact match if possible, but strict "System Tester" might fail on whitespace if not careful
            // The DOM showed "System  Tester" (double space?)
            expect(screen.getByText(/System.*Tester/i)).toBeInTheDocument();
        });

        // 6. Verify Job List Loaded
        await waitFor(() => {
            expect(screen.getByText(/Frontend Developer/i)).toBeInTheDocument();
            expect(screen.getByText(/Tech Co/i)).toBeInTheDocument();
        });

        // 7. Test Filter Interaction (System Aspect interact with multiple components)
        const keywordInput = screen.getByPlaceholderText(/search jobs/i);
        fireEvent.change(keywordInput, { target: { value: 'Frontend' } });

        // Expect jobService to be called with filter
        // Note: Debounce might delay this, or it might be on specific event. 
        // Assuming immediate or check for call
        await waitFor(() => {
            expect(jobService.getJobs).toHaveBeenCalledWith(expect.objectContaining({ keyword: 'Frontend' }));
        });

        // 8. Logout
        const logoutButton = screen.getByText(/logout/i);
        fireEvent.click(logoutButton);

        // 9. Verify Logout State
        await waitFor(() => {
            // Navbar is not present on Login page, so we check for Login Page elements
            expect(screen.getByText(/Login to Jobspher/i)).toBeInTheDocument();
            expect(screen.queryByText(/Welcome/i)).not.toBeInTheDocument();
        });
    });
});
