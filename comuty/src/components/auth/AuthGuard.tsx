import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChange, getUserProfile } from '../../lib/firebase';
import { useAuthStore } from '../../store/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireSurvey?: boolean;
}

export function AuthGuard({ 
  children, 
  requireAuth = false, 
  requireSurvey = false 
}: AuthGuardProps) {
  const navigate = useNavigate();
  const { user, userProfile, loading, setUser, setUserProfile, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        setUser(firebaseUser);
        
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          setUserProfile(profile as any);
          
          // Check if survey is required but not completed
          if (requireSurvey && (!profile || !profile.surveyCompleted)) {
            navigate('/survey');
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        
        // Redirect to login if authentication is required
        if (requireAuth) {
          navigate('/login');
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, requireAuth, requireSurvey, setUser, setUserProfile, setLoading]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if authentication is required but user is not logged in
  if (requireAuth && !user) {
    return null; // Will redirect in useEffect
  }

  // Redirect to survey if survey is required but not completed
  if (requireSurvey && user && (!userProfile || !userProfile.surveyCompleted)) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
} 