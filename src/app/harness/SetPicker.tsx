import { FC } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DominoSetSize } from '@/variants';

const SET_OPTIONS: DominoSetSize[] = [9, 12, 15, 18];

interface SetPickerProps {
  currentSet: DominoSetSize;
  basePath: string;
  preserveParams?: string[];
}

export const SetPicker: FC<SetPickerProps> = ({
  currentSet,
  basePath,
  preserveParams = [],
}) => {
  const [searchParams] = useSearchParams();

  const linkFor = (set: DominoSetSize) => {
    const params = new URLSearchParams();
    params.set('set', String(set));
    for (const key of preserveParams) {
      const value = searchParams.get(key);
      if (value) params.set(key, value);
    }
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
      <span style={{ fontSize: 14, color: '#6b7280', alignSelf: 'center' }}>
        Set:
      </span>
      {SET_OPTIONS.map((set) => (
        <Link
          key={set}
          to={linkFor(set)}
          data-testid={`set-picker-${set}`}
          style={{
            padding: '4px 12px',
            borderRadius: 6,
            fontSize: 14,
            textDecoration: 'none',
            backgroundColor: set === currentSet ? '#2563EB' : '#fff',
            color: set === currentSet ? '#fff' : '#2563EB',
            border: '1px solid #2563EB',
          }}
        >
          Double-{set}
        </Link>
      ))}
    </div>
  );
};

export default SetPicker;
