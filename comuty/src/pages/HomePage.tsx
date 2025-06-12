import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { PostCard } from '../components/posts/PostCard';
import { TrendingUp, Clock, Star, Filter } from 'lucide-react';

// 더미 데이터
const mockPosts = [
  {
    id: '1',
    title: 'ChatGPT를 활용한 효율적인 코딩 방법',
    content: 'AI를 활용하여 개발 생산성을 높이는 다양한 방법들을 소개합니다. 프롬프트 엔지니어링부터 코드 리뷰까지, 실무에서 바로 적용할 수 있는 팁들을 정리했습니다.',
         author: {
       name: '김개발자',
       username: 'dev_kim',
       avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
     },
     createdAt: '2시간 전',
     likes: 42,
     comments: 8,
     isLiked: false,
     isBookmarked: true,
     images: ['https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop&crop=center'],
    tags: ['ChatGPT', '개발', '생산성']
  },
  {
    id: '2',
    title: '머신러닝 모델 최적화 경험담',
    content: '실제 프로덕션 환경에서 머신러닝 모델을 최적화하면서 겪었던 시행착오와 해결 방법들을 공유합니다.',
         author: {
       name: '이데이터',
       username: 'data_lee',
       avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
     },
    createdAt: '4시간 전',
    likes: 28,
    comments: 12,
    isLiked: true,
    isBookmarked: false,
    tags: ['머신러닝', '최적화', '경험담']
  },
  {
    id: '3',
    title: 'AI 윤리에 대한 생각',
    content: 'AI 기술이 발전하면서 고려해야 할 윤리적 문제들과 개발자로서의 책임에 대해 이야기해보고 싶습니다.',
    author: {
      name: '박윤리',
      username: 'ethics_park',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b743?w=40&h=40&fit=crop&crop=face'
    },
    createdAt: '6시간 전',
    likes: 15,
    comments: 20,
    isLiked: false,
    isBookmarked: false,
    tags: ['AI윤리', '철학', '토론']
  }
];

const trendingTopics = [
  { name: 'ChatGPT', posts: 1234, growth: '+12%' },
  { name: '머신러닝', posts: 892, growth: '+8%' },
  { name: '딥러닝', posts: 567, growth: '+15%' },
  { name: 'AI윤리', posts: 345, growth: '+25%' },
  { name: '자연어처리', posts: 289, growth: '+5%' }
];

export function HomePage() {
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'trending'>('latest');
  const [posts] = useState(mockPosts);

  const handlePostLike = (postId: string) => {
    console.log('Like post:', postId);
  };

  const handlePostBookmark = (postId: string) => {
    console.log('Bookmark post:', postId);
  };

  const handlePostComment = (postId: string) => {
    console.log('Comment on post:', postId);
  };

  const handlePostShare = (postId: string) => {
    console.log('Share post:', postId);
  };

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
              <Button>첫 번째 글 작성하기</Button>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">게시글 목록</h2>
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
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posts List */}
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handlePostLike}
                onBookmark={handlePostBookmark}
                onComment={handlePostComment}
                onShare={handlePostShare}
              />
            ))}
          </div>

          {/* Load More */}
          <div className="text-center">
            <Button variant="outline" size="lg">
              더 많은 게시글 보기
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Trending Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                인기 주제
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {trendingTopics.map((topic, index) => (
                <div key={topic.name} className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                    <div>
                      <p className="font-medium text-sm">#{topic.name}</p>
                      <p className="text-xs text-muted-foreground">{topic.posts}개의 게시글</p>
                    </div>
                  </div>
                  <span className="text-xs text-green-600 font-medium">{topic.growth}</span>
                </div>
              ))}
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