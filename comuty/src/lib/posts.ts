import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  increment,
  Timestamp,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db, isFirebaseInitialized } from './firebase-safe';

// 게시글 타입 정의
export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  category: string;
  tags: string[];
  images: Array<{
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  }>;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  shareCount: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  status: 'draft' | 'published' | 'archived' | 'deleted';
  isPublic: boolean;
  isPinned: boolean;
  slug?: string;
  metaDescription?: string;
  searchKeywords: string[];
}

export interface CreatePostData {
  title: string;
  content: string;
  category: string;
  tags: string[];
  images?: Array<{
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  }>;
  isPublic?: boolean;
  isPublished?: boolean;
  allowComments?: boolean;
  featuredImage?: string;
  status?: 'draft' | 'published';
  metaDescription?: string;
}

// 카테고리 상수
export const POST_CATEGORIES = [
  { value: 'ai-ml', label: 'AI/머신러닝' },
  { value: 'deep-learning', label: '딥러닝' },
  { value: 'nlp', label: '자연어처리' },
  { value: 'computer-vision', label: '컴퓨터 비전' },
  { value: 'robotics', label: '로보틱스' },
  { value: 'ai-ethics', label: 'AI 윤리' },
  { value: 'generative-ai', label: '생성형 AI' },
  { value: 'ai-tools', label: 'AI 개발도구' },
  { value: 'ai-business', label: 'AI 비즈니스' },
  { value: 'data-science', label: '데이터 사이언스' },
  { value: 'other', label: '기타' }
];

export type PostCategory = typeof POST_CATEGORIES[number];

// 게시글 생성
export const createPost = async (
  postData: CreatePostData,
  authorId: string,
  authorName: string,
  authorPhotoURL?: string
): Promise<string> => {
  try {
    // 요약 생성 (첫 200자)
    const excerpt = postData.content.substring(0, 200).replace(/[#*`]/g, '').trim();
    
    // 검색 키워드 생성
    const searchKeywords = [
      ...postData.title.toLowerCase().split(' '),
      ...postData.tags.map(tag => tag.toLowerCase()),
      postData.category.toLowerCase()
    ].filter(keyword => keyword.length > 1);
    
    // 슬러그 생성
    const slug = postData.title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);

    const now = new Date();
    
    const newPost: Omit<Post, 'id'> = {
      title: postData.title,
      content: postData.content,
      excerpt,
      authorId,
      authorName,
      authorPhotoURL,
      category: postData.category,
      tags: postData.tags,
      images: postData.images || [],
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      bookmarkCount: 0,
      shareCount: 0,
      createdAt: now,
      updatedAt: now,
      publishedAt: postData.status === 'published' ? now : undefined,
      status: postData.status || 'published',
      isPublic: postData.isPublic !== false,
      isPinned: false,
      slug: `${slug}-${Date.now()}`,
      metaDescription: postData.metaDescription || excerpt,
      searchKeywords
    };

    const docRef = await addDoc(collection(db, 'posts'), newPost);
    console.log('✅ 게시글 생성 성공:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('❌ 게시글 생성 실패:', error);
    throw error;
  }
};

// 게시글 목록 조회
export const getPosts = async (
  options: {
    category?: string;
    authorId?: string;
    limit?: number;
    lastDoc?: QueryDocumentSnapshot;
    sortBy?: 'latest' | 'popular' | 'trending';
  } = {}
): Promise<{ posts: Post[]; lastDoc: QueryDocumentSnapshot | null }> => {
  try {
    const { 
      category, 
      authorId, 
      limit: limitCount = 20, 
      lastDoc, 
      sortBy = 'latest' 
    } = options;

    let q = query(collection(db, 'posts'));

    // 필터 조건 추가
    q = query(q, where('status', '==', 'published'));
    q = query(q, where('isPublic', '==', true));

    if (category && category !== '전체') {
      q = query(q, where('category', '==', category));
    }

    if (authorId) {
      q = query(q, where('authorId', '==', authorId));
    }

    // 정렬 조건 추가
    switch (sortBy) {
      case 'popular':
        q = query(q, orderBy('likeCount', 'desc'), orderBy('createdAt', 'desc'));
        break;
      case 'trending':
        q = query(q, orderBy('viewCount', 'desc'), orderBy('createdAt', 'desc'));
        break;
      case 'latest':
      default:
        q = query(q, orderBy('createdAt', 'desc'));
        break;
    }

    // 페이지네이션
    q = query(q, limit(limitCount));
    
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const posts: Post[] = [];
    let newLastDoc: QueryDocumentSnapshot | null = null;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        publishedAt: data.publishedAt?.toDate() || undefined,
      } as Post);
      
      newLastDoc = doc;
    });

    console.log('✅ 게시글 목록 조회 성공:', posts.length);
    return { posts, lastDoc: newLastDoc };
  } catch (error) {
    console.error('❌ 게시글 목록 조회 실패:', error);
    throw error;
  }
};

// 게시글 상세 조회
export const getPost = async (postId: string): Promise<Post | null> => {
  try {
    const docRef = doc(db, 'posts', postId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // 조회수 증가
      await updateDoc(docRef, {
        viewCount: increment(1)
      });

      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        publishedAt: data.publishedAt?.toDate() || undefined,
      } as Post;
    }

    return null;
  } catch (error) {
    console.error('❌ 게시글 조회 실패:', error);
    throw error;
  }
};

// 게시글 업데이트
export const updatePost = async (
  postId: string, 
  updates: Partial<CreatePostData>
): Promise<void> => {
  try {
    const docRef = doc(db, 'posts', postId);
    
    const updateData: any = {
      ...updates,
      updatedAt: new Date()
    };

    // 제목이나 내용이 변경된 경우 요약과 검색 키워드 업데이트
    if (updates.title || updates.content) {
      if (updates.content) {
        updateData.excerpt = updates.content.substring(0, 200).replace(/[#*`]/g, '').trim();
      }
      
      if (updates.title || updates.tags) {
        const title = updates.title || '';
        const tags = updates.tags || [];
        const category = updates.category || '';
        
        updateData.searchKeywords = [
          ...title.toLowerCase().split(' '),
          ...tags.map(tag => tag.toLowerCase()),
          category.toLowerCase()
        ].filter(keyword => keyword.length > 1);
      }

      if (updates.title) {
        updateData.slug = updates.title
          .toLowerCase()
          .replace(/[^a-z0-9가-힣\s]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 50) + `-${Date.now()}`;
      }
    }

    await updateDoc(docRef, updateData);
    console.log('✅ 게시글 업데이트 성공:', postId);
  } catch (error) {
    console.error('❌ 게시글 업데이트 실패:', error);
    throw error;
  }
};

// 게시글 삭제
export const deletePost = async (postId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'posts', postId);
    
    // 실제 삭제 대신 상태를 'deleted'로 변경
    await updateDoc(docRef, {
      status: 'deleted',
      updatedAt: new Date()
    });
    
    console.log('✅ 게시글 삭제 성공:', postId);
  } catch (error) {
    console.error('❌ 게시글 삭제 실패:', error);
    throw error;
  }
};

// 카테고리별 게시글 수 조회
export const getPostCountByCategory = async (): Promise<Record<string, number>> => {
  try {
    const categories: Record<string, number> = {};
    
    for (const category of POST_CATEGORIES) {
      const q = query(
        collection(db!, 'posts'),
        where('category', '==', category.value),
        where('status', '==', 'published'),
        where('isPublic', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      categories[category.value] = querySnapshot.size;
    }

    console.log('✅ 카테고리별 게시글 수 조회 성공');
    return categories;
  } catch (error) {
    console.error('❌ 카테고리별 게시글 수 조회 실패:', error);
    throw error;
  }
}; 