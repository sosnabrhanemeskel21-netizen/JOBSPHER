import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../../../pages/Register';

// Mock AuthContext
jest.mock('../../../context/AuthContext', () => ({
    useAuth: () => ({
        register: jest.fn(),
    }),
}));

// Mock useNavigate
const mockedNavigator = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedNavigator,
}));

describe('Register Page Integration', () => {
    test('renders registration form with all fields', () => {
        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );

        expect(screen.getByText(/Join Our Community/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    });
    /*
    * HOW IT RUNS:
    * 1. Renders Register page.
    * 2. Checks for input fields.
    * 
    * WHAT IT DOES:
    * Confirms the page structure.
    */

    test('validates invalid phone number', async () => {
        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'securePass' } });

        // Invalid phone
        fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '123' } });

        fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

        await waitFor(() => {
            expect(screen.getByText(/Please enter a valid phone number/i)).toBeInTheDocument();
        });
    });
    /*
    * HOW IT RUNS:
    * 1. Fills form with correct data except phone.
    * 2. Submits form.
    * 3. Waits for error message.
    * 
    * WHAT IT DOES:
    * Tests the specific regex validation for phone numbers.
    */
});
