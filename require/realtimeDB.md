# 리얼타임 데이터베이스 구조 설계

## 1. Firebase Realtime Database 개요
- 실시간 데이터 동기화를 위해 Firebase Realtime Database 사용
- JSON 기반 NoSQL 데이터베이스
- 오프라인 지원 및 실시간 리스너 기능 제공

## 2. 데이터베이스 구조

### 2.1 전체 구조 개요
```json
{
  "chats": {
    "chatId": {
      "participants": ["userId1", "userId2"],
      "lastMessage": "마지막 메시지 내용",
      "lastMessageTime": 1640995200000,
      "lastMessageSender": "userId1",
      "createdAt": 1640995200000,
      "updatedAt": 1640995200000
    }
  },
  "messages": {
    "chatId": {
      "messageId": {
        "senderId": "userId1",
        "content": "메시지 내용",
        "timestamp": 1640995200000,
        "type": "text", // text, image, file
        "readBy": {
          "userId1": 1640995200000,
          "userId2": 1640995210000
        }
      }
    }
  },
  "userChats": {
    "userId1": {
      "chatId1": true,
      "chatId2": true
    },
    "userId2": {
      "chatId1": true,
      "chatId3": true
    }
  }
}
```

### 2.2 채팅방 (chats) 구조
```typescript
interface Chat {
  chatId: string;
  participants: string[]; // 참여자 userId 배열
  lastMessage: string;
  lastMessageTime: number;
  lastMessageSender: string;
  createdAt: number;
  updatedAt: number;
  unreadCount?: {
    [userId: string]: number;
  };
}
```

### 2.3 메시지 (messages) 구조
```typescript
interface Message {
  messageId: string;
  senderId: string;
  content: string;
  timestamp: number;
  type: 'text' | 'image' | 'file';
  readBy: {
    [userId: string]: number; // 읽은 시간
  };
  fileUrl?: string; // 파일 타입일 경우
  fileName?: string; // 파일 타입일 경우
  fileSize?: number; // 파일 타입일 경우
}
```

### 2.4 사용자 채팅 목록 (userChats) 구조
- 각 사용자가 참여하고 있는 채팅방 목록을 빠르게 조회하기 위한 인덱스
- 채팅방 생성/삭제 시 함께 업데이트

## 3. 데이터베이스 규칙 (Security Rules)

### 3.1 기본 보안 규칙
```json
{
  "rules": {
    "chats": {
      "$chatId": {
        ".read": "auth != null && (data.child('participants').child(auth.uid).exists())",
        ".write": "auth != null && (data.child('participants').child(auth.uid).exists() || !data.exists())"
      }
    },
    "messages": {
      "$chatId": {
        ".read": "auth != null && root.child('chats').child($chatId).child('participants').child(auth.uid).exists()",
        "$messageId": {
          ".write": "auth != null && root.child('chats').child($chatId).child('participants').child(auth.uid).exists() && newData.child('senderId').val() == auth.uid"
        }
      }
    },
    "userChats": {
      "$userId": {
        ".read": "auth != null && auth.uid == $userId",
        ".write": "auth != null && auth.uid == $userId"
      }
    }
  }
}
```

## 4. 주요 기능 구현

### 4.1 채팅방 생성
```typescript
async function createChat(currentUserId: string, targetUserId: string): Promise<string> {
  const chatId = generateChatId(currentUserId, targetUserId);
  
  const chatData: Chat = {
    chatId,
    participants: [currentUserId, targetUserId],
    lastMessage: '',
    lastMessageTime: Date.now(),
    lastMessageSender: '',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  // 채팅방 생성
  await database.ref(`chats/${chatId}`).set(chatData);
  
  // 각 사용자의 채팅 목록에 추가
  await database.ref(`userChats/${currentUserId}/${chatId}`).set(true);
  await database.ref(`userChats/${targetUserId}/${chatId}`).set(true);
  
  return chatId;
}
```

### 4.2 메시지 전송
```typescript
async function sendMessage(chatId: string, senderId: string, content: string, type: string = 'text') {
  const messageId = database.ref(`messages/${chatId}`).push().key;
  const timestamp = Date.now();
  
  const messageData: Message = {
    messageId: messageId!,
    senderId,
    content,
    timestamp,
    type: type as any,
    readBy: {
      [senderId]: timestamp
    }
  };

  // 메시지 저장
  await database.ref(`messages/${chatId}/${messageId}`).set(messageData);
  
  // 채팅방 정보 업데이트
  await database.ref(`chats/${chatId}`).update({
    lastMessage: content,
    lastMessageTime: timestamp,
    lastMessageSender: senderId,
    updatedAt: timestamp
  });
}
```

### 4.3 실시간 메시지 수신
```typescript
function subscribeToMessages(chatId: string, callback: (messages: Message[]) => void) {
  const messagesRef = database.ref(`messages/${chatId}`);
  
  messagesRef.on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const messages = Object.values(data) as Message[];
      messages.sort((a, b) => a.timestamp - b.timestamp);
      callback(messages);
    }
  });
  
  return () => messagesRef.off();
}
```

### 4.4 채팅방 목록 조회
```typescript
function subscribeToUserChats(userId: string, callback: (chats: Chat[]) => void) {
  const userChatsRef = database.ref(`userChats/${userId}`);
  
  userChatsRef.on('value', async (snapshot) => {
    const chatIds = Object.keys(snapshot.val() || {});
    
    if (chatIds.length > 0) {
      const chatsPromises = chatIds.map(chatId => 
        database.ref(`chats/${chatId}`).once('value').then(snap => snap.val())
      );
      
      const chats = await Promise.all(chatsPromises);
      chats.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
      callback(chats);
    } else {
      callback([]);
    }
  });
}
```

## 5. 최적화 및 성능 고려사항

### 5.1 메시지 페이지네이션
- 초기 로드 시 최근 50개 메시지만 로드
- 스크롤 시 추가 메시지 로드
- `limitToLast()` 및 `endAt()` 사용

### 5.2 연결 상태 관리
```typescript
// 사용자 온라인 상태 관리
const connectedRef = database.ref('.info/connected');
connectedRef.on('value', (snapshot) => {
  if (snapshot.val() === true) {
    // 온라인 상태 업데이트
    database.ref(`users/${userId}/lastSeen`).onDisconnect().set(Date.now());
    database.ref(`users/${userId}/online`).set(true);
    database.ref(`users/${userId}/online`).onDisconnect().set(false);
  }
});
```

### 5.3 데이터 크기 최적화
- 메시지 내용 길이 제한 (1000자)
- 불필요한 필드 최소화
- 이미지/파일은 Storage 사용, URL만 저장

## 6. 에러 처리 및 복구

### 6.1 연결 실패 처리
- 오프라인 상태에서 메시지 임시 저장
- 연결 복구 시 자동 동기화

### 6.2 중복 메시지 방지
- 메시지 ID 기반 중복 체크
- 클라이언트 사이드 디바운싱

## 7. 모니터링 및 분석
- 메시지 전송 성공률 추적
- 평균 응답 시간 모니터링
- 동시 접속자 수 추적
