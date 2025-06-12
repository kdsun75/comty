import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';

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

  return missingVars.length === 0;
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

// Safe Firebase initialization
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let isFirebaseInitialized = false;

try {
  if (validateFirebaseConfig()) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    isFirebaseInitialized = true;
    console.log('✅ Firebase 초기화 성공');
  } else {
    console.warn('⚠️ Firebase 환경 변수가 설정되지 않았습니다. 일부 기능이 제한됩니다.');
  }
} catch (error) {
  console.error('❌ Firebase 초기화 실패:', error);
  console.log('💡 Firebase 설정을 확인해주세요. /setup 페이지를 방문하세요.');
}

// Safe auth functions
export const signInWithGoogle = async () => {
  if (!auth || !isFirebaseInitialized) {
    throw new Error('Firebase가 초기화되지 않았습니다. Firebase 설정을 확인해주세요.');
  }
  const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const signUpWithEmail = async (email: string, password: string) => {
  if (!auth || !isFirebaseInitialized) {
    throw new Error('Firebase가 초기화되지 않았습니다. Firebase 설정을 확인해주세요.');
  }
  const { createUserWithEmailAndPassword } = await import('firebase/auth');
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signInWithEmail = async (email: string, password: string) => {
  if (!auth || !isFirebaseInitialized) {
    throw new Error('Firebase가 초기화되지 않았습니다. Firebase 설정을 확인해주세요.');
  }
  const { signInWithEmailAndPassword } = await import('firebase/auth');
  return signInWithEmailAndPassword(auth, email, password);
};

export const logout = async () => {
  if (!auth || !isFirebaseInitialized) {
    throw new Error('Firebase가 초기화되지 않았습니다. Firebase 설정을 확인해주세요.');
  }
  const { signOut } = await import('firebase/auth');
  return signOut(auth);
};

// Safe Firestore functions
export const saveUserProfile = async (uid: string, userData: any) => {
  if (!db || !isFirebaseInitialized) {
    throw new Error('Firestore가 초기화되지 않았습니다. Firebase 설정을 확인해주세요.');
  }
  
  try {
    const { doc, setDoc } = await import('firebase/firestore');
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
  if (!db || !isFirebaseInitialized) {
    throw new Error('Firestore가 초기화되지 않았습니다. Firebase 설정을 확인해주세요.');
  }
  
  try {
    const { doc, getDoc } = await import('firebase/firestore');
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

export const updateUserProfile = async (uid: string, updates: Partial<any>) => {
  if (!db || !isFirebaseInitialized) {
    throw new Error('Firestore가 초기화되지 않았습니다. Firebase 설정을 확인해주세요.');
  }
  
  try {
    const { doc, setDoc } = await import('firebase/firestore');
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

export const onAuthStateChange = (callback: (user: any) => void) => {
  if (!auth || !isFirebaseInitialized) {
    console.warn('Firebase가 초기화되지 않았습니다. 인증 상태 변경을 감지할 수 없습니다.');
    return () => {}; // 빈 unsubscribe 함수 반환
  }
  
  import('firebase/auth').then(({ onAuthStateChanged }) => {
    return onAuthStateChanged(auth!, callback);
  }).catch(error => {
    console.error('Auth state listener 설정 실패:', error);
  });
  
  return () => {}; // 기본 unsubscribe 함수
};

// Export Firebase instances (nullable)
export { app, auth, db, storage, isFirebaseInitialized }; 