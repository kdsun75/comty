import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { PostCard } from '../components/posts/PostCard';
import { TrendingUp, Clock, Star, Filter, Plus, Loader2 } from 'lucide-react';
import { getPosts, getPostCountByCategory, POST_CATEGORIES, type Post } from '../lib/posts';
import { useAuthStore } from '../store/authStore';
import { isFirebaseInitialized } from '../lib/firebase-safe';

// 시간 포맷 함수
const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  
  return date.toLocaleDateString('ko-KR');
};

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'trending'>('latest');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [posts, setPosts] = useState<Post[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  // 초기 데이터 로드
  useEffect(() => {
    loadInitialData();
  }, []);

  // 필터 변경 시 데이터 다시 로드
  useEffect(() => {
    loadPosts(true);
  }, [sortBy, selectedCategory]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Firebase 초기화 체크
      if (!isFirebaseInitialized) {
        console.log('Firebase가 초기화되지 않았습니다. 설정 페이지로 이동합니다.');
        navigate('/setup');
        return;
      }
      
      // 카테고리별 게시글 수와 게시글 목록을 병렬로 로드
      const [categoryCountsResult] = await Promise.all([
        getPostCountByCategory(),
      ]);
      
      setCategoryCounts(categoryCountsResult);
      await loadPosts(true);
    } catch (error) {
      console.error('초기 데이터 로드 실패:', error);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPosts = async (reset = false) => {
    try {
      if (reset) {
        setIsLoadingMore(true);
      }

      const { posts: newPosts, lastDoc: newLastDoc } = await getPosts({
        category: selectedCategory === '전체' ? undefined : selectedCategory,
        sortBy,
        limit: 20,
        lastDoc: reset ? undefined : lastDoc,
      });

      if (reset) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      
      setLastDoc(newLastDoc);
      setHasMore(newPosts.length === 20);
      setError('');
    } catch (error) {
      console.error('게시글 로드 실패:', error);
      setError('게시글을 불러오는데 실패했습니다.');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      loadPosts(false);
    }
  };

  const handlePostLike = (postId: string) => {
    console.log('Like post:', postId);
    // TODO: 좋아요 기능 구현
  };

  const handlePostBookmark = (postId: string) => {
    console.log('Bookmark post:', postId);
    // TODO: 북마크 기능 구현
  };

  const handlePostComment = (postId: string) => {
    console.log('Comment on post:', postId);
    // TODO: 댓글 기능 구현
  };

  const handlePostShare = (postId: string) => {
    console.log('Share post:', postId);
    // TODO: 공유 기능 구현
  };

  // Post 데이터를 PostCard가 기대하는 형식으로 변환
  const convertPostForCard = (post: Post) => ({
    id: post.id,
    title: post.title,
    content: post.excerpt,
    author: {
      name: post.authorName,
      username: post.authorId,
      avatar: post.authorPhotoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName)}&background=random`
    },
    createdAt: formatTimeAgo(post.createdAt),
    likes: post.likeCount,
    comments: post.commentCount,
    isLiked: false, // TODO: 사용자별 좋아요 상태 확인
    isBookmarked: false, // TODO: 사용자별 북마크 상태 확인
    images: post.images.map(img => img.url),
    tags: post.tags
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">게시글을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Welcome Section */}
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardContent className="p-6">
              <h1 className="text-2xl font-bold mb-2">AI 커뮤니티에 오신 것을 환영합니다! 🤖</h1>
              <p className="text-muted-foreground mb-4">
                최신 AI 트렌드와 정보를 공유하고, 함께 학습하며 성장하는 공간입니다.
              </p>
              {user ? (
                <Button onClick={() => navigate('/create')} className="gap-2">
                  <Plus className="h-4 w-4" />
                  새 글 작성하기
                </Button>
              ) : (
                <Button onClick={() => navigate('/login')}>
                  로그인하고 시작하기
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Category Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <h2 className="font-semibold">카테고리</h2>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === '전체' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('전체')}
                  >
                    전체
                  </Button>
                  {POST_CATEGORIES.map((category) => (
                    <Button
                      key={category.value}
                      variant={selectedCategory === category.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.value)}
                      className="gap-1"
                    >
                      {category.label}
                      {categoryCounts[category.value] > 0 && (
                        <span className="bg-background/20 px-1.5 py-0.5 rounded text-xs">
                          {categoryCounts[category.value]}
                        </span>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sort Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">
                  게시글 목록 
                  {selectedCategory !== '전체' && (
                    <span className="text-sm text-muted-foreground ml-2">
                      · {POST_CATEGORIES.find(cat => cat.value === selectedCategory)?.label || selectedCategory}
                    </span>
                  )}
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant={sortBy === 'latest' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('latest')}
                    className="gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    최신순
                  </Button>
                  <Button
                    variant={sortBy === 'popular' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('popular')}
                    className="gap-2"
                  >
                    <Star className="h-4 w-4" />
                    인기순
                  </Button>
                  <Button
                    variant={sortBy === 'trending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('trending')}
                    className="gap-2"
                  >
                    <TrendingUp className="h-4 w-4" />
                    트렌딩
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
              {error}
            </div>
          )}

          {/* Posts List */}
          {posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={convertPostForCard(post)}
                  onLike={handlePostLike}
                  onBookmark={handlePostBookmark}
                  onComment={handlePostComment}
                  onShare={handlePostShare}
                />
              ))}
            </div>
          ) : !isLoading && (
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">게시글이 없습니다</h3>
                <p className="text-muted-foreground mb-4">
                  {selectedCategory === '전체' 
                    ? '아직 작성된 게시글이 없습니다. 첫 번째 게시글을 작성해보세요!'
                    : `${POST_CATEGORIES.find(cat => cat.value === selectedCategory)?.label || selectedCategory} 카테고리에 게시글이 없습니다.`}
                </p>
                {user && (
                  <Button onClick={() => navigate('/create')} className="gap-2">
                    <Plus className="h-4 w-4" />
                    새 글 작성하기
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Load More */}
          {hasMore && posts.length > 0 && (
            <div className="text-center">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="gap-2"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    로딩 중...
                  </>
                ) : (
                  '더 많은 게시글 보기'
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Categories Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                카테고리별 게시글
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {POST_CATEGORIES.slice(0, 5).map((category, index) => (
                <div 
                  key={category.value} 
                  className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer"
                  onClick={() => setSelectedCategory(category.value)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                    <div>
                      <p className="font-medium text-sm">{category.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {categoryCounts[category.value] || 0}개의 게시글
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {POST_CATEGORIES.length > 5 && (
                <div className="text-center pt-2">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedCategory('전체')}>
                    모든 카테고리 보기
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">커뮤니티 현황</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">총 회원 수</span>
                <span className="font-semibold">12,450명</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">오늘 활성 사용자</span>
                <span className="font-semibold">1,234명</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">총 게시글</span>
                <span className="font-semibold">8,927개</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">이번 주 신규 글</span>
                <span className="font-semibold text-green-600">+156개</span>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Users */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">추천 사용자</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold">U{i}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">사용자{i}</p>
                      <p className="text-xs text-muted-foreground">AI 전문가</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">팔로우</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 