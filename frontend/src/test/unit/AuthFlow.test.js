import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../pages/Login';
import Register from '../../pages/Register';

// Create a simulated app or just test key transitions
// E2E is hard with mocks but we can simulate a flow "User arrives at login"

// Mock AuthContext
jest.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        login: jest.fn(),
        register: jest.fn(),
    }),
}));

// Mock Router
const mockedNavigator = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedNavigator,
}));

describe('Authentication User Flow (E2E Simulation)', () => {

    test('User can navigate to Register from Login page', async () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        // Check we are on login
        expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();

        // Find link to register - Note: In a real E2E this is a click and url change.
        // In Unit/Integration with mocked Router, we verify the link exists and points to /register.

        const registerLink = screen.getByText(/Create one/i); // "No account? Create one"
        expect(registerLink.closest('a')).toHaveAttribute('href', '/register');
    });
    /*
    * HOW IT RUNS:
    * 1. Renders Login page.
    * 2. Finds the "Create one" link.
    * 3. Checks href attribute.
    * 
    * WHAT IT DOES:
    * Verifies the critical path connectivity between Login and Registration pages is intact.
    */
});
