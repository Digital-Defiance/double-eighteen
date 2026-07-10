import { FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface HarnessShellProps {
  testId: string;
  title: string;
  description: string;
  children: ReactNode;
  controls?: ReactNode;
  dataSet?: number;
}

export const HarnessShell: FC<HarnessShellProps> = ({
  testId,
  title,
  description,
  children,
  controls,
  dataSet,
}) => {
  return (
    <div
      data-testid={testId}
      {...(dataSet !== undefined ? { 'data-set': dataSet } : {})}
      style={{ padding: 24, backgroundColor: '#f3f4f6', minHeight: '100vh' }}
    >
      <p style={{ marginBottom: 16 }}>
        <Link to="/harness" style={{ color: '#2563EB' }}>
          ← All harnesses
        </Link>
        {' · '}
        <Link to="/" style={{ color: '#2563EB' }}>
          Demo
        </Link>
      </p>
      <h1 style={{ marginBottom: 8 }}>{title}</h1>
      <p style={{ color: '#6b7280', marginBottom: controls ? 8 : 24 }}>{description}</p>
      {controls ? <div style={{ marginBottom: 24 }}>{controls}</div> : null}
      {children}
    </div>
  );
};

export default HarnessShell;
