# 🔥 Firebase 설정 가이드

## 🚨 현재 문제: Google 로그인 실패

**원인**: Firebase 환경 변수가 설정되지 않음 (`.env` 파일의 placeholder 값들)

## 📋 Firebase 설정 단계

### 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. **"프로젝트 추가"** 클릭
3. 프로젝트 이름 입력 (예: `comuty-project`)
4. Google Analytics 설정 (선택사항)
5. 프로젝트 생성 완료

### 2. Authentication 설정

1. Firebase 콘솔에서 **"Authentication"** 메뉴 선택
2. **"시작하기"** 클릭
3. **"Sign-in method"** 탭 선택
4. **"Google"** 제공업체 선택
5. **"사용 설정"** 토글 활성화
6. **프로젝트 지원 이메일** 입력
7. **"저장"** 클릭

### 3. 웹 앱 추가

1. 프로젝트 개요에서 **"웹 앱 추가"** (</> 아이콘) 클릭
2. 앱 닉네임 입력 (예: `comuty-web`)
3. **"앱 등록"** 클릭
4. **Firebase SDK 구성 정보 복사**

### 4. 환경 변수 설정

복사한 Firebase 설정을 `.env` 파일에 입력:

```env
# 예시 - 실제 값으로 교체하세요
VITE_FIREBASE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=your-project-12345.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-12345-default-rtdb.firebaseio.com/
VITE_FIREBASE_PROJECT_ID=your-project-12345
VITE_FIREBASE_STORAGE_BUCKET=your-project-12345.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789012345
```

### 5. Firestore 데이터베이스 설정

1. Firebase 콘솔에서 **"Firestore Database"** 선택
2. **"데이터베이스 만들기"** 클릭
3. **"테스트 모드로 시작"** 선택 (개발용)
4. 위치 선택 (asia-northeast3 - 서울)
5. **"완료"** 클릭

## 🔍 문제 해결

### Google 로그인 버튼 클릭 시 확인사항

1. **브라우저 개발자 도구** (F12) 열기
2. **Console 탭** 확인
3. 다음과 같은 오류 메시지 확인:

```
❌ Firebase 설정 오류: Firebase 환경 변수가 설정되지 않았습니다.
```

### 자주 발생하는 오류

| 오류 코드 | 원인 | 해결 방법 |
|----------|------|----------|
| `auth/invalid-api-key` | API 키가 잘못됨 | `.env` 파일의 `VITE_FIREBASE_API_KEY` 확인 |
| `auth/operation-not-allowed` | Google 로그인 비활성화 | Firebase 콘솔에서 Google 로그인 활성화 |
| `auth/app-not-authorized` | 도메인 권한 없음 | Firebase 콘솔에서 승인된 도메인 추가 |

## ✅ 설정 완료 확인

1. 서버 재시작: `npm run dev`
2. 브라우저에서 로그인 페이지 접속
3. Google 로그인 버튼 클릭
4. Google 계정 선택 팝업 표시 확인
5. 로그인 성공 후 설문 페이지로 이동 확인

## 🔗 유용한 링크

- [Firebase 공식 문서](https://firebase.google.com/docs)
- [Firebase Authentication 가이드](https://firebase.google.com/docs/auth)
- [React Firebase 가이드](https://firebase.google.com/docs/web/setup) 