import { render, screen } from '@testing-library/react';
import App from './App';

test('renders home with competitions list', () => {
  render(<App />);
  expect(screen.getByText(/Simuladores/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Copa Libertadores/i })).toHaveAttribute(
    'href',
    '/copa-libertadores'
  );
  expect(screen.getByRole('link', { name: /Copa do Brasil/i })).toHaveAttribute(
    'href',
    '/copa-do-brasil'
  );
  expect(screen.getByRole('link', { name: /Champions League/i })).toHaveAttribute(
    'href',
    '/champions-league'
  );
});
