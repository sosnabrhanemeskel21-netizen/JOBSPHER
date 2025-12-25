import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Login from '../../../pages/Login';

// Mock AuthContext
jest.mock('../../../context/AuthContext');

// Mock useNavigate
const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedUsedNavigate,
}));

describe('Login Page', () => {
    const mockLogin = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        // Default mock implementation
        useAuth.mockReturnValue({
            login: mockLogin,
        });
    });

    const renderLogin = () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );
    };

    test('renders login form', () => {
        renderLogin();
        expect(screen.getByText(/login to jobspher/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    test('handles successful login and navigation', async () => {
        mockLogin.mockResolvedValue({ role: 'JOB_SEEKER' });
        renderLogin();

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password');
            expect(mockedUsedNavigate).toHaveBeenCalledWith('/jobs');
        });
    });

    test('handles failed login and displays error', async () => {
        const errorResponse = { response: { data: { error: 'Invalid credentials' } } };
        mockLogin.mockRejectedValue(errorResponse);
        renderLogin();

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });
    });

    test('navigates to admin dashboard for admin user', async () => {
        mockLogin.mockResolvedValue({ role: 'ADMIN' });
        renderLogin();

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'admin@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'admin123' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(mockedUsedNavigate).toHaveBeenCalledWith('/admin');
        });
    });
});
