import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../../pages/Login';

// Mock the AuthContext
jest.mock('../../../context/AuthContext', () => ({
    useAuth: () => ({
        login: jest.fn(),
    }),
}));

// Mock useNavigate
const mockedNavigator = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedNavigator,
}));

describe('Login Page Integration', () => {

    test('renders login form correctly', () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    });
    /*
    * HOW IT RUNS:
    * 1. Renders Login Page.
    * 2. Checks content.
    * 
    * WHAT IT DOES:
    * Verifies UI presence.
    */

    test('updates input fields on user typing', () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        const emailInput = screen.getByLabelText(/Email Address/i);
        fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
        expect(emailInput.value).toBe('user@example.com');
    });
    /*
    * HOW IT RUNS:
    * 1. Renders page.
    * 2. Types in email.
    * 3. Checks value.
    * 
    * WHAT IT DOES:
    * Verifies state handling.
    */
});
