# 🔥 Firebase 설정 가이드

애플리케이션이 정상적으로 동작하려면 Firebase 프로젝트 설정이 필요합니다.

## 1단계: Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com) 방문
2. "새 프로젝트 만들기" 클릭
3. 프로젝트 이름 입력 (예: cumputy-app)
4. Google Analytics 설정 (선택사항)

## 2단계: 웹 앱 추가

1. Firebase 프로젝트 대시보드에서 "웹" 아이콘 (</>)  클릭
2. 앱 닉네임 입력
3. Firebase SDK 설정 화면에서 `firebaseConfig` 객체 복사

## 3단계: .env 파일 생성

프로젝트 루트(`comty/comuty/`)에 `.env` 파일을 생성하고 다음 내용을 추가:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**중요**: `your_`로 시작하는 값들을 실제 Firebase 설정값으로 교체하세요!

## 4단계: Firebase 서비스 활성화

### Authentication
1. Firebase Console → Authentication → 시작하기
2. Sign-in method 탭에서 활성화:
   - 이메일/비밀번호
   - Google (선택사항)

### Firestore Database
1. Firebase Console → Firestore Database → 데이터베이스 만들기
2. 보안 규칙: 테스트 모드로 시작 (나중에 수정)

### Storage
1. Firebase Console → Storage → 시작하기
2. 보안 규칙: 테스트 모드로 시작

## 5단계: 개발 서버 시작

```bash
cd comty/comuty
npm run dev
```

## 문제 해결

### 화면이 나오지 않는 경우
1. 브라우저에서 http://localhost:5173/test 접속
2. Firebase 환경 변수 상태 확인
3. 개발자 도구(F12) → Console 탭에서 오류 확인

### 일반적인 오류
- **Firebase 초기화 실패**: .env 파일의 설정값 확인
- **CORS 오류**: Firebase 프로젝트 설정에서 도메인 추가
- **권한 오류**: Firestore 보안 규칙 확인

## 추가 도움

문제가 계속되면 다음을 확인하세요:
- Node.js 버전 (18+ 권장)
- npm 또는 yarn 설치 상태  
- 방화벽/보안 프로그램 설정 