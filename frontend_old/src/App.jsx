import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import NewCasePage from './pages/NewCasePage';
import CaseAnalysisPage from './pages/CaseAnalysisPage';
import PatientRegistrationPage from './pages/PatientRegistrationPage';

const ProtectedRoute = ({ children }) => {
  const { authenticated, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;
  if (!authenticated) return <Navigate to="/login" />;

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/novo-caso"
            element={
              <ProtectedRoute>
                <NewCasePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cadastro-paciente"
            element={
              <ProtectedRoute>
                <PatientRegistrationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analise/:id"
            element={
              <ProtectedRoute>
                <CaseAnalysisPage />
              </ProtectedRoute>
            }
          />
          {/* Add more protected routes here */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
