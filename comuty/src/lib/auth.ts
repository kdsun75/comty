import { useAuthStore } from '../store/authStore';

export const getCurrentUser = async () => {
  const { user, userProfile } = useAuthStore.getState();
  
  if (!user) {
    throw new Error('사용자가 로그인되지 않았습니다.');
  }
  
  return {
    uid: user.uid,
    email: user.email,
    displayName: userProfile?.displayName || user.displayName || '익명',
    photoURL: userProfile?.photoURL || user.photoURL,
    ...userProfile
  };
}; 