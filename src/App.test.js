import { render, screen } from '@testing-library/react';
import App from './App';

test('renders home with competitions list', () => {
  render(<App />);
  expect(screen.getByText(/SimFut/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Copa Libertadores/i })).toHaveAttribute(
    'href',
    '/copa-libertadores'
  );
  expect(screen.getByRole('link', { name: /Copa Sul-Americana/i })).toHaveAttribute(
    'href',
    '/copa-sul-americana'
  );
  expect(screen.getByRole('link', { name: /Copa do Brasil/i })).toHaveAttribute(
    'href',
    '/copa-do-brasil'
  );
  expect(screen.queryByRole('link', { name: /Champions League/i })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /Europa League/i })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /Copa do Mundo 2026/i })).not.toBeInTheDocument();
  expect(screen.queryByText(/competições disponíveis/i)).not.toBeInTheDocument();
});
