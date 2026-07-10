import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import App from './app';

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    expect(baseElement).toBeTruthy();
  });

  it('should render the demo title', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    expect(
      screen.getByRole('heading', { name: /Mexican Train Dominoes Game/i })
    ).toBeTruthy();
  });

  it('should render the harness index route', () => {
    render(
      <MemoryRouter initialEntries={['/harness']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('harness-index')).toBeTruthy();
  });

  it('should render the train harness route', () => {
    render(
      <MemoryRouter initialEntries={['/harness/trains']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('train-harness')).toBeTruthy();
  });

  it('defaults the demo board to double-18', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/Engine: Double-18/)).toBeTruthy();
  });

  it('switches the demo board via the set picker', () => {
    render(
      <MemoryRouter initialEntries={['/?set=9']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/Engine: Double-9/)).toBeTruthy();
    expect(screen.getByTestId('set-picker-9').getAttribute('href')).toBe('/?set=9');
  });

  it('loads double-15 from the URL query param', () => {
    render(
      <MemoryRouter initialEntries={['/?set=15']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/Engine: Double-15/)).toBeTruthy();
  });
});
