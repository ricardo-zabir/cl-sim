import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app without crashing', () => {
  render(<App />);
  const element = screen.getByText(/Simulador Copa Libertadores/i);
  expect(element).toBeInTheDocument();
});
