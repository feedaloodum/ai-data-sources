import { Routes, Route, BrowserRouter } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import PairView from './pages/PairView';
import AgentView from './pages/AgentView';
import ProviderView from './pages/ProviderView';
import GatewayView from './pages/GatewayView';

export default function App() {
  return (
    <BrowserRouter basename={window.CRIBL_BASE_PATH}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pair/:id" element={<PairView />} />
        <Route path="/agent/:id" element={<AgentView />} />
        <Route path="/provider/:id" element={<ProviderView />} />
        <Route path="/gateway/:id" element={<GatewayView />} />
      </Routes>
    </BrowserRouter>
  );
}