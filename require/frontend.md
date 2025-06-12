# 프론트엔드 개발 계획

## 1. 기술 스택
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand (가벼운 상태 관리)
- **Routing**: React Router v6
- **Form Management**: React Hook Form + Zod validation
- **Firebase SDK**: v9 (modular SDK)
- **Date Handling**: date-fns
- **Icons**: Lucide React

## 2. 프로젝트 구조
```
src/
├── components/           # 재사용 가능한 컴포넌트
│   ├── ui/              # shadcn/ui 컴포넌트
│   ├── layout/          # 레이아웃 컴포넌트
│   ├── forms/           # 폼 관련 컴포넌트
│   └── common/          # 공통 컴포넌트
├── pages/               # 페이지 컴포넌트
├── hooks/               # 커스텀 훅
├── lib/                 # 유틸리티 및 설정
│   ├── firebase.ts      # Firebase 설정
│   ├── utils.ts         # 공통 유틸리티
│   └── validations.ts   # Zod 스키마
├── store/               # Zustand 스토어
├── types/               # TypeScript 타입 정의
└── styles/              # 글로벌 스타일
```

## 3. 주요 페이지 구성
- **HomePage**: 게시글 목록, 정렬 기능
- **PostDetailPage**: 게시글 상세, 댓글 시스템
- **CreatePostPage**: 게시글 작성
- **ProfilePage**: 사용자 프로필
- **ChatPage**: 1:1 채팅 목록
- **ChatRoomPage**: 개별 채팅방
- **AuthPage**: 로그인/회원가입

## 4. 컴포넌트 설계

### 4.1 레이아웃 컴포넌트
- **Header**: 네비게이션, 사용자 메뉴, 테마 토글
- **Sidebar**: 메인 메뉴 (데스크탑)
- **BottomNav**: 하단 네비게이션 (모바일)
- **Layout**: 전체 레이아웃 래퍼

### 4.2 게시글 관련 컴포넌트
- **PostCard**: 게시글 카드
- **PostList**: 게시글 목록
- **PostEditor**: 마크다운 에디터
- **CommentList**: 댓글 목록
- **CommentForm**: 댓글 작성 폼

### 4.3 채팅 관련 컴포넌트
- **ChatList**: 채팅방 목록
- **ChatRoom**: 채팅방 UI
- **MessageBubble**: 메시지 버블
- **MessageInput**: 메시지 입력

### 4.4 인증 관련 컴포넌트
- **LoginForm**: 로그인 폼
- **SignupForm**: 회원가입 폼
- **ProfileForm**: 프로필 수정 폼
- **AuthGuard**: 인증 가드 컴포넌트

## 5. 상태 관리 설계

### 5.1 Auth Store
```typescript
interface AuthStore {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: ProfileData) => Promise<void>;
}
```

### 5.2 Posts Store
```typescript
interface PostsStore {
  posts: Post[];
  currentPost: Post | null;
  loading: boolean;
  fetchPosts: (sortBy?: 'latest' | 'popular') => Promise<void>;
  createPost: (post: CreatePostData) => Promise<void>;
  updatePost: (id: string, post: UpdatePostData) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
}
```

### 5.3 Chat Store
```typescript
interface ChatStore {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  sendMessage: (chatId: string, content: string) => Promise<void>;
  createChat: (userId: string) => Promise<string>;
}
```

## 6. 반응형 디자인 브레이크포인트
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 7. 테마 시스템
- Light/Dark 모드 지원
- CSS 변수를 통한 색상 관리
- shadcn/ui 테마 시스템 활용

## 8. 성능 최적화
- React.memo를 통한 불필요한 리렌더링 방지
- 이미지 lazy loading
- 무한 스크롤 구현 (React Intersection Observer)
- Firebase 쿼리 최적화

## 9. 개발 단계별 계획

### Phase 1: 기초 설정 및 인증
- 프로젝트 초기 설정
- Firebase 연동
- 인증 시스템 구현
- 기본 레이아웃 구성

### Phase 2: 게시글 시스템
- 게시글 CRUD 기능
- 댓글 시스템
- 좋아요/북마크 기능

### Phase 3: 채팅 시스템
- 1:1 채팅 기능
- 실시간 메시지 송수신

### Phase 4: 프로필 및 추가 기능
- 사용자 프로필 관리
- 이미지 업로드
- 검색 기능

### Phase 5: 최적화 및 배포
- 성능 최적화
- 테스트 작성
- Firebase Hosting 배포
