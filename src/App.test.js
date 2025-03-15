import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders header text', () => {
  render(<App />);
  const headerElement = screen.getByText(/Bukber ?/i);
  expect(headerElement).toBeInTheDocument();
});

test('renders voting buttons', () => {
  render(<App />);
  const gasButton = screen.getByRole('button', { name: /Gas/i });
  const skipButton = screen.getByRole('button', { name: /Skip/i });
  expect(gasButton).toBeInTheDocument();
  expect(skipButton).toBeInTheDocument();
});

test('displays voting results', () => {
  render(<App />);
  const gasResult = screen.getByText(/Gas: 0/i);
  const skipResult = screen.getByText(/Skip: 0/i);
  expect(gasResult).toBeInTheDocument();
  expect(skipResult).toBeInTheDocument();
});
