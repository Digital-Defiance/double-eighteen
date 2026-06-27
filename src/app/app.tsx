import { Navigate, Route, Routes, useSearchParams } from 'react-router-dom';
import DominoDemo from './Demo';
import PipPatternHarness from './PipPatternHarness';
import HarnessIndex from './harness/HarnessIndex';
import DominoHarness from './harness/DominoHarness';
import TrainHarness from './harness/TrainHarness';
import ChickenFootHarness from './harness/ChickenFootHarness';
import BendHarness from './harness/BendHarness';

const HARNESS_REDIRECTS: Record<string, string> = {
  pips: '/harness/pips',
  dominoes: '/harness/dominoes',
  trains: '/harness/trains',
  'chicken-foot': '/harness/chicken-foot',
  bends: '/harness/bends',
};

function HarnessRedirect() {
  const [searchParams] = useSearchParams();
  const harness = searchParams.get('harness');

  if (harness && HARNESS_REDIRECTS[harness]) {
    return <Navigate to={HARNESS_REDIRECTS[harness]} replace />;
  }

  return <DominoDemo />;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HarnessRedirect />} />
      <Route path="/harness" element={<HarnessIndex />} />
      <Route path="/harness/pips" element={<PipPatternHarness />} />
      <Route path="/harness/dominoes" element={<DominoHarness />} />
      <Route path="/harness/trains" element={<TrainHarness />} />
      <Route path="/harness/chicken-foot" element={<ChickenFootHarness />} />
      <Route path="/harness/bends" element={<BendHarness />} />
    </Routes>
  );
}

export default App;
