import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../../../components/LoadingSpinner';

describe('LoadingSpinner Component', () => {
    test('renders with default message', () => {
        render(<LoadingSpinner />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('renders with custom message', () => {
        render(<LoadingSpinner message="Please wait..." />);
        expect(screen.getByText('Please wait...')).toBeInTheDocument();
    });

    test('renders correct size class', () => {
        const { container } = render(<LoadingSpinner size="large" />);
        // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
        const spinnerContainer = container.firstChild;
        expect(spinnerContainer).toHaveClass('large');
    });
});
