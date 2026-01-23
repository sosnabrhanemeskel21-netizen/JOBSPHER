import { authService } from '../../services/authService';
import api from '../../services/api';

// Mock the API module
jest.mock('../../services/api');

describe('AuthService Unit Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('login calls api.post with correct arguments', async () => {
        const mockResponse = { data: { token: 'fake-token', user: { id: 1 } } };
        api.post.mockResolvedValue(mockResponse);

        const result = await authService.login('test@example.com', 'password123');

        expect(api.post).toHaveBeenCalledWith('/auth/login', {
            email: 'test@example.com',
            password: 'password123'
        });
        expect(result).toEqual(mockResponse.data);
    });
    /*
     * HOW IT RUNS:
     * 1. Mocks the underlying 'api' module (axios instance).
     * 2. Calls the authService.login method.
     * 3. Verifies that api.post was called with the expected URL and payload.
     * 
     * WHAT IT DOES:
     * Validates the business logic of the authService in isolation (Pure Unit Test).
     */

    test('register calls api.post with user data', async () => {
        const mockData = { email: 'new@example.com' };
        const mockResponse = { data: { success: true } };
        api.post.mockResolvedValue(mockResponse);

        const result = await authService.register(mockData);

        expect(api.post).toHaveBeenCalledWith('/auth/register', mockData);
        expect(result).toEqual(mockResponse.data);
    });
    /*
     * HOW IT RUNS:
     * 1. Mocks api.post response.
     * 2. Calls register with mock data.
     * 3. Checks API interaction.
     * 
     * WHAT IT DOES:
     * Ensures registration data is passed correctly to the backend endpoint.
     */
});
