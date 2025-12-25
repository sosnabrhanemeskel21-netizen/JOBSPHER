import { render, screen, fireEvent } from '@testing-library/react';
import ErrorMessage from '../../../components/ErrorMessage';

describe('ErrorMessage Component', () => {
    test('renders nothing if message is empty', () => {
        const { container } = render(<ErrorMessage message="" />);
        expect(container).toBeEmptyDOMElement();
    });

    test('renders message correctly', () => {
        render(<ErrorMessage message="Something went wrong" />);
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    test('renders dismiss button when dismissible is true', () => {
        const handleDismiss = jest.fn();
        render(<ErrorMessage message="Error" dismissible={true} onDismiss={handleDismiss} />);

        expect(screen.getByRole('button', { name: /dismiss error/i })).toBeInTheDocument();
    });

    test('calls onDismiss when dismiss button is clicked', () => {
        const handleDismiss = jest.fn();
        render(<ErrorMessage message="Error" dismissible={true} onDismiss={handleDismiss} />);

        const button = screen.getByRole('button', { name: /dismiss error/i });
        fireEvent.click(button);

        expect(handleDismiss).toHaveBeenCalledTimes(1);
    });
});
