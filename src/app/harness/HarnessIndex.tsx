import { FC } from 'react';
import { Link } from 'react-router-dom';
import { HarnessShell } from './HarnessShell';

const HARNESS_LINKS = [
  {
    to: '/harness/pips',
    title: 'Pip patterns',
    description: 'Counts and grid positions for values 0–12, with optional colors.',
  },
  {
    to: '/harness/dominoes',
    title: 'Domino tiles',
    description: 'Doubles, mixed tiles, rotations, and colored pip rendering.',
  },
  {
    to: '/harness/trains',
    title: 'Train layouts',
    description: 'Deterministic train fixtures for linear and offset spacing validation.',
  },
  {
    to: '/harness/chicken-foot',
    title: 'Chicken foot',
    description: 'Doubles fan three angled toes; recursive nested feet with spacing validation.',
  },
];

export const HarnessIndex: FC = () => {
  return (
    <HarnessShell
      testId="harness-index"
      title="Visual Validation Harnesses"
      description="Deterministic reference views and automated checks for domino rendering."
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
        }}
      >
        {HARNESS_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            data-testid={`harness-link-${link.to.split('/').pop()}`}
            style={{
              display: 'block',
              padding: 16,
              backgroundColor: '#fff',
              borderRadius: 8,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <h2 style={{ fontSize: 18, marginBottom: 8 }}>{link.title}</h2>
            <p style={{ color: '#6b7280', margin: 0, fontSize: 14 }}>{link.description}</p>
          </Link>
        ))}
      </div>
    </HarnessShell>
  );
};

export default HarnessIndex;
