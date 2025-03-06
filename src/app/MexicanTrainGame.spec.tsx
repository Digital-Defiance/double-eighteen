import { render, screen, fireEvent } from '@testing-library/react';
import { MexicanTrainGame } from './MexicanTrainGame';

describe('MexicanTrainGame', () => {
  it('renders the control bar and engine/player readout', () => {
    render(<MexicanTrainGame />);
    expect(screen.getByText('New trains')).toBeTruthy();
    expect(screen.getByText(/Engine: Double-12/)).toBeTruthy();
    expect(screen.getByText(/Players: 8/)).toBeTruthy();
  });

  it('toggles the layout label between Offset and Linear', () => {
    render(<MexicanTrainGame />);
    const button = screen.getByText(/Layout:/);
    expect(button.textContent).toContain('Offset');
    fireEvent.click(button);
    expect(button.textContent).toContain('Linear');
  });

  it('toggles chicken feet on and off', () => {
    render(<MexicanTrainGame />);
    const button = screen.getByText(/Chicken Feet:/);
    expect(button.textContent).toContain('Off');
    fireEvent.click(button);
    expect(button.textContent).toContain('On');
  });

  it('toggles pip colors and reports the change to a controlled parent', () => {
    const onPipColorsChange = vi.fn();
    render(<MexicanTrainGame onPipColorsChange={onPipColorsChange} />);
    fireEvent.click(screen.getByText(/Pip Colors:/));
    expect(onPipColorsChange).toHaveBeenCalledTimes(1);
    expect(onPipColorsChange.mock.calls[0][0]).toBeTruthy();
  });

  it('respects an injected initial game state', () => {
    render(
      <MexicanTrainGame
        initialState={{ playerCount: 4, trains: [], engineValue: 9 }}
      />
    );
    expect(screen.getByText(/Engine: Double-9/)).toBeTruthy();
    expect(screen.getByText(/Players: 4/)).toBeTruthy();
  });
});
