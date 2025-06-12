# 인증 시스템 구현

## 1. Firebase Authentication 개요
- Firebase Auth를 사용한 사용자 인증 관리
- 이메일/비밀번호 및 Google 소셜 로그인 지원
- JWT 토큰 기반 인증
- 자동 토큰 갱신 및 세션 관리

## 2. 인증 방식

### 2.1 이메일/비밀번호 인증
- 회원가입: 이메일 주소와 비밀번호로 계정 생성
- 로그인: 등록된 이메일과 비밀번호로 인증
- 이메일 인증: 회원가입 후 이메일 주소 확인
- 비밀번호 재설정: 이메일을 통한 비밀번호 재설정

### 2.2 Google 소셜 로그인
- Google OAuth 2.0 프로토콜 사용
- 원클릭 로그인/회원가입
- Google 계정 정보 자동 연동

## 3. Firebase 설정

### 3.1 Firebase 프로젝트 설정
```typescript
// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Google 로그인 시 추가 정보 요청
googleProvider.addScope('email');
googleProvider.addScope('profile');
```

## 4. 사용자 데이터 구조

### 4.1 Firestore 사용자 문서
```typescript
interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  provider: 'email' | 'google';
  createdAt: number;
  updatedAt: number;
  isEmailVerified: boolean;
  profile: {
    nickname: string;
    bio?: string;
    location?: string;
    website?: string;
  };
}
```

### 4.2 인증 상태 타입
```typescript
interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
```

## 5. 인증 기능 구현

### 5.1 이메일/비밀번호 회원가입
```typescript
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

async function signUpWithEmail(email: string, password: string, displayName: string) {
  try {
    // 계정 생성
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 프로필 업데이트
    await updateProfile(user, { displayName });

    // Firestore에 사용자 정보 저장
    const userData: User = {
      uid: user.uid,
      email: user.email!,
      displayName,
      provider: 'email',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isEmailVerified: false,
      profile: {
        nickname: displayName,
      }
    };

    await setDoc(doc(firestore, 'users', user.uid), userData);

    // 이메일 인증 발송
    await sendEmailVerification(user);

    return { user: userData, success: true };
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
}
```

### 5.2 이메일/비밀번호 로그인
```typescript
import { signInWithEmailAndPassword } from 'firebase/auth';

async function signInWithEmail(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Firestore에서 사용자 추가 정보 가져오기
    const userDoc = await getDoc(doc(firestore, 'users', user.uid));
    const userData = userDoc.data() as User;

    return { user: userData, success: true };
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
}
```

### 5.3 Google 로그인
```typescript
import { signInWithPopup } from 'firebase/auth';

async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // 새 사용자인지 확인
    const userDoc = await getDoc(doc(firestore, 'users', user.uid));
    
    if (!userDoc.exists()) {
      // 새 사용자인 경우 Firestore에 정보 저장
      const userData: User = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName!,
        photoURL: user.photoURL,
        provider: 'google',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isEmailVerified: true, // Google 계정은 이미 인증됨
        profile: {
          nickname: user.displayName!,
        }
      };

      await setDoc(doc(firestore, 'users', user.uid), userData);
      return { user: userData, success: true, isNewUser: true };
    } else {
      const userData = userDoc.data() as User;
      return { user: userData, success: true, isNewUser: false };
    }
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
}
```

### 5.4 로그아웃
```typescript
import { signOut } from 'firebase/auth';

async function logout() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    throw new Error('로그아웃 중 오류가 발생했습니다.');
  }
}
```

### 5.5 비밀번호 재설정
```typescript
import { sendPasswordResetEmail } from 'firebase/auth';

async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: '비밀번호 재설정 이메일을 발송했습니다.' };
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
}
```

## 6. 인증 상태 관리 (Zustand)

```typescript
// store/authStore.ts
import { create } from 'zustand';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthStore extends AuthState {
  initialize: () => void;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  loading: true,
  error: null,

  initialize: () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Firestore에서 사용자 정보 가져오기
        const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          set({ user: userDoc.data() as User, loading: false });
        }
      } else {
        set({ user: null, loading: false });
      }
    });
  },

  signUp: async (email, password, displayName) => {
    set({ loading: true, error: null });
    try {
      const result = await signUpWithEmail(email, password, displayName);
      set({ user: result.user, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const result = await signInWithEmail(email, password);
      set({ user: result.user, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  signInWithGoogle: async () => {
    set({ loading: true, error: null });
    try {
      const result = await signInWithGoogle();
      set({ user: result.user, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      await logout();
      set({ user: null, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  resetPassword: async (email) => {
    set({ loading: true, error: null });
    try {
      await resetPassword(email);
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateProfile: async (data) => {
    const { user } = get();
    if (!user) return;

    set({ loading: true, error: null });
    try {
      const updatedUser = { ...user, ...data, updatedAt: Date.now() };
      await setDoc(doc(firestore, 'users', user.uid), updatedUser);
      set({ user: updatedUser, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));
```

## 7. 폼 검증 (Zod)

```typescript
// lib/validations.ts
import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  password: z
    .string()
    .min(6, '비밀번호는 최소 6자 이상이어야 합니다')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, '비밀번호는 영문과 숫자를 포함해야 합니다'),
  displayName: z
    .string()
    .min(2, '이름은 최소 2자 이상이어야 합니다')
    .max(20, '이름은 최대 20자까지 가능합니다')
});

export const signInSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요')
});

export const resetPasswordSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요')
});
```

## 8. 에러 메시지 처리

```typescript
// lib/auth-errors.ts
export function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
      return '등록되지 않은 이메일입니다.';
    case 'auth/wrong-password':
      return '비밀번호가 올바르지 않습니다.';
    case 'auth/email-already-in-use':
      return '이미 사용 중인 이메일입니다.';
    case 'auth/weak-password':
      return '비밀번호가 너무 약합니다.';
    case 'auth/invalid-email':
      return '올바르지 않은 이메일 형식입니다.';
    case 'auth/user-disabled':
      return '비활성화된 계정입니다.';
    case 'auth/too-many-requests':
      return '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.';
    case 'auth/popup-closed-by-user':
      return '로그인이 취소되었습니다.';
    case 'auth/cancelled-popup-request':
      return '이미 진행 중인 로그인 요청이 있습니다.';
    default:
      return '알 수 없는 오류가 발생했습니다.';
  }
}
```

## 9. 보안 고려사항

### 9.1 클라이언트 사이드 보안
- 민감한 정보는 클라이언트에 저장하지 않음
- 토큰 자동 갱신 처리
- 로그아웃 시 로컬 스토리지 정리

### 9.2 서버 사이드 보안 (Firestore Rules)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자 문서 - 본인만 읽기/쓰기 가능
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 공개 프로필 정보는 모든 인증된 사용자가 읽기 가능
    match /users/{userId}/public {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 10. 모니터링 및 분석
- 로그인 성공/실패율 추적
- 인증 방식별 사용률 분석
- 사용자 가입 경로 분석
- 세션 지속 시간 모니터링
