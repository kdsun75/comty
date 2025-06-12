# Project overview

AI 정보 공유를 중심으로 한 커뮤니티 플랫폼을 구축합니다.
사용자들이 자유롭게 AI 관련 글과 정보를 작성하고 댓글을 남기며, 프로필을 설정하고 1:1로 소통할 수 있는 기능을 제공합니다.
Firebase 기반으로 백엔드를 구성하며,
프로트엔드는 react 및 shadcn/ui 라이브러리를 활용하여 현대적이고 깔끔한 UI/UX를 제공합니다.

# Core functionalities
 
2.1 사용자 인증

- firebase Authentication 기능을 사용합니다.
- google 계정 로그인 연동
- 이메일/비밀번호 로그인 기능 구현

2.2 사용자 프로필

- firebase storage를 활용한 프로필 이미지 업로드 및 수정 기능
- firestore에 사용자 정보를 저장합니다 (이메일, 닉네임, 가입날짜, 이미지 url등 필요한 정보)

2.3 게시글 시스템

- 글 작성, 수정, 삭제 기능
- 전체 글 목록 조회 및 정렬 (최신, 인기순)
- 게시글 상세 페이지 구현
- firestore를 활용 데이터 저장 및 쿼리

2.4 댓글 시스템

- firestore 서브컬렉션을 활용하여 게시글별 댓글 저장
- 댓글 작성, 수정, 삭제 기능
- 실시간 업데이트 기능

2.5 좋아요 및 북마크 기능

- firestore에 유저 id 기반으로 좋아요 및 북마크 기록을 저장합니다
- 좋아요/북마크 기능은 토글이 가능
- 각 게시물의 좋아요 수, 북마크 수 표시

2.6 1:1 채팅 기능

- firebase realtime database 사용
- 유저간 1:1 대화방 생성 및 실시간 메시지 송수신
- 채팅 UI (최근 메시지 미리보기, 타임스탬프, 읽음 안읽음 확인)

2.7 반응형 UI 및 디자인 시스템

- shadcn/ui 컴포넌트 활용
- tailwindCSS 기반으로 커스터 마이징
- 다크/라이트 모드 기능 구현
- 모바일/테블릿/데스크탑 반응형 최적화

2.8 배포

- firebase hosting

# Doc

- 프론트엔드 : react, typescript, tailwindCSS, shadcn/ui
- 백엔드 : firebase (Auth, firestore, realtime DB, Storage)
- 배포 : firebase hosting

# Project File Structure 

```
comuty/
├── public/                       # 정적 파일
│   ├── favicon.ico
│   ├── logo.png
│   └── manifest.json
│
├── src/                          # 소스 코드
│   ├── components/               # 재사용 가능한 컴포넌트
│   │   ├── ui/                  # shadcn/ui 기본 컴포넌트
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   └── index.ts
│   │   ├── layout/              # 레이아웃 컴포넌트
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── ThemeProvider.tsx
│   │   ├── auth/                # 인증 관련 컴포넌트
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   ├── GoogleLoginButton.tsx
│   │   │   ├── ResetPasswordForm.tsx
│   │   │   └── AuthGuard.tsx
│   │   ├── posts/               # 게시글 관련 컴포넌트
│   │   │   ├── PostCard.tsx
│   │   │   ├── PostList.tsx
│   │   │   ├── PostEditor.tsx
│   │   │   ├── PostDetail.tsx
│   │   │   ├── PostActions.tsx
│   │   │   └── PostSkeleton.tsx
│   │   ├── comments/            # 댓글 관련 컴포넌트
│   │   │   ├── CommentList.tsx
│   │   │   ├── CommentItem.tsx
│   │   │   ├── CommentForm.tsx
│   │   │   └── CommentActions.tsx
│   │   ├── chat/                # 채팅 관련 컴포넌트
│   │   │   ├── ChatList.tsx
│   │   │   ├── ChatRoom.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   └── ChatSidebar.tsx
│   │   ├── profile/             # 프로필 관련 컴포넌트
│   │   │   ├── ProfileCard.tsx
│   │   │   ├── ProfileForm.tsx
│   │   │   ├── ProfileImageUpload.tsx
│   │   │   └── UserProfileModal.tsx
│   │   └── common/              # 공통 컴포넌트
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       ├── ConfirmDialog.tsx
│   │       ├── ImageUpload.tsx
│   │       ├── ProgressiveImage.tsx
│   │       └── ScrollToTop.tsx
│   │
│   ├── pages/                   # 페이지 컴포넌트
│   │   ├── HomePage.tsx         # 메인 페이지 (게시글 목록)
│   │   ├── PostDetailPage.tsx   # 게시글 상세 페이지
│   │   ├── CreatePostPage.tsx   # 게시글 작성 페이지
│   │   ├── EditPostPage.tsx     # 게시글 수정 페이지
│   │   ├── ProfilePage.tsx      # 사용자 프로필 페이지
│   │   ├── ChatPage.tsx         # 채팅 목록 페이지
│   │   ├── ChatRoomPage.tsx     # 개별 채팅방 페이지
│   │   ├── AuthPage.tsx         # 로그인/회원가입 페이지
│   │   ├── SettingsPage.tsx     # 설정 페이지
│   │   └── NotFoundPage.tsx     # 404 페이지
│   │
│   ├── hooks/                   # 커스텀 훅
│   │   ├── useAuth.ts          # 인증 관련 훅
│   │   ├── usePosts.ts         # 게시글 관련 훅
│   │   ├── useComments.ts      # 댓글 관련 훅
│   │   ├── useChat.ts          # 채팅 관련 훅
│   │   ├── useFileUpload.ts    # 파일 업로드 훅
│   │   ├── useInfiniteScroll.ts # 무한 스크롤 훅
│   │   ├── useLocalStorage.ts  # 로컬 스토리지 훅
│   │   └── useDebounce.ts      # 디바운스 훅
│   │
│   ├── lib/                     # 라이브러리 및 유틸리티
│   │   ├── firebase.ts         # Firebase 설정
│   │   ├── auth.ts            # 인증 관련 함수
│   │   ├── firestore.ts       # Firestore 관련 함수
│   │   ├── realtime-db.ts     # Realtime Database 함수
│   │   ├── storage.ts         # Storage 관련 함수
│   │   ├── utils.ts           # 공통 유틸리티 함수
│   │   ├── validations.ts     # Zod 스키마 및 검증
│   │   ├── constants.ts       # 상수 정의
│   │   └── date-utils.ts      # 날짜 관련 유틸리티
│   │
│   ├── store/                   # 상태 관리 (Zustand)
│   │   ├── authStore.ts        # 인증 상태
│   │   ├── postsStore.ts       # 게시글 상태
│   │   ├── chatStore.ts        # 채팅 상태
│   │   ├── themeStore.ts       # 테마 상태
│   │   └── index.ts           # 스토어 통합
│   │
│   ├── types/                   # TypeScript 타입 정의
│   │   ├── auth.ts            # 인증 관련 타입
│   │   ├── post.ts            # 게시글 관련 타입
│   │   ├── comment.ts         # 댓글 관련 타입
│   │   ├── chat.ts            # 채팅 관련 타입
│   │   ├── user.ts            # 사용자 관련 타입
│   │   └── common.ts          # 공통 타입
│   │
│   ├── styles/                  # 스타일 파일
│   │   ├── globals.css         # 글로벌 스타일
│   │   ├── components.css      # 컴포넌트 스타일
│   │   └── themes.css          # 테마 관련 스타일
│   │
│   ├── App.tsx                 # 메인 앱 컴포넌트
│   ├── main.tsx               # 앱 진입점
│   └── vite-env.d.ts          # Vite 타입 정의
│
├── require/                     # 요구사항 문서
│   ├── prd.md                  # 제품 요구사항 문서
│   ├── frontend.md             # 프론트엔드 개발 계획
│   ├── auth.md                # 인증 시스템 설계
│   ├── realtimeDB.md          # 리얼타임 DB 구조 설계
│   └── storage.md             # 스토리지 구조 설계
│
├── docs/                       # 개발 문서
│   ├── setup.md               # 환경 설정 가이드
│   ├── deployment.md          # 배포 가이드
│   ├── api-reference.md       # API 레퍼런스
│   └── contributing.md        # 기여 가이드
│
├── .env.example               # 환경 변수 예시
├── .env.local                 # 로컬 환경 변수
├── .gitignore                 # Git 무시 파일
├── package.json               # 패키지 의존성
├── tailwind.config.js         # Tailwind CSS 설정
├── vite.config.ts            # Vite 설정
├── tsconfig.json             # TypeScript 설정
├── firebase.json             # Firebase 설정
├── .firebaserc               # Firebase 프로젝트 설정
├── firestore.rules           # Firestore 보안 규칙
├── storage.rules             # Storage 보안 규칙
├── database.rules.json       # Realtime DB 보안 규칙
└── README.md                 # 프로젝트 설명
```

## Database Structure

### Firestore Collections
```
users/                          # 사용자 정보
  {userId}/
    - uid: string
    - email: string
    - displayName: string
    - photoURL: string
    - profile: object
    - createdAt: timestamp
    - updatedAt: timestamp

posts/                          # 게시글
  {postId}/
    - id: string
    - title: string
    - content: string
    - authorId: string
    - images: array
    - likes: number
    - bookmarks: number
    - comments: number
    - createdAt: timestamp
    - updatedAt: timestamp
    
    comments/                   # 댓글 서브컬렉션
      {commentId}/
        - id: string
        - content: string
        - authorId: string
        - postId: string
        - createdAt: timestamp

likes/                          # 좋아요 기록
  {userId}/
    posts/
      {postId}: true

bookmarks/                      # 북마크 기록
  {userId}/
    posts/
      {postId}: true
```

### Realtime Database Structure
```
chats/                          # 채팅방 정보
  {chatId}/
    - participants: array
    - lastMessage: string
    - lastMessageTime: number
    - createdAt: number

messages/                       # 메시지
  {chatId}/
    {messageId}/
      - senderId: string
      - content: string
      - timestamp: number
      - type: string
      - readBy: object

userChats/                      # 사용자별 채팅방 목록
  {userId}/
    {chatId}: true
```

### Storage Structure
```
profiles/                       # 프로필 이미지
  {userId}/
    avatar.webp
    thumbnails/

posts/                          # 게시글 첨부 파일
  {postId}/
    images/
    attachments/

chat/                          # 채팅 파일
  images/
  files/
``` 