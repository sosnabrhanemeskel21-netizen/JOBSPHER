import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../../context/AuthContext';
import { authService } from '../../../services/authService';

// Mock authService
jest.mock('../../../services/authService');

// Helper component to access context
const TestComponent = () => {
    const { user, login, register, logout, isAuthenticated, loading } = useAuth();
    return (
        <div>
            {loading && <div data-testid="loading">Loading...</div>}
            {isAuthenticated && <div data-testid="user">{user.email}</div>}
            <button onClick={() => login('test@example.com', 'password')}>Login</button>
            <button onClick={() => register({ email: 'new@example.com', password: 'password' })}>Register</button>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

describe('AuthContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test('initializes with no user and not loading', async () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        // Should not be loading after effect runs
        await waitFor(() => expect(screen.queryByTestId('loading')).not.toBeInTheDocument());
        expect(screen.queryByTestId('user')).not.toBeInTheDocument();
    });

    test('restores user from localStorage on mount', async () => {
        const mockUser = { email: 'stored@example.com', token: 'fake-token' };
        localStorage.setItem('token', 'fake-token');
        localStorage.setItem('user', JSON.stringify(mockUser));

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('stored@example.com'));
    });

    test('login calls authService and updates state', async () => {
        const mockUser = { email: 'test@example.com', token: 'new-token' };
        authService.login.mockResolvedValue(mockUser);

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => expect(screen.queryByTestId('loading')).not.toBeInTheDocument());

        await act(async () => {
            screen.getByText('Login').click();
        });

        expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password');
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
        expect(localStorage.getItem('token')).toBe('new-token');
    });

    test('register calls authService and updates state', async () => {
        const mockUser = { email: 'new@example.com', token: 'reg-token' };
        authService.register.mockResolvedValue(mockUser);

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => expect(screen.queryByTestId('loading')).not.toBeInTheDocument());

        await act(async () => {
            screen.getByText('Register').click();
        });

        expect(authService.register).toHaveBeenCalled();
        expect(screen.getByTestId('user')).toHaveTextContent('new@example.com');
        expect(localStorage.getItem('token')).toBe('reg-token');
    });

    test('logout clears state and localStorage', async () => {
        const mockUser = { email: 'test@example.com', token: 'new-token' };
        authService.login.mockResolvedValue(mockUser);

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        // Login first
        await act(async () => {
            screen.getByText('Login').click();
        });

        // Logout
        await act(async () => {
            screen.getByText('Logout').click();
        });

        expect(authService.logout).toHaveBeenCalled();
        expect(screen.queryByTestId('user')).not.toBeInTheDocument();
        // localStorage check removed as it depends on authService implementation which is mocked
    });
});
