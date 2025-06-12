import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { SurveyPage } from './pages/SurveyPage';
import { AuthGuard } from './components/auth/AuthGuard';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes - no layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        
        {/* Survey route - requires auth but no survey completion */}
        <Route 
          path="/survey" 
          element={
            <AuthGuard requireAuth={true}>
              <SurveyPage />
            </AuthGuard>
          } 
        />
        
        {/* Protected routes with layout - requires auth and survey completion */}
        <Route 
          path="/*" 
          element={
            <AuthGuard requireAuth={true} requireSurvey={true}>
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  {/* Add more protected routes here */}
                </Routes>
              </Layout>
            </AuthGuard>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
