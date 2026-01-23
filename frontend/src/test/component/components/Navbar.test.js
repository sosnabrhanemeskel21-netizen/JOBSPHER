import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Navbar from '../../../components/Navbar';

// 1. Mock the useAuth hook
jest.mock('../../../context/AuthContext');

// 2. Mock useNavigate from react-router-dom
const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedUsedNavigate,
}));

// Helper to render with Router
const renderNavbar = () => {
    return render(
        <BrowserRouter>
            <Navbar />
        </BrowserRouter>
    );
};

describe('Navbar Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders login and register links when user is NOT logged in', () => {
        useAuth.mockReturnValue({ user: null, logout: jest.fn() });

        renderNavbar();

        expect(screen.getByText(/login/i)).toBeInTheDocument();
        expect(screen.getByText(/register/i)).toBeInTheDocument();
        expect(screen.queryByText(/logout/i)).not.toBeInTheDocument();
    });
    /*
     * HOW IT RUNS:
     * 1. Mocks useAuth to return null user (logged out).
     * 2. Renders Navbar.
     * 3. Checks for Login/Register links.
     * 
     * WHAT IT DOES:
     * Verifies correct navigation options for guest users.
     */

    test('renders Job Seeker specific links when logged in as JOB_SEEKER', () => {
        useAuth.mockReturnValue({
            user: { role: 'JOB_SEEKER', firstName: 'John', lastName: 'Doe' },
            logout: jest.fn(),
        });

        renderNavbar();

        expect(screen.getByText(/browse jobs/i)).toBeInTheDocument();
        expect(screen.getByText(/my applications/i)).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    /*
    * HOW IT RUNS:
    * 1. Mocks useAuth for Job Seeker.
    * 2. Renders Navbar.
    * 3. Checks for "Browse Jobs" and user name.
    * 
    * WHAT IT DOES:
    * Verifies specific navigation links for Job Seekers.
    */

    test('calls logout and navigates to login when logout button is clicked', () => {
        const logoutMock = jest.fn();
        useAuth.mockReturnValue({
            user: { role: 'JOB_SEEKER', firstName: 'John' },
            logout: logoutMock,
        });

        renderNavbar();

        const logoutButton = screen.getByRole('button', { name: /logout/i });
        fireEvent.click(logoutButton);

        expect(logoutMock).toHaveBeenCalledTimes(1);
        expect(mockedUsedNavigate).toHaveBeenCalledWith('/login');
    });
    /*
    * HOW IT RUNS:
    * 1. Setup mock user.
    * 2. Click logout.
    * 3. Check if logout function was called and navigation occurred.
    * 
    * WHAT IT DOES:
    * Verifies logout functionality.
    */
});
