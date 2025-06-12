import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject
} from 'firebase/storage';
import type { UploadTaskSnapshot } from 'firebase/storage';
import { storage } from './firebase';
import { v4 as uuidv4 } from 'uuid';

// 지원하는 파일 타입
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
export const SUPPORTED_GIF_TYPES = ['image/gif'];
export const ALL_SUPPORTED_TYPES = [...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_GIF_TYPES];

// 파일 크기 제한 (바이트)
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_GIF_SIZE = 10 * 1024 * 1024; // 10MB

// 파일 타입 검증
export const validateFileType = (file: File): boolean => {
  return ALL_SUPPORTED_TYPES.includes(file.type);
};

// 파일 크기 검증
export const validateFileSize = (file: File): boolean => {
  if (SUPPORTED_GIF_TYPES.includes(file.type)) {
    return file.size <= MAX_GIF_SIZE;
  }
  return file.size <= MAX_IMAGE_SIZE;
};

// 파일명 생성
export const generateFileName = (originalName: string): string => {
  const ext = originalName.split('.').pop();
  const uuid = uuidv4();
  return `${uuid}.${ext}`;
};

// 업로드 결과 타입
export interface UploadResult {
  url: string;
  fileName: string;
  size: number;
  type: string;
}

// 업로드 진행률 콜백 타입
export type ProgressCallback = (progress: number) => void;

// 이미지 업로드
export const uploadImage = async (
  file: File,
  path: string = 'posts',
  onProgress?: ProgressCallback
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    // 파일 검증
    if (!validateFileType(file)) {
      reject(new Error('지원하지 않는 파일 형식입니다. (JPG, PNG, GIF만 지원)'));
      return;
    }

    if (!validateFileSize(file)) {
      const maxSize = SUPPORTED_GIF_TYPES.includes(file.type) ? '10MB' : '5MB';
      reject(new Error(`파일 크기가 너무 큽니다. 최대 ${maxSize}까지 업로드 가능합니다.`));
      return;
    }

    const fileName = generateFileName(file.name);
    const storageRef = ref(storage, `${path}/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        // 진행률 계산
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(Math.round(progress));
      },
      (error) => {
        console.error('파일 업로드 실패:', error);
        reject(new Error('파일 업로드에 실패했습니다.'));
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            url: downloadURL,
            fileName,
            size: file.size,
            type: file.type,
          });
          console.log('✅ 파일 업로드 성공:', fileName);
        } catch (error) {
          console.error('다운로드 URL 가져오기 실패:', error);
          reject(new Error('업로드는 성공했지만 URL을 가져오지 못했습니다.'));
        }
      }
    );
  });
};

// 게시글용 이미지 업로드
export const uploadPostImage = async (
  file: File,
  postId?: string,
  onProgress?: ProgressCallback
): Promise<UploadResult> => {
  const path = postId ? `posts/${postId}/images` : 'temp/images';
  return uploadImage(file, path, onProgress);
};

// 프로필 이미지 업로드
export const uploadProfileImage = async (
  file: File,
  userId: string,
  onProgress?: ProgressCallback
): Promise<UploadResult> => {
  const path = `profiles/${userId}`;
  return uploadImage(file, path, onProgress);
};

// 다중 파일 업로드
export const uploadMultipleImages = async (
  files: File[],
  path: string = 'posts',
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<UploadResult[]> => {
  const uploadPromises = files.map((file, index) => 
    uploadImage(file, path, (progress) => onProgress?.(index, progress))
  );

  try {
    const results = await Promise.all(uploadPromises);
    console.log('✅ 다중 파일 업로드 성공:', results.length);
    return results;
  } catch (error) {
    console.error('❌ 다중 파일 업로드 실패:', error);
    throw error;
  }
};

// 파일 삭제
export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
    console.log('✅ 파일 삭제 성공:', filePath);
  } catch (error) {
    console.error('❌ 파일 삭제 실패:', error);
    throw new Error('파일 삭제에 실패했습니다.');
  }
};

// URL에서 파일 경로 추출
export const extractPathFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    // Firebase Storage URL 형식에서 파일 경로 추출
    const match = path.match(/\/o\/(.+)\?/);
    return match ? decodeURIComponent(match[1]) : '';
  } catch (error) {
    console.error('URL에서 경로 추출 실패:', error);
    return '';
  }
};

// 이미지 크기 조정을 위한 Canvas 유틸리티
export const resizeImage = (
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context를 생성할 수 없습니다.'));
      return;
    }

    img.onload = () => {
      // 비율 유지하면서 크기 계산
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // 이미지 그리기
      ctx.drawImage(img, 0, 0, width, height);

      // Blob으로 변환
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('이미지 리사이징에 실패했습니다.'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('이미지 로드에 실패했습니다.'));
    };

    // 파일을 이미지로 로드
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

// 파일 크기를 읽기 쉬운 형식으로 변환
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}; 