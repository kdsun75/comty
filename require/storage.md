# 스토리지 기능 및 구조 설계

## 1. Firebase Storage 개요
- 구글 클라우드 스토리지 기반의 파일 저장 서비스
- 이미지, 동영상, 오디오 등 다양한 미디어 파일 지원
- 자동 리사이징 및 최적화 기능
- CDN을 통한 빠른 파일 전송

## 2. 스토리지 구조 설계

### 2.1 폴더 구조
```
storage/
├── profiles/                    # 프로필 이미지
│   ├── {userId}/
│   │   ├── avatar.jpg
│   │   └── thumbnails/
│   │       ├── avatar_128x128.jpg
│   │       ├── avatar_256x256.jpg
│   │       └── avatar_512x512.jpg
├── posts/                       # 게시글 관련 파일
│   ├── {postId}/
│   │   ├── images/
│   │   │   ├── {imageId}.jpg
│   │   │   └── thumbnails/
│   │   │       ├── {imageId}_small.jpg
│   │   │       ├── {imageId}_medium.jpg
│   │   │       └── {imageId}_large.jpg
│   │   └── attachments/
│   │       └── {fileId}.{ext}
├── chat/                        # 채팅 관련 파일
│   ├── images/
│   │   ├── {chatId}/
│   │   │   └── {messageId}.jpg
│   └── files/
│       └── {chatId}/
│           └── {messageId}.{ext}
└── temp/                        # 임시 파일 (24시간 후 자동 삭제)
    └── {userId}/
        └── {fileName}
```

### 2.2 파일 명명 규칙
- **프로필 이미지**: `profiles/{userId}/avatar.{ext}`
- **게시글 이미지**: `posts/{postId}/images/{timestamp}_{random}.{ext}`
- **게시글 첨부파일**: `posts/{postId}/attachments/{timestamp}_{originalName}`
- **채팅 이미지**: `chat/images/{chatId}/{messageId}.{ext}`
- **채팅 파일**: `chat/files/{chatId}/{messageId}_{originalName}`

## 3. 파일 타입별 정책

### 3.1 프로필 이미지
```typescript
interface ProfileImageConfig {
  maxSize: 5 * 1024 * 1024; // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'];
  thumbnailSizes: [128, 256, 512]; // px
  quality: 0.85;
  format: 'webp'; // 최적화된 포맷으로 변환
}
```

### 3.2 게시글 이미지
```typescript
interface PostImageConfig {
  maxSize: 10 * 1024 * 1024; // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  maxImagesPerPost: 10;
  thumbnailSizes: [400, 800, 1200]; // small, medium, large
  quality: 0.8;
}
```

### 3.3 채팅 파일
```typescript
interface ChatFileConfig {
  maxSize: 20 * 1024 * 1024; // 20MB
  allowedTypes: [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf', 'text/plain',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  imageQuality: 0.8;
}
```

## 4. 보안 규칙 (Security Rules)

### 4.1 Firebase Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 프로필 이미지 - 본인만 업로드/수정 가능, 모든 인증된 사용자 읽기 가능
    match /profiles/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId
                   && isValidImageFile()
                   && resource.size < 5 * 1024 * 1024;
    }
    
    // 게시글 파일 - 작성자만 업로드, 모든 인증된 사용자 읽기
    match /posts/{postId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
                   && isValidContentFile()
                   && resource.size < 10 * 1024 * 1024;
    }
    
    // 채팅 파일 - 채팅 참여자만 업로드/읽기
    match /chat/{type}/{chatId}/{allPaths=**} {
      allow read, write: if request.auth != null
                         && isChatParticipant(chatId, request.auth.uid)
                         && isValidChatFile()
                         && resource.size < 20 * 1024 * 1024;
    }
    
    // 임시 파일 - 본인만 접근
    match /temp/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 헬퍼 함수들
    function isValidImageFile() {
      return request.resource.contentType.matches('image/.*');
    }
    
    function isValidContentFile() {
      return request.resource.contentType.matches('image/.*') ||
             request.resource.contentType.matches('application/.*') ||
             request.resource.contentType.matches('text/.*');
    }
    
    function isValidChatFile() {
      return isValidContentFile();
    }
    
    function isChatParticipant(chatId, userId) {
      return firestore.get(/databases/(default)/documents/chats/$(chatId)).data.participants.hasAll([userId]);
    }
  }
}
```

## 5. 파일 업로드 구현

### 5.1 프로필 이미지 업로드
```typescript
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

async function uploadProfileImage(
  userId: string, 
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  // 파일 검증
  if (!validateImageFile(file, ProfileImageConfig)) {
    throw new Error('Invalid file format or size');
  }

  // 리사이징 및 최적화
  const optimizedFile = await optimizeImage(file, {
    maxWidth: 1024,
    maxHeight: 1024,
    quality: 0.85,
    format: 'webp'
  });

  const storageRef = ref(storage, `profiles/${userId}/avatar.webp`);
  const uploadTask = uploadBytesResumable(storageRef, optimizedFile);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(progress);
      },
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        // 썸네일 생성
        await generateThumbnails(userId, optimizedFile, ProfileImageConfig.thumbnailSizes);
        
        resolve(downloadURL);
      }
    );
  });
}
```

### 5.2 게시글 이미지 업로드
```typescript
async function uploadPostImages(
  postId: string,
  files: File[],
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<string[]> {
  if (files.length > PostImageConfig.maxImagesPerPost) {
    throw new Error(`Maximum ${PostImageConfig.maxImagesPerPost} images allowed`);
  }

  const uploadPromises = files.map(async (file, index) => {
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.webp`;
    const storageRef = ref(storage, `posts/${postId}/images/${fileName}`);
    
    const optimizedFile = await optimizeImage(file, {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.8,
      format: 'webp'
    });

    const uploadTask = uploadBytesResumable(storageRef, optimizedFile);
    
    return new Promise<string>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(index, progress);
        },
        (error) => reject(error),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          // 썸네일 생성
          await generateThumbnails(
            `posts/${postId}/images/${fileName}`, 
            optimizedFile, 
            PostImageConfig.thumbnailSizes
          );
          
          resolve(downloadURL);
        }
      );
    });
  });

  return Promise.all(uploadPromises);
}
```

### 5.3 채팅 파일 업로드
```typescript
async function uploadChatFile(
  chatId: string,
  messageId: string,
  file: File,
  type: 'image' | 'file',
  onProgress?: (progress: number) => void
): Promise<{url: string, metadata: FileMetadata}> {
  
  const fileName = type === 'image' 
    ? `${messageId}.webp`
    : `${messageId}_${file.name}`;
    
  const storageRef = ref(storage, `chat/${type}s/${chatId}/${fileName}`);
  
  let uploadFile = file;
  if (type === 'image') {
    uploadFile = await optimizeImage(file, {
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 0.8,
      format: 'webp'
    });
  }

  const uploadTask = uploadBytesResumable(storageRef, uploadFile);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(progress);
      },
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        const metadata: FileMetadata = {
          name: file.name,
          size: file.size,
          type: file.type,
          url: downloadURL
        };
        
        resolve({ url: downloadURL, metadata });
      }
    );
  });
}
```

## 6. 이미지 최적화 및 썸네일 생성

### 6.1 클라이언트 사이드 이미지 최적화
```typescript
async function optimizeImage(
  file: File, 
  options: {
    maxWidth: number;
    maxHeight: number;
    quality: number;
    format: 'webp' | 'jpeg' | 'png';
  }
): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      // 비율 유지하면서 리사이징
      const { width, height } = calculateDimensions(
        img.width, 
        img.height, 
        options.maxWidth, 
        options.maxHeight
      );

      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          const optimizedFile = new File([blob!], file.name, {
            type: `image/${options.format}`,
            lastModified: Date.now()
          });
          resolve(optimizedFile);
        },
        `image/${options.format}`,
        options.quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
}
```

### 6.2 썸네일 생성
```typescript
async function generateThumbnails(
  basePath: string,
  file: File,
  sizes: number[]
): Promise<void> {
  const thumbnailPromises = sizes.map(async (size) => {
    const thumbnail = await optimizeImage(file, {
      maxWidth: size,
      maxHeight: size,
      quality: 0.8,
      format: 'webp'
    });

    const thumbnailRef = ref(storage, `${basePath}/thumbnails/${size}x${size}.webp`);
    await uploadBytes(thumbnailRef, thumbnail);
  });

  await Promise.all(thumbnailPromises);
}
```

## 7. 파일 메타데이터 관리

### 7.1 Firestore에 파일 정보 저장
```typescript
interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnails?: {
    [size: string]: string; // 썸네일 URL
  };
  uploadedAt: number;
  uploadedBy: string;
}

// Firestore에 메타데이터 저장
async function saveFileMetadata(
  collection: string,
  docId: string,
  fileMetadata: FileMetadata
): Promise<void> {
  await firestore
    .collection(collection)
    .doc(docId)
    .collection('files')
    .doc(fileMetadata.id)
    .set(fileMetadata);
}
```

## 8. 파일 삭제 및 정리

### 8.1 파일 삭제
```typescript
async function deleteFile(filePath: string): Promise<void> {
  const fileRef = ref(storage, filePath);
  await deleteObject(fileRef);
  
  // 썸네일도 함께 삭제
  const thumbnailSizes = [128, 256, 512];
  const deletePromises = thumbnailSizes.map(size => {
    const thumbnailRef = ref(storage, `${filePath}/thumbnails/${size}x${size}.webp`);
    return deleteObject(thumbnailRef).catch(() => {}); // 에러 무시
  });
  
  await Promise.all(deletePromises);
}
```

### 8.2 임시 파일 정리 (Cloud Functions)
```typescript
// 24시간 후 임시 파일 자동 삭제
export const cleanupTempFiles = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const tempRef = ref(storage, 'temp/');
    const list = await listAll(tempRef);
    
    const deletePromises = list.items
      .filter(item => {
        const timeCreated = new Date(item.timeCreated);
        const hoursDiff = (Date.now() - timeCreated.getTime()) / (1000 * 60 * 60);
        return hoursDiff > 24;
      })
      .map(item => deleteObject(item));
    
    await Promise.all(deletePromises);
  });
```

## 9. 성능 최적화

### 9.1 지연 로딩 및 캐싱
- 이미지 lazy loading 구현
- 브라우저 캐싱 활용
- CDN을 통한 전 세계 배포

### 9.2 Progressive 이미지 로딩
```typescript
function ProgressiveImage({ src, alt, className }: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [thumbnailSrc, setThumbnailSrc] = useState('');

  useEffect(() => {
    // 작은 썸네일을 먼저 로드
    const thumbnailUrl = src.replace('/images/', '/images/thumbnails/400x400_');
    setThumbnailSrc(thumbnailUrl);
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* 썸네일 (블러 처리) */}
      <img
        src={thumbnailSrc}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 filter blur-sm ${
          imageLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      />
      
      {/* 실제 이미지 */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setImageLoaded(true)}
      />
    </div>
  );
}
```

## 10. 모니터링 및 분석
- 파일 업로드 성공률 추적
- 평균 업로드 시간 모니터링
- 스토리지 사용량 분석
- 대역폭 사용량 최적화
