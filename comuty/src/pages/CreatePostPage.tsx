import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { BlockEditor, type Block } from '../components/editor/BlockEditor';
import { 
  Save, 
  Eye, 
  Send, 
  Hash, 
  Globe, 
  Lock, 
  Calendar,
  User,
  BookOpen,
  Zap,
  Heart,
  MessageCircle,
  Share2,
  X,
  Plus,
  Sparkles
} from 'lucide-react';
import { createPost, POST_CATEGORIES } from '../lib/posts';
import { getCurrentUser } from '../lib/auth';
import type { CreatePostData } from '../lib/posts';

// 폼 스키마
const createPostSchema = z.object({
  title: z.string()
    .min(1, '제목을 입력해주세요')
    .max(100, '제목은 100자를 초과할 수 없습니다'),
  category: z.string().min(1, '카테고리를 선택해주세요'),
  tags: z.array(z.string()).min(1, '최소 1개의 태그를 입력해주세요'),
  metaDescription: z.string()
    .max(160, 'SEO 설명은 160자를 초과할 수 없습니다')
    .optional(),
  isPublished: z.boolean().default(true),
  allowComments: z.boolean().default(true),
  featuredImage: z.string().optional(),
});

type CreatePostForm = z.infer<typeof createPostSchema>;

export default function CreatePostPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset
  } = useForm<CreatePostForm>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: '',
      category: '',
      tags: [],
      metaDescription: '',
      isPublished: true,
      allowComments: true,
    },
    mode: 'onChange'
  });

  const watchedFields = watch();

  // 사용자 정보 로드
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
        navigate('/signin');
      }
    };
    loadUser();
  }, [navigate]);

  // 블록을 컨텐츠로 변환
  const convertBlocksToContent = (blocks: Block[]): string => {
    return blocks.map(block => {
      switch (block.type) {
        case 'text':
          return block.content;
        case 'image':
          return `![${block.alt || ''}](${block.url})`;
        case 'video':
          return `[YouTube](${block.url})`;
        case 'link':
          return `[${block.title || 'Link'}](${block.url})`;
        default:
          return '';
      }
    }).join('\n\n');
  };

  // 태그 추가
  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !watchedFields.tags.includes(tag)) {
      setValue('tags', [...watchedFields.tags, tag]);
      setTagInput('');
    }
  };

  // 태그 삭제
  const removeTag = (tagToRemove: string) => {
    setValue('tags', watchedFields.tags.filter(tag => tag !== tagToRemove));
  };

  // 폼 제출
  const onSubmit = async (data: CreatePostForm) => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (blocks.length === 0 || (blocks.length === 1 && blocks[0].type === 'text' && !blocks[0].content)) {
      alert('내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const content = convertBlocksToContent(blocks);
      
      const postData: CreatePostData = {
        title: data.title,
        content,
        category: data.category,
        tags: data.tags,
        metaDescription: data.metaDescription,
        isPublic: isDraft ? false : data.isPublished,
        status: isDraft ? 'draft' : 'published',
        allowComments: data.allowComments,
        featuredImage: data.featuredImage,
      };

      // 임시로 현재 사용자 정보를 직접 전달
      const result = await createPost(
        postData,
        currentUser.uid,
        currentUser.displayName || '익명',
        currentUser.photoURL
      );
      
      if (isDraft) {
        alert('초안이 저장되었습니다.');
      } else {
        alert('게시글이 성공적으로 발행되었습니다!');
        navigate(`/post/${result}`);
      }
    } catch (error) {
      console.error('게시글 생성 실패:', error);
      alert('게시글 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 미리보기 카드 생성
  const getPreviewCard = () => {
    const firstImageBlock = blocks.find(block => block.type === 'image');
    const textContent = blocks
      .filter(block => block.type === 'text')
      .map(block => block.content)
      .join(' ')
      .slice(0, 100);

    return (
      <Card className="mb-6 overflow-hidden">
        <div className="relative">
          {firstImageBlock && (
            <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600">
              <img 
                src={(firstImageBlock as any).url} 
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {!firstImageBlock && (
            <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <BookOpen className="h-16 w-16 text-white opacity-50" />
            </div>
          )}
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="bg-white/90 text-gray-800">
              {POST_CATEGORIES.find(cat => cat.value === watchedFields.category)?.label || '카테고리'}
            </Badge>
          </div>
        </div>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-2 line-clamp-2">
            {watchedFields.title || '게시글 제목'}
          </h2>
          <p className="text-muted-foreground mb-4 line-clamp-3">
            {textContent || '게시글 내용이 여기에 표시됩니다...'}
          </p>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{currentUser?.displayName || '작성자'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>0</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>0</span>
              </div>
              <div className="flex items-center gap-1">
                <Share2 className="h-4 w-4" />
                <span>공유</span>
              </div>
            </div>
          </div>
          {watchedFields.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {watchedFields.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-primary" />
                새 게시글 작성
              </h1>
              <p className="text-muted-foreground mt-2">
                AI 커뮤니티와 지식을 공유해보세요
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {previewMode ? '편집' : '미리보기'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDraft(true);
                  handleSubmit(onSubmit)();
                }}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                초안 저장
              </Button>
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting || !isValid}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? '발행 중...' : '발행하기'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 편집 영역 */}
          <div className="lg:col-span-2">
            {previewMode ? (
              <div className="space-y-6">
                <Card className="p-6">
                  <h1 className="text-3xl font-bold mb-4">
                    {watchedFields.title || '제목을 입력해주세요'}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{currentUser.displayName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                    <Badge variant="secondary">
                      {POST_CATEGORIES.find(cat => cat.value === watchedFields.category)?.label || '카테고리'}
                    </Badge>
                  </div>
                  <Separator className="mb-6" />
                  <div className="prose max-w-none">
                    {blocks.map((block, index) => (
                      <div key={block.id} className="mb-4">
                        {block.type === 'text' && (
                          <p className="text-base leading-relaxed">{block.content || '내용을 입력해주세요...'}</p>
                        )}
                        {block.type === 'image' && (
                          <div className="my-6">
                            <img 
                              src={(block as any).url} 
                              alt={(block as any).alt}
                              className="rounded-lg max-w-full h-auto"
                            />
                            {(block as any).caption && (
                              <p className="text-sm text-muted-foreground text-center mt-2">
                                {(block as any).caption}
                              </p>
                            )}
                          </div>
                        )}
                        {block.type === 'video' && (
                          <div className="my-6 aspect-video">
                            <iframe
                              src={`https://www.youtube.com/embed/${(block as any).videoId}`}
                              className="w-full h-full rounded-lg"
                              allowFullScreen
                            />
                          </div>
                        )}
                        {block.type === 'link' && (
                          <div className="my-4 border rounded-lg p-4 hover:bg-accent transition-colors">
                            <a href={(block as any).url} target="_blank" rel="noopener noreferrer">
                              <h4 className="font-medium">{(block as any).title}</h4>
                              {(block as any).description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {(block as any).description}
                                </p>
                              )}
                              <p className="text-xs text-primary mt-2">
                                {(block as any).url}
                              </p>
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 제목 입력 */}
                <Card className="p-6">
                  <div className="space-y-4">
                    <div>
                      <Input
                        {...register('title')}
                        placeholder="매력적인 제목을 입력해보세요..."
                        className="text-2xl font-bold border-0 p-0 focus-visible:ring-0 placeholder:text-muted-foreground/50"
                      />
                      {errors.title && (
                        <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{currentUser.displayName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* 콘텐츠 에디터 */}
                <Card className="p-6">
                  <div className="mb-4">
                    <Label className="text-lg font-semibold">내용</Label>
                    <p className="text-sm text-muted-foreground">
                      텍스트, 이미지, 비디오, 링크를 자유롭게 조합해보세요
                    </p>
                  </div>
                  <BlockEditor
                    initialBlocks={blocks}
                    onChange={setBlocks}
                    placeholder="이곳에 내용을 작성해주세요. 이미지를 드래그하거나 YouTube 링크를 붙여넣어 보세요!"
                  />
                </Card>
              </div>
            )}
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 미리보기 카드 */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Eye className="h-5 w-5" />
                카드 미리보기
              </h3>
              {getPreviewCard()}
            </div>

            {/* 게시 설정 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  게시 설정
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 카테고리 */}
                <div>
                  <Label htmlFor="category" className="flex items-center gap-2 mb-2">
                    <Hash className="h-4 w-4" />
                    카테고리
                  </Label>
                  <Select onValueChange={(value) => setValue('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="카테고리를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {POST_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>
                  )}
                </div>

                {/* 태그 */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Hash className="h-4 w-4" />
                    태그
                  </Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="태그 입력"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addTag}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {watchedFields.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {errors.tags && (
                    <p className="text-sm text-red-500 mt-1">{errors.tags.message}</p>
                  )}
                </div>

                {/* SEO 설명 */}
                <div>
                  <Label htmlFor="metaDescription" className="mb-2 block">
                    SEO 설명 (선택사항)
                  </Label>
                  <Textarea
                    {...register('metaDescription')}
                    placeholder="검색 엔진에 표시될 설명을 입력하세요"
                    className="min-h-[80px]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {watchedFields.metaDescription?.length || 0}/160자
                  </p>
                  {errors.metaDescription && (
                    <p className="text-sm text-red-500 mt-1">{errors.metaDescription.message}</p>
                  )}
                </div>

                <Separator />

                {/* 발행 설정 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <Label htmlFor="isPublished">즉시 발행</Label>
                    </div>
                    <Switch
                      {...register('isPublished')}
                      id="isPublished"
                      defaultChecked={watchedFields.isPublished}
                      onCheckedChange={(checked) => setValue('isPublished', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      <Label htmlFor="allowComments">댓글 허용</Label>
                    </div>
                    <Switch
                      {...register('allowComments')}
                      id="allowComments"
                      defaultChecked={watchedFields.allowComments}
                      onCheckedChange={(checked) => setValue('allowComments', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 작성 팁 */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Sparkles className="h-5 w-5" />
                  작성 팁
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-blue-600">
                <p>• 명확하고 구체적인 제목을 작성하세요</p>
                <p>• 이미지와 코드 예시를 활용하세요</p>
                <p>• 관련 태그를 2-5개 정도 추가하세요</p>
                <p>• 다른 개발자들이 도움받을 수 있는 내용을 작성하세요</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 