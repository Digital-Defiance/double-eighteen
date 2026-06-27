import {
  CSSProperties,
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ViewportTransform,
  clampScale,
  fitToBounds,
  zoomAt,
} from './viewportMath';

export interface ViewportProps {
  /** Visible viewport size in pixels. */
  width: number;
  height: number;
  /** Content (world) size, used by the fit/reset control. */
  contentWidth: number;
  contentHeight: number;
  children: ReactNode;
  minScale?: number;
  maxScale?: number;
  /** Multiplier applied per wheel notch / zoom-button press. */
  zoomStep?: number;
  padding?: number;
  background?: string;
  /** Show the built-in zoom/reset control overlay. Default true. */
  showControls?: boolean;
  testId?: string;
}

const PAN_THRESHOLD = 3;

/**
 * A pan/zoom canvas for content larger than the screen. Drag to slide, wheel or
 * the on-screen buttons to zoom (zoom centers on the cursor for the wheel).
 * Clicks pass through to children unless the pointer actually dragged, so
 * interactive content (e.g. click-to-bend tiles) keeps working.
 */
export const Viewport: FC<ViewportProps> = ({
  width,
  height,
  contentWidth,
  contentHeight,
  children,
  minScale = 0.2,
  maxScale = 4,
  zoomStep = 1.15,
  padding = 40,
  background = '#1f8a55',
  showControls = true,
  testId = 'viewport',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fit = useCallback(
    (): ViewportTransform =>
      fitToBounds(
        { width: contentWidth, height: contentHeight },
        { width, height },
        padding,
        minScale,
        maxScale
      ),
    [contentWidth, contentHeight, width, height, padding, minScale, maxScale]
  );

  const [view, setView] = useState<ViewportTransform>(fit);

  // Re-fit when the content or viewport size changes meaningfully.
  useEffect(() => {
    setView(fit());
  }, [fit]);

  const pan = useRef<
    | { pointerX: number; pointerY: number; startX: number; startY: number; moved: boolean }
    | null
  >(null);

  const localPoint = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    return { x: clientX - (rect?.left ?? 0), y: clientY - (rect?.top ?? 0) };
  };

  const onPointerDown = (event: React.PointerEvent) => {
    pan.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      startX: view.x,
      startY: view.y,
      moved: false,
    };
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const current = pan.current;
    if (!current) return;
    const dx = event.clientX - current.pointerX;
    const dy = event.clientY - current.pointerY;
    if (!current.moved && Math.hypot(dx, dy) < PAN_THRESHOLD) return;
    current.moved = true;
    containerRef.current?.setPointerCapture?.(event.pointerId);
    setView((prev) => ({ ...prev, x: current.startX + dx, y: current.startY + dy }));
  };

  const endPan = (event: React.PointerEvent) => {
    if (pan.current?.moved) {
      // Swallow the click that follows a drag so children don't treat it as a tap.
      event.preventDefault();
    }
    pan.current = null;
  };

  const onWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    const pivot = localPoint(event.clientX, event.clientY);
    const factor = event.deltaY < 0 ? zoomStep : 1 / zoomStep;
    setView((prev) => zoomAt(prev, factor, pivot, minScale, maxScale));
  };

  const zoomButton = (factor: number) =>
    setView((prev) =>
      zoomAt(prev, factor, { x: width / 2, y: height / 2 }, minScale, maxScale)
    );

  const buttonStyle: CSSProperties = {
    width: 32,
    height: 32,
    fontSize: 18,
    lineHeight: '30px',
    textAlign: 'center',
    cursor: 'pointer',
    background: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    userSelect: 'none',
  };

  return (
    <div
      ref={containerRef}
      data-testid={testId}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPan}
      onPointerLeave={endPan}
      onWheel={onWheel}
      style={{
        position: 'relative',
        width,
        height,
        overflow: 'hidden',
        background,
        borderRadius: 8,
        cursor: 'grab',
        touchAction: 'none',
      }}
    >
      <div
        data-testid={`${testId}-content`}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          transformOrigin: '0 0',
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
        }}
      >
        {children}
      </div>

      {showControls && (
        <div
          data-testid={`${testId}-controls`}
          style={{
            position: 'absolute',
            right: 12,
            bottom: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={buttonStyle} role="button" aria-label="Zoom in" onClick={() => zoomButton(zoomStep)}>
            +
          </div>
          <div style={buttonStyle} role="button" aria-label="Zoom out" onClick={() => zoomButton(1 / zoomStep)}>
            −
          </div>
          <div
            style={{ ...buttonStyle, fontSize: 12, lineHeight: '30px' }}
            role="button"
            aria-label="Reset view"
            onClick={() => setView(fit())}
          >
            ⤢
          </div>
          <div
            data-testid={`${testId}-zoom-readout`}
            style={{ ...buttonStyle, fontSize: 11, cursor: 'default' }}
          >
            {Math.round(clampScale(view.scale, minScale, maxScale) * 100)}
          </div>
        </div>
      )}
    </div>
  );
};

export default Viewport;
