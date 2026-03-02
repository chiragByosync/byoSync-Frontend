import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { IdentityCreate } from './pages/IdentityCreate';
import { IdentityLookup } from './pages/IdentityLookup';
import { IdentityView } from './pages/IdentityView';
import { IdentityStatus } from './pages/IdentityStatus';
import { IdentityHistory } from './pages/IdentityHistory';
import { IdentityKeys } from './pages/IdentityKeys';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="identity/create" element={<IdentityCreate />} />
            <Route path="identity/lookup" element={<IdentityLookup />} />
            <Route path="identity/:uuid" element={<IdentityView />} />
            <Route path="identity/:uuid/status" element={<IdentityStatus />} />
            <Route path="identity/:uuid/history" element={<IdentityHistory />} />
            <Route path="identity/:uuid/keys" element={<IdentityKeys />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
