import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { IdentityHome } from './pages/IdentityHome';
import { IdentityCreate } from './pages/IdentityCreate';
import { IdentityLookup } from './pages/IdentityLookup';
import { IdentityView } from './pages/IdentityView';
import { IdentityStatus } from './pages/IdentityStatus';
import { IdentityHistory } from './pages/IdentityHistory';
import { IdentityKeys } from './pages/IdentityKeys';
import { AuthHome } from './pages/AuthHome';
import { ChallengeRequest } from './pages/ChallengeRequest';
import { AuthJwks } from './pages/AuthJwks';
import { ConsentHome } from './pages/ConsentHome';
import { ConsentCreate } from './pages/ConsentCreate';
import { ConsentLookup } from './pages/ConsentLookup';
import { ConsentIdentityList } from './pages/ConsentIdentityList';
import { ConsentRequired } from './pages/ConsentRequired';
import { VerifierHome } from './pages/VerifierHome';
import { VerifierRegister } from './pages/VerifierRegister';
import { VerifierLookup } from './pages/VerifierLookup';
import { VerifierView } from './pages/VerifierView';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="identity" element={<IdentityHome />} />
            <Route path="identity/create" element={<IdentityCreate />} />
            <Route path="identity/lookup" element={<IdentityLookup />} />
            <Route path="identity/:uuid" element={<IdentityView />} />
            <Route path="identity/:uuid/status" element={<IdentityStatus />} />
            <Route path="identity/:uuid/history" element={<IdentityHistory />} />
            <Route path="identity/:uuid/keys" element={<IdentityKeys />} />
            <Route path="auth" element={<AuthHome />} />
            <Route path="auth/challenge" element={<ChallengeRequest />} />
            <Route path="auth/jwks" element={<AuthJwks />} />
            <Route path="consent" element={<ConsentHome />} />
            <Route path="consent/create" element={<ConsentCreate />} />
            <Route path="consent/lookup" element={<ConsentLookup />} />
            <Route path="consent/identity" element={<ConsentIdentityList />} />
            <Route path="consent/required" element={<ConsentRequired />} />
            <Route path="verifier" element={<VerifierHome />} />
            <Route path="verifier/register" element={<VerifierRegister />} />
            <Route path="verifier/lookup" element={<VerifierLookup />} />
            <Route path="verifier/:id" element={<VerifierView />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
