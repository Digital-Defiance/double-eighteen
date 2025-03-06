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
});
