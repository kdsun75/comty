# 🗄️ Comuty 데이터베이스 구조 설계

## 📋 개요

AI 커뮤니티 플랫폼 Comuty의 데이터베이스 구조는 다음 Firebase 서비스들을 활용합니다:

- **Firebase Authentication**: 사용자 인증
- **Firestore Database**: 구조화된 데이터 저장 (사용자, 게시글, 댓글 등)
- **Realtime Database**: 실시간 데이터 (채팅, 알림)
- **Firebase Storage**: 파일 저장 (이미지, 첨부파일)

---

## 🔥 Firestore Database 구조

### 1. 사용자 컬렉션 (`users`)

```typescript
users/{userId}/
{
  // 기본 정보
  uid: string,                    // Firebase UID
  email: string,                  // 이메일 주소
  displayName: string,            // 표시 이름
  photoURL?: string,              // 프로필 이미지 URL
  
  // 가입 정보
  provider: 'email' | 'google',   // 로그인 제공자
  createdAt: Timestamp,           // 가입일
  updatedAt: Timestamp,           // 마지막 업데이트
  lastLoginAt?: Timestamp,        // 마지막 로그인
  
  // 프로필 정보
  surveyCompleted: boolean,       // 설문 완료 여부
  age?: number,                   // 나이
  gender?: 'male' | 'female' | 'other', // 성별
  occupation?: string,            // 직업
  bio?: string,                   // 자기소개
  
  // AI 관련 정보
  interests: string[],            // AI 관심 분야
  experience?: string,            // AI 경험
  goals: string[],               // AI 학습 목표
  
  // 활동 통계
  postsCount: number,            // 작성한 게시글 수
  commentsCount: number,         // 작성한 댓글 수
  likesReceived: number,         // 받은 좋아요 수
  
  // 설정
  settings: {
    notifications: {
      email: boolean,            // 이메일 알림
      push: boolean,             // 푸시 알림
      comments: boolean,         // 댓글 알림
      likes: boolean,            // 좋아요 알림
      chat: boolean,             // 채팅 알림
    },
    privacy: {
      showEmail: boolean,        // 이메일 공개
      showProfile: boolean,      // 프로필 공개
    },
    theme: 'light' | 'dark' | 'system', // 테마 설정
  },
  
  // 상태
  isActive: boolean,             // 활성 상태
  isBanned: boolean,             // 차단 상태
  banReason?: string,            // 차단 사유
  banExpiresAt?: Timestamp,      // 차단 해제일
}
```

### 2. 게시글 컬렉션 (`posts`)

```typescript
posts/{postId}/
{
  // 기본 정보
  id: string,                    // 게시글 ID
  title: string,                 // 제목
  content: string,               // 내용 (Markdown)
  excerpt: string,               // 요약 (첫 200자)
  
  // 작성자 정보
  authorId: string,              // 작성자 UID
  authorName: string,            // 작성자 이름 (캐시)
  authorPhotoURL?: string,       // 작성자 프로필 이미지 (캐시)
  
  // 카테고리 및 태그
  category: string,              // 카테고리 ('AI/ML', '딥러닝', '자연어처리' 등)
  tags: string[],               // 태그 배열
  
  // 미디어
  images: Array<{
    url: string,                 // 이미지 URL
    alt?: string,                // 대체 텍스트
    width?: number,              // 가로 크기
    height?: number,             // 세로 크기
  }>,
  
  // 통계
  viewCount: number,             // 조회수
  likeCount: number,             // 좋아요 수
  commentCount: number,          // 댓글 수
  bookmarkCount: number,         // 북마크 수
  shareCount: number,            // 공유 수
  
  // 시간 정보
  createdAt: Timestamp,          // 작성일
  updatedAt: Timestamp,          // 수정일
  publishedAt?: Timestamp,       // 게시일
  
  // 상태
  status: 'draft' | 'published' | 'archived' | 'deleted', // 게시 상태
  isPublic: boolean,             // 공개 여부
  isPinned: boolean,             // 고정 여부
  
  // SEO
  slug?: string,                 // URL 슬러그
  metaDescription?: string,      // 메타 설명
  
  // 검색 최적화
  searchKeywords: string[],      // 검색 키워드 (제목+내용에서 추출)
}
```

### 3. 댓글 서브컬렉션 (`posts/{postId}/comments`)

```typescript
posts/{postId}/comments/{commentId}/
{
  // 기본 정보
  id: string,                    // 댓글 ID
  content: string,               // 댓글 내용
  
  // 작성자 정보
  authorId: string,              // 작성자 UID
  authorName: string,            // 작성자 이름 (캐시)
  authorPhotoURL?: string,       // 작성자 프로필 이미지 (캐시)
  
  // 계층 구조
  parentId?: string,             // 부모 댓글 ID (대댓글인 경우)
  depth: number,                 // 댓글 깊이 (0: 원댓글, 1: 대댓글)
  replyCount: number,            // 대댓글 수
  
  // 통계
  likeCount: number,             // 좋아요 수
  
  // 시간 정보
  createdAt: Timestamp,          // 작성일
  updatedAt: Timestamp,          // 수정일
  
  // 상태
  isDeleted: boolean,            // 삭제 여부
  isEdited: boolean,             // 수정 여부
  
  // 관계
  postId: string,                // 게시글 ID
}
```

### 4. 좋아요 컬렉션 (`likes`)

```typescript
likes/{userId}/
{
  posts: {
    [postId]: {
      likedAt: Timestamp,        // 좋아요한 시간
      authorId: string,          // 게시글 작성자 ID
    }
  },
  comments: {
    [commentId]: {
      likedAt: Timestamp,        // 좋아요한 시간
      postId: string,            // 댓글이 속한 게시글 ID
      authorId: string,          // 댓글 작성자 ID
    }
  }
}
```

### 5. 북마크 컬렉션 (`bookmarks`)

```typescript
bookmarks/{userId}/
{
  posts: {
    [postId]: {
      bookmarkedAt: Timestamp,   // 북마크한 시간
      authorId: string,          // 게시글 작성자 ID
      title: string,             // 게시글 제목 (캐시)
      category: string,          // 카테고리 (캐시)
    }
  }
}
```

### 6. 팔로우 컬렉션 (`follows`)

```typescript
follows/{userId}/
{
  following: {
    [followedUserId]: {
      followedAt: Timestamp,     // 팔로우한 시간
      userName: string,          // 팔로우한 사용자 이름 (캐시)
      userPhotoURL?: string,     // 프로필 이미지 (캐시)
    }
  },
  followers: {
    [followerUserId]: {
      followedAt: Timestamp,     // 팔로우받은 시간
      userName: string,          // 팔로워 이름 (캐시)
      userPhotoURL?: string,     // 프로필 이미지 (캐시)
    }
  }
}
```

### 7. 알림 컬렉션 (`notifications`)

```typescript
notifications/{userId}/notifications/{notificationId}/
{
  // 기본 정보
  id: string,                    // 알림 ID
  type: 'like' | 'comment' | 'follow' | 'reply' | 'mention' | 'system',
  
  // 내용
  title: string,                 // 알림 제목
  message: string,               // 알림 메시지
  
  // 관련 정보
  fromUserId?: string,           // 알림을 보낸 사용자 ID
  fromUserName?: string,         // 보낸 사용자 이름 (캐시)
  fromUserPhotoURL?: string,     // 보낸 사용자 프로필 이미지
  
  // 링크 정보
  targetType?: 'post' | 'comment' | 'user', // 연결된 객체 타입
  targetId?: string,             // 연결된 객체 ID
  targetUrl?: string,            // 이동할 URL
  
  // 상태
  isRead: boolean,               // 읽음 여부
  
  // 시간
  createdAt: Timestamp,          // 생성일
  readAt?: Timestamp,            // 읽은 시간
}
```

---

## ⚡ Realtime Database 구조

### 1. 채팅방 (`chats`)

```typescript
chats/{chatId}/
{
  // 기본 정보
  id: string,                    // 채팅방 ID
  type: 'direct' | 'group',      // 채팅방 타입
  
  // 참여자
  participants: {
    [userId]: {
      joinedAt: number,          // 입장 시간
      lastReadAt: number,        // 마지막 읽은 시간
      userName: string,          // 사용자 이름
      userPhotoURL?: string,     // 프로필 이미지
      isActive: boolean,         // 활성 상태
    }
  },
  
  // 마지막 메시지 정보
  lastMessage: {
    content: string,             // 마지막 메시지 내용
    senderId: string,            // 보낸 사용자 ID
    senderName: string,          // 보낸 사용자 이름
    timestamp: number,           // 시간
    type: 'text' | 'image' | 'file', // 메시지 타입
  },
  
  // 통계
  messageCount: number,          // 총 메시지 수
  
  // 시간 정보
  createdAt: number,             // 생성 시간
  updatedAt: number,             // 마지막 업데이트
  
  // 설정
  settings: {
    notifications: boolean,      // 알림 설정
  }
}
```

### 2. 메시지 (`messages`)

```typescript
messages/{chatId}/{messageId}/
{
  // 기본 정보
  id: string,                    // 메시지 ID
  content: string,               // 메시지 내용
  
  // 발신자 정보
  senderId: string,              // 보낸 사용자 ID
  senderName: string,            // 보낸 사용자 이름
  senderPhotoURL?: string,       // 프로필 이미지
  
  // 메시지 타입
  type: 'text' | 'image' | 'file' | 'system', // 메시지 타입
  
  // 미디어 정보 (type이 'image' 또는 'file'인 경우)
  media?: {
    url: string,                 // 파일 URL
    fileName?: string,           // 파일명
    fileSize?: number,           // 파일 크기
    mimeType?: string,           // MIME 타입
    width?: number,              // 이미지 가로 크기
    height?: number,             // 이미지 세로 크기
  },
  
  // 읽음 상태
  readBy: {
    [userId]: number,            // 읽은 시간
  },
  
  // 시간 정보
  timestamp: number,             // 메시지 시간
  
  // 상태
  isDeleted: boolean,            // 삭제 여부
  isEdited: boolean,             // 수정 여부
  editedAt?: number,             // 수정 시간
  
  // 답장 정보
  replyTo?: {
    messageId: string,           // 답장 대상 메시지 ID
    content: string,             // 원본 메시지 내용 (미리보기)
    senderId: string,            // 원본 발신자 ID
    senderName: string,          // 원본 발신자 이름
  }
}
```

### 3. 사용자별 채팅 목록 (`userChats`)

```typescript
userChats/{userId}/
{
  [chatId]: {
    lastMessageAt: number,       // 마지막 메시지 시간
    unreadCount: number,         // 읽지 않은 메시지 수
    lastReadAt: number,          // 마지막 읽은 시간
    isPinned: boolean,           // 고정 여부
    isMuted: boolean,            // 음소거 여부
    
    // 상대방 정보 (Direct 채팅인 경우)
    otherUser?: {
      id: string,                // 상대방 ID
      name: string,              // 상대방 이름
      photoURL?: string,         // 프로필 이미지
      isOnline: boolean,         // 온라인 상태
      lastSeenAt?: number,       // 마지막 접속 시간
    }
  }
}
```

### 4. 온라인 상태 (`presence`)

```typescript
presence/{userId}/
{
  isOnline: boolean,             // 온라인 여부
  lastSeenAt: number,            // 마지막 접속 시간
  currentActivity?: string,      // 현재 활동 ('browsing', 'chatting', 'writing')
}
```

---

## 📁 Firebase Storage 구조

### 1. 프로필 이미지

```
profiles/
  {userId}/
    avatar.webp              # 원본 프로필 이미지
    avatar_200x200.webp      # 200x200 썸네일
    avatar_50x50.webp        # 50x50 썸네일
```

### 2. 게시글 첨부파일

```
posts/
  {postId}/
    images/
      original/
        {imageId}.webp       # 원본 이미지
      thumbnails/
        {imageId}_400x300.webp  # 썸네일
        {imageId}_800x600.webp  # 중간 크기
    attachments/
      {fileId}_{originalName} # 첨부파일
```

### 3. 채팅 파일

```
chat/
  {chatId}/
    images/
      {messageId}/
        original.webp        # 원본 이미지
        thumbnail.webp       # 썸네일
    files/
      {messageId}_{originalName} # 채팅 파일
```

### 4. 임시 업로드

```
temp/
  {userId}/
    {sessionId}/
      {tempFileId}           # 임시 파일 (24시간 후 자동 삭제)
```

---

## 🔒 보안 규칙

### Firestore Rules 예시

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자 문서: 본인만 수정 가능, 모든 사용자 읽기 가능
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 게시글: 인증된 사용자만 작성, 모든 사용자 읽기 가능
    match /posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.authorId;
    }
    
    // 댓글: 인증된 사용자만 작성
    match /posts/{postId}/comments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.authorId;
    }
    
    // 좋아요/북마크: 본인 것만 관리 가능
    match /likes/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /bookmarks/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 📊 인덱스 설계

### 필수 복합 인덱스

```typescript
// 게시글 정렬 및 필터링
posts: [
  ['status', 'createdAt'],      // 상태별 최신순
  ['category', 'createdAt'],    // 카테고리별 최신순
  ['authorId', 'createdAt'],    // 작성자별 최신순
  ['likeCount', 'createdAt'],   // 인기순
  ['tags', 'createdAt'],        // 태그별 최신순
]

// 댓글 정렬
comments: [
  ['postId', 'createdAt'],      // 게시글별 댓글 순서
  ['authorId', 'createdAt'],    // 작성자별 댓글
]

// 알림 정렬
notifications: [
  ['userId', 'createdAt'],      // 사용자별 알림 최신순
  ['userId', 'isRead', 'createdAt'], // 읽지 않은 알림
]
```

---

## 🔄 데이터 동기화 전략

### 1. 캐시된 데이터 관리

자주 변경되지 않는 데이터는 관련 문서에 캐시하여 성능을 향상시킵니다:

- 게시글에 작성자 정보 캐시 (`authorName`, `authorPhotoURL`)
- 댓글에 작성자 정보 캐시
- 북마크에 게시글 정보 캐시

### 2. 계산된 필드 업데이트

Cloud Functions를 사용하여 계산된 필드들을 자동으로 업데이트합니다:

- 게시글의 댓글 수, 좋아요 수
- 사용자의 게시글 수, 팔로워 수
- 채팅방의 읽지 않은 메시지 수

### 3. 실시간 업데이트

- 채팅 메시지: Realtime Database로 즉시 동기화
- 온라인 상태: Presence 시스템으로 실시간 관리
- 알림: Firestore 실시간 리스너로 즉시 업데이트

---

## 📈 성능 최적화

### 1. 페이지네이션

- 게시글 목록: 페이지당 20개 제한
- 댓글 목록: 페이지당 50개 제한
- 채팅 메시지: 초기 로드 50개, 스크롤 시 추가 로드

### 2. 데이터 프리페칭

- 게시글 목록에서 작성자 정보 미리 로드
- 채팅 목록에서 마지막 메시지 정보 캐시

### 3. 오프라인 지원

- Firestore 오프라인 지속성 활성화
- 중요한 데이터 로컬 캐싱
- 네트워크 재연결 시 자동 동기화

이 데이터베이스 구조는 확장 가능하고 성능이 최적화된 AI 커뮤니티 플랫폼을 구축하기 위해 설계되었습니다.
