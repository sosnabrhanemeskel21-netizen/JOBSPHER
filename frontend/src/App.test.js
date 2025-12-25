import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Navbar with brand name', () => {
  render(<App />);
  const brandElement = screen.getByText(/Jobspher/i);
  expect(brandElement).toBeInTheDocument();
});
