import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EmployerDashboard from '../../../pages/EmployerDashboard';
import { companyService } from '../../../services/companyService';
import { applicationService } from '../../../services/applicationService';
import { jobService } from '../../../services/jobService';
import { paymentService } from '../../../services/paymentService';

// Mock all services
jest.mock('../../../services/companyService');
jest.mock('../../../services/applicationService');
jest.mock('../../../services/jobService');
jest.mock('../../../services/paymentService');

// Mock components
jest.mock('../../../components/Navbar', () => () => <div data-testid="navbar">Navbar</div>);

const mockCompany = {
    id: 1,
    name: 'Test Corp',
    industry: 'Tech',
    logoPath: 'logo.png'
};

const mockApplications = [
    {
        id: 101,
        status: 'SUBMITTED',
        jobSeeker: { firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' },
        job: { title: 'Software Engineer' },
        appliedAt: '2023-01-01T12:00:00Z'
    }
];

describe('EmployerDashboard Integration', () => {
    beforeEach(() => {
        // Setup default mock returns
        companyService.getMyCompany.mockResolvedValue(mockCompany);
        paymentService.getPaymentStatus.mockResolvedValue({ verified: true });
        jobService.getMyJobs.mockResolvedValue([]);
        applicationService.getApplicationsForEmployer.mockResolvedValue(mockApplications);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders dashboard and candidate pipeline correctly', async () => {
        render(
            <BrowserRouter>
                <EmployerDashboard />
            </BrowserRouter>
        );

        // Initial loading state
        expect(screen.getByText(/Opening your portal/i)).toBeInTheDocument();

        // Wait for data to load
        await waitFor(() => {
            expect(screen.getByText('Employer Hub')).toBeInTheDocument();
            expect(screen.getByText('Test Corp')).toBeInTheDocument();
        });

        // Check availability of Candidates in Pipeline
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });
    /*
    * HOW IT RUNS:
    * 1. Mocks services.
    * 2. Renders Dashboard.
    * 3. Checks for loading text.
    * 4. Waits for success text (company name, candidate name).
    * 
    * WHAT IT DOES:
    * Integration test verifying that the dashboard page correctly calls and displays data from multiple services.
    */

    test('calls API when Shortlist button is clicked', async () => {
        applicationService.updateApplicationStatus.mockResolvedValue({});

        render(
            <BrowserRouter>
                <EmployerDashboard />
            </BrowserRouter>
        );

        await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument());

        // Find the Shortlist button for the first candidate (Alice)
        const shortlistButtons = screen.getAllByText('Shortlist');
        fireEvent.click(shortlistButtons[0]);

        // Check if the service was called
        await waitFor(() => {
            expect(applicationService.updateApplicationStatus).toHaveBeenCalledWith(
                101,
                'SHORTLISTED',
                expect.any(String)
            );
        });
    });
    /*
    * HOW IT RUNS:
    * 1. Renders Dashboard.
    * 2. Clicks Shortlist on Alice's card.
    * 3. Verifies API call.
    * 
    * WHAT IT DOES:
    * Tests the interaction flow of updating an applicant's status provided by the new UI buttons.
    */
});
