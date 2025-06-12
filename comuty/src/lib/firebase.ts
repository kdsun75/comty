import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration validation
const validateFirebaseConfig = () => {
  const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];

  const missingVars = requiredEnvVars.filter(envVar => {
    const value = import.meta.env[envVar];
    return !value || value.includes('your_') || value === 'your_api_key_here';
  });

  if (missingVars.length > 0) {
    console.error('❌ Firebase 설정 오류:', {
      message: 'Firebase 환경 변수가 설정되지 않았습니다.',
      missingVars,
      action: '.env 파일에 실제 Firebase 프로젝트 설정을 입력하세요.'
    });
    return false;
  }
  
  return true;
};

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate configuration
if (!validateFirebaseConfig()) {
  console.warn('⚠️ Firebase가 올바르게 설정되지 않았습니다. Google 로그인이 작동하지 않을 수 있습니다.');
}

// Initialize Firebase with error handling
let app;
let isFirebaseInitialized = false;

try {
  app = initializeApp(firebaseConfig);
  isFirebaseInitialized = true;
  console.log('✅ Firebase 초기화 성공');
} catch (error) {
  console.error('❌ Firebase 초기화 실패:', error);
  // Create a mock app object to prevent errors
  app = null;
}

// Initialize Firebase services with error handling
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;
export { isFirebaseInitialized };

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
// Google 로그인 시 추가 정보 요청
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Auth functions with error handling
export const signInWithGoogle = () => {
  if (!auth) throw new Error('Firebase not initialized');
  return signInWithPopup(auth, googleProvider);
};

export const signUpWithEmail = (email: string, password: string) => {
  if (!auth) throw new Error('Firebase not initialized');
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signInWithEmail = (email: string, password: string) => {
  if (!auth) throw new Error('Firebase not initialized');
  return signInWithEmailAndPassword(auth, email, password);
};

export const logout = () => {
  if (!auth) throw new Error('Firebase not initialized');
  return signOut(auth);
};

// Firestore functions
export const saveUserProfile = async (uid: string, userData: any) => {
  try {
    // Ensure updatedAt timestamp is always set
    const profileData = {
      ...userData,
      updatedAt: userData.updatedAt || new Date(),
    };
    
    await setDoc(doc(db, 'users', uid), profileData, { merge: true });
    console.log('✅ 사용자 프로필 저장 성공:', uid);
    return profileData;
  } catch (error) {
    console.error('❌ 사용자 프로필 저장 실패:', error);
    throw error;
  }
};

export const getUserProfile = async (uid: string) => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('✅ 사용자 프로필 로드 성공:', uid);
      return data;
    } else {
      console.log('⚠️ 사용자 프로필이 존재하지 않음:', uid);
      return null;
    }
  } catch (error) {
    console.error('❌ 사용자 프로필 로드 실패:', error);
    throw error;
  }
};

// 프로필 업데이트 전용 함수
export const updateUserProfile = async (uid: string, updates: Partial<any>) => {
  try {
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };
    
    await setDoc(doc(db, 'users', uid), updateData, { merge: true });
    console.log('✅ 프로필 업데이트 성공:', uid, Object.keys(updates));
    return updateData;
  } catch (error) {
    console.error('❌ 프로필 업데이트 실패:', error);
    throw error;
  }
};

// Auth state observer
export const onAuthStateChange = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
}; 