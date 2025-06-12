// 유튜브 링크 처리
export interface YouTubeVideoInfo {
  videoId: string;
  title?: string;
  thumbnail?: string;
  embedUrl: string;
  originalUrl: string;
}

// 유튜브 URL에서 비디오 ID 추출
export const extractYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
};

// 유튜브 비디오 정보 가져오기
export const getYouTubeVideoInfo = async (url: string): Promise<YouTubeVideoInfo | null> => {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;

  try {
    // YouTube oEmbed API 사용
    const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oEmbedUrl);
    
    if (!response.ok) {
      throw new Error('YouTube API 요청 실패');
    }

    const data = await response.json();
    
    return {
      videoId,
      title: data.title,
      thumbnail: data.thumbnail_url,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      originalUrl: url,
    };
  } catch (error) {
    console.error('YouTube 비디오 정보 가져오기 실패:', error);
    return {
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      originalUrl: url,
    };
  }
};

// 유튜브 URL 검증
export const isYouTubeUrl = (url: string): boolean => {
  return extractYouTubeVideoId(url) !== null;
};

// URL 미리보기 정보
export interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
}

// 일반 URL 미리보기 정보 가져오기
export const getLinkPreview = async (url: string): Promise<LinkPreview | null> => {
  try {
    // CORS 문제로 직접 요청이 어려우므로 클라이언트에서는 기본 정보만 제공
    // 실제 운영 환경에서는 백엔드 API를 통해 메타데이터를 가져와야 함
    
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');
    
    return {
      url,
      title: domain,
      description: url,
      siteName: domain,
      favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
    };
  } catch (error) {
    console.error('링크 미리보기 생성 실패:', error);
    return {
      url,
      title: url,
    };
  }
};

// URL 형식 검증
export const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// 텍스트에서 URL 추출
export const extractUrls = (text: string): string[] => {
  const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/gi;
  const matches = text.match(urlRegex);
  return matches ? matches.filter(isValidUrl) : [];
};

// 링크를 클릭 가능한 HTML로 변환
export const linkifyText = (text: string): string => {
  const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/gi;
  return text.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${url}</a>`;
  });
};

// 이미지 URL 검증
export const isImageUrl = (url: string): boolean => {
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
  try {
    const urlObj = new URL(url);
    return imageExtensions.test(urlObj.pathname);
  } catch {
    return false;
  }
};

// 미디어 타입 감지
export const detectMediaType = (url: string): 'youtube' | 'image' | 'link' | 'unknown' => {
  if (isYouTubeUrl(url)) return 'youtube';
  if (isImageUrl(url)) return 'image';
  if (isValidUrl(url)) return 'link';
  return 'unknown';
};

// 에디터용 블록 타입
export interface MediaBlock {
  id: string;
  type: 'text' | 'image' | 'youtube' | 'link';
  content: string;
  metadata?: {
    youtube?: YouTubeVideoInfo;
    link?: LinkPreview;
    image?: {
      url: string;
      alt?: string;
      width?: number;
      height?: number;
    };
  };
  order: number;
}

// 블록 생성 헬퍼
export const createTextBlock = (content: string, order: number): MediaBlock => ({
  id: `text-${Date.now()}-${Math.random()}`,
  type: 'text',
  content,
  order,
});

export const createImageBlock = (
  url: string,
  alt: string = '',
  order: number,
  width?: number,
  height?: number
): MediaBlock => ({
  id: `image-${Date.now()}-${Math.random()}`,
  type: 'image',
  content: url,
  metadata: {
    image: { url, alt, width, height },
  },
  order,
});

export const createYouTubeBlock = (
  videoInfo: YouTubeVideoInfo,
  order: number
): MediaBlock => ({
  id: `youtube-${Date.now()}-${Math.random()}`,
  type: 'youtube',
  content: videoInfo.originalUrl,
  metadata: {
    youtube: videoInfo,
  },
  order,
});

export const createLinkBlock = (
  linkPreview: LinkPreview,
  order: number
): MediaBlock => ({
  id: `link-${Date.now()}-${Math.random()}`,
  type: 'link',
  content: linkPreview.url,
  metadata: {
    link: linkPreview,
  },
  order,
}); 