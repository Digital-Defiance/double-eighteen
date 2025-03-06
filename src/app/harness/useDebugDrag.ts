import { useCallback, useEffect, useRef, useState } from 'react';

export interface DragOffset {
  dx: number;
  dy: number;
}

export interface DebugDrag {
  /** Whether drag debugging is currently active. */
  enabled: boolean;
  /** Current screen-pixel offset for a tile key (zero when untouched). */
  getOffset: (key: string) => DragOffset;
  /** Pointer-down handler to begin dragging the tile identified by `key`. */
  onPointerDown: (key: string, event: { clientX: number; clientY: number; preventDefault: () => void }) => void;
  /** Keys of every tile that has been moved from its computed position. */
  movedKeys: string[];
  /** Clears all drag offsets. */
  reset: () => void;
}

/**
 * Opt-in debugging helper: lets a view make laid-out tiles draggable so you can
 * nudge them around and read off target positions. When `enabled` is false it
 * is inert (no listeners, no offsets), so callers can leave it wired in and flip
 * it on only when debugging a layout.
 */
export function useDebugDrag(enabled: boolean): DebugDrag {
  const [offsets, setOffsets] = useState<Record<string, DragOffset>>({});
  const drag = useRef<
    | { key: string; pointerX: number; pointerY: number; dx: number; dy: number }
    | null
  >(null);

  const onPointerMove = useCallback((event: PointerEvent) => {
    const current = drag.current;
    if (!current) return;
    const dx = current.dx + (event.clientX - current.pointerX);
    const dy = current.dy + (event.clientY - current.pointerY);
    setOffsets((prev) => ({ ...prev, [current.key]: { dx, dy } }));
  }, []);

  const onPointerUp = useCallback(() => {
    drag.current = null;
  }, []);

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [enabled, onPointerMove, onPointerUp]);

  // Drop stale offsets whenever debugging is switched off.
  useEffect(() => {
    if (!enabled) {
      setOffsets((prev) => (Object.keys(prev).length ? {} : prev));
    }
  }, [enabled]);

  const getOffset = useCallback(
    (key: string): DragOffset => (enabled ? offsets[key] ?? { dx: 0, dy: 0 } : { dx: 0, dy: 0 }),
    [enabled, offsets]
  );

  const onPointerDown = useCallback<DebugDrag['onPointerDown']>(
    (key, event) => {
      if (!enabled) return;
      event.preventDefault();
      const offset = offsets[key] ?? { dx: 0, dy: 0 };
      drag.current = {
        key,
        pointerX: event.clientX,
        pointerY: event.clientY,
        dx: offset.dx,
        dy: offset.dy,
      };
    },
    [enabled, offsets]
  );

  const reset = useCallback(() => setOffsets({}), []);

  const movedKeys = enabled
    ? Object.keys(offsets).filter((key) => offsets[key].dx !== 0 || offsets[key].dy !== 0)
    : [];

  return { enabled, getOffset, onPointerDown, movedKeys, reset };
}
