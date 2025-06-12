import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { SurveyPage } from './pages/SurveyPage';
import { ProfilePage } from './pages/ProfilePage';
import CreatePostPage from './pages/CreatePostPage';
import { TestPage } from './pages/TestPage';
import { FallbackPage } from './pages/FallbackPage';
import { AuthGuard } from './components/auth/AuthGuard';
import { ErrorBoundary } from './components/ErrorBoundary';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Public routes - no layout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/setup" element={<FallbackPage />} />
          
          {/* Survey route - requires auth but no survey completion */}
          <Route 
            path="/survey" 
            element={
              <ErrorBoundary>
                <AuthGuard requireAuth={true}>
                  <SurveyPage />
                </AuthGuard>
              </ErrorBoundary>
            } 
          />
          
          {/* Protected routes with layout - requires auth and survey completion */}
          <Route 
            path="/*" 
            element={
              <ErrorBoundary>
                <AuthGuard requireAuth={true} requireSurvey={true}>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/create" element={
                        <ErrorBoundary>
                          <CreatePostPage />
                        </ErrorBoundary>
                      } />
                      {/* Add more protected routes here */}
                    </Routes>
                  </Layout>
                </AuthGuard>
              </ErrorBoundary>
            } 
          />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
