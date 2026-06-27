import { render, fireEvent } from '@testing-library/react';
import { Viewport } from './Viewport';

const setup = () =>
  render(
    <Viewport width={400} height={300} contentWidth={200} contentHeight={150} testId="vp">
      <div data-testid="content-child">hello</div>
    </Viewport>
  );

describe('Viewport', () => {
  it('renders children inside a transformed content layer', () => {
    const { getByTestId } = setup();
    const content = getByTestId('vp-content');
    expect(content.style.transform).toContain('scale(');
    expect(getByTestId('content-child')).toBeTruthy();
  });

  it('exposes zoom controls and a percentage readout', () => {
    const { getByTestId, getByLabelText } = setup();
    const readoutBefore = getByTestId('vp-zoom-readout').textContent;
    fireEvent.click(getByLabelText('Zoom in'));
    const readoutAfter = getByTestId('vp-zoom-readout').textContent;
    expect(Number(readoutAfter)).toBeGreaterThan(Number(readoutBefore));
  });

  it('reset returns to the fitted zoom level', () => {
    const { getByTestId, getByLabelText } = setup();
    const fitted = getByTestId('vp-zoom-readout').textContent;
    fireEvent.click(getByLabelText('Zoom in'));
    fireEvent.click(getByLabelText('Zoom in'));
    expect(getByTestId('vp-zoom-readout').textContent).not.toBe(fitted);
    fireEvent.click(getByLabelText('Reset view'));
    expect(getByTestId('vp-zoom-readout').textContent).toBe(fitted);
  });

  it('pans on drag (updates the content translation)', () => {
    const { getByTestId } = setup();
    const vp = getByTestId('vp');
    const content = getByTestId('vp-content');
    const before = content.style.transform;
    fireEvent.pointerDown(vp, { clientX: 50, clientY: 50 });
    fireEvent.pointerMove(vp, { clientX: 120, clientY: 90 });
    fireEvent.pointerUp(vp, { clientX: 120, clientY: 90 });
    expect(content.style.transform).not.toBe(before);
  });
});
