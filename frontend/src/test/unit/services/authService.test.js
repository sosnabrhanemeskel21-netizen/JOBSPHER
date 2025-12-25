import { authService } from '../../../services/authService';
import api from '../../../services/api';

// Mock the api module
jest.mock('../../../services/api');

describe('authService', () => {
    afterEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test('login calls api.post and returns data', async () => {
        const mockResponse = { data: { token: 'fake-token', user: { email: 'test@example.com' } } };
        api.post.mockResolvedValue(mockResponse);

        const result = await authService.login('test@example.com', 'password');

        expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'test@example.com', password: 'password' });
        expect(result).toEqual(mockResponse.data);
    });

    test('register calls api.post and returns data', async () => {
        const mockData = { email: 'new@example.com', password: 'password' };
        const mockResponse = { data: { token: 'reg-token', user: { email: 'new@example.com' } } };
        api.post.mockResolvedValue(mockResponse);

        const result = await authService.register(mockData);

        expect(api.post).toHaveBeenCalledWith('/auth/register', mockData);
        expect(result).toEqual(mockResponse.data);
    });

    test('logout removes items from localStorage', () => {
        localStorage.setItem('token', 'fake-token');
        localStorage.setItem('user', 'fake-user');

        authService.logout();

        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
    });
});
