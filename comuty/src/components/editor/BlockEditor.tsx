import { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '../ui/button';
import { TextEditor } from './TextEditor';
import { ImageResizer } from './ImageResizer';
import { 
  Plus, 
  Type, 
  Image as ImageIcon, 
  Video, 
  Link, 
  GripVertical,
  Trash2,
  AlertCircle,
  X
} from 'lucide-react';
import { uploadImage, validateFileType, validateFileSize } from '../../lib/storage';
import { extractYouTubeVideoId, getLinkPreview } from '../../lib/media';
import type { MediaBlock } from '../../lib/media';

export interface TextBlock {
  id: string;
  type: 'text';
  content: string;
  style?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    color?: string;
    fontSize?: string;
    align?: 'left' | 'center' | 'right';
  };
}

export interface ImageBlock {
  id: string;
  type: 'image';
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  caption?: string;
}

export interface VideoBlock {
  id: string;
  type: 'video';
  url: string;
  videoId: string;
  title?: string;
  thumbnail?: string;
}

export interface LinkBlock {
  id: string;
  type: 'link';
  url: string;
  title?: string;
  description?: string;
  image?: string;
}

export type Block = TextBlock | ImageBlock | VideoBlock | LinkBlock;

interface BlockEditorProps {
  initialBlocks?: Block[];
  onChange?: (blocks: Block[]) => void;
  placeholder?: string;
  maxFileSize?: number;
  allowedFileTypes?: string[];
}

const BLOCK_TYPES = [
  { type: 'text', label: '텍스트', icon: Type },
  { type: 'image', label: '이미지', icon: ImageIcon },
  { type: 'video', label: '유튜브', icon: Video },
  { type: 'link', label: '링크', icon: Link },
];

export function BlockEditor({
  initialBlocks = [],
  onChange,
  placeholder = '내용을 입력하세요...',
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
}: BlockEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(
    initialBlocks.length > 0 ? initialBlocks : [{ id: '1', type: 'text', content: '' }]
  );
  const [focusedBlock, setFocusedBlock] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState<string | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);

  // 블록 변경 시 부모에게 알림
  useEffect(() => {
    onChange?.(blocks);
  }, [blocks, onChange]);

  // 파일 드롭 처리
  const onDrop = useCallback(async (acceptedFiles: File[], fileRejections: any[]) => {
    try {
      setError(null);
      
      if (fileRejections.length > 0) {
        setError('지원하지 않는 파일 형식이거나 파일 크기가 너무 큽니다.');
        return;
      }

      for (const file of acceptedFiles) {
        const blockId = generateId();
        
        // 업로드 진행 상황 추적
        setUploadProgress(prev => ({ ...prev, [blockId]: 0 }));
        
        try {
          // 파일 유효성 검사
          if (!validateFileType(file) || !validateFileSize(file)) {
            throw new Error('지원하지 않는 파일이거나 크기가 너무 큽니다.');
          }

          // Firebase Storage에 업로드
          const result = await uploadImage(file, 'editor-images', (progress: number) => {
            setUploadProgress(prev => ({ ...prev, [blockId]: progress }));
          });

          // 이미지 블록 생성
          const newBlock: ImageBlock = {
            id: blockId,
            type: 'image',
            url: result.url,
            alt: file.name,
            width: 500,
            height: 350
          };

          setBlocks(prev => [...prev, newBlock]);
          
          // 업로드 완료 후 진행상황 제거
          setUploadProgress(prev => {
            const updated = { ...prev };
            delete updated[blockId];
            return updated;
          });

        } catch (error) {
          console.error('파일 업로드 실패:', error);
          setError(error instanceof Error ? error.message : '파일 업로드에 실패했습니다.');
          
          // 실패한 업로드 진행상황 제거
          setUploadProgress(prev => {
            const updated = { ...prev };
            delete updated[blockId];
            return updated;
          });
        }
      }
    } catch (error) {
      console.error('파일 처리 중 오류:', error);
      setError('파일 처리 중 오류가 발생했습니다.');
    }
  }, [maxFileSize, allowedFileTypes]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: maxFileSize,
    noClick: true,
    noKeyboard: true
  });

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // 새 블록 추가
  const addBlock = (type: Block['type'], afterId?: string) => {
    const newId = generateId();
    let newBlock: Block;

    switch (type) {
      case 'text':
        newBlock = { id: newId, type: 'text', content: '' };
        break;
      case 'image':
        // 이미지는 파일 선택을 통해 추가
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            try {
              setUploadProgress(prev => ({ ...prev, [newId]: 0 }));
              
              if (!validateFileType(file) || !validateFileSize(file)) {
                throw new Error('지원하지 않는 파일이거나 크기가 너무 큽니다.');
              }

              const result = await uploadImage(file, 'editor-images', (progress: number) => {
                setUploadProgress(prev => ({ ...prev, [newId]: progress }));
              });

              const imageBlock: ImageBlock = {
                id: newId,
                type: 'image',
                url: result.url,
                alt: file.name,
                width: 500,
                height: 350
              };

              setBlocks(prev => {
                if (afterId) {
                  const index = prev.findIndex(b => b.id === afterId);
                  const newBlocks = [...prev];
                  newBlocks.splice(index + 1, 0, imageBlock);
                  return newBlocks;
                }
                return [...prev, imageBlock];
              });

              setUploadProgress(prev => {
                const updated = { ...prev };
                delete updated[newId];
                return updated;
              });
            } catch (error) {
              console.error('이미지 업로드 실패:', error);
              setError(error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.');
              setUploadProgress(prev => {
                const updated = { ...prev };
                delete updated[newId];
                return updated;
              });
            }
          }
        };
        input.click();
        return;
      
      case 'video':
        const videoUrl = prompt('YouTube URL을 입력하세요:');
        if (videoUrl) {
          const videoId = extractYouTubeVideoId(videoUrl);
          if (videoId) {
            newBlock = {
              id: newId,
              type: 'video',
              url: videoUrl,
              videoId,
              thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
            };
          } else {
            setError('올바른 YouTube URL을 입력해주세요.');
            return;
          }
        } else {
          return;
        }
        break;
      
      case 'link':
        const linkUrl = prompt('링크 URL을 입력하세요:');
        if (linkUrl) {
          newBlock = {
            id: newId,
            type: 'link',
            url: linkUrl,
            title: '링크 미리보기 로딩 중...'
          };
          
          // 링크 미리보기 생성 (비동기)
          getLinkPreview(linkUrl).then((preview: any) => {
            if (preview) {
              updateBlock(newId, { 
                title: preview.title,
                description: preview.description,
                image: preview.image
              });
            }
          }).catch(() => {
            updateBlock(newId, { title: '링크 미리보기를 불러올 수 없습니다.' });
          });
        } else {
          return;
        }
        break;
      
      default:
        return;
    }

    setBlocks(prev => {
      if (afterId) {
        const index = prev.findIndex(b => b.id === afterId);
        const newBlocks = [...prev];
        newBlocks.splice(index + 1, 0, newBlock);
        return newBlocks;
      }
      return [...prev, newBlock];
    });

    setShowAddMenu(null);
    setFocusedBlock(newId);
  };

  // 블록 업데이트
  const updateBlock = (id: string, updates: Partial<Block>) => {
    setBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ));
  };

  // 블록 삭제
  const deleteBlock = (id: string) => {
    if (blocks.length <= 1) return; // 최소 하나의 블록은 유지
    
    setBlocks(prev => {
      const filtered = prev.filter(block => block.id !== id);
      return filtered.length === 0 ? [{ id: generateId(), type: 'text', content: '' }] : filtered;
    });
  };

  // 키보드 이벤트 처리
  const handleKeyDown = (e: React.KeyboardEvent, blockId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addBlock('text', blockId);
    } else if (e.key === 'Backspace' && blocks.find(b => b.id === blockId)?.type === 'text') {
      const block = blocks.find(b => b.id === blockId) as TextBlock;
      if (block && block.content === '' && blocks.length > 1) {
        e.preventDefault();
        deleteBlock(blockId);
      }
    }
  };

  // URL 자동 감지 및 변환
  const handleTextChange = (blockId: string, content: string) => {
    updateBlock(blockId, { content });

    // YouTube URL 자동 감지
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/;
    const match = content.match(youtubeRegex);
    
    if (match && content.trim() === match[0]) {
      const videoId = match[1];
      const videoBlock: VideoBlock = {
        id: generateId(),
        type: 'video',
        url: content,
        videoId,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      };
      
      // 텍스트 블록을 비디오 블록으로 교체
      setBlocks(prev => prev.map(block => 
        block.id === blockId ? videoBlock : block
      ));
    }

    // 일반 URL 자동 감지
    const urlRegex = /^https?:\/\/[^\s]+$/;
    if (urlRegex.test(content.trim()) && !youtubeRegex.test(content)) {
      getLinkPreview(content).then((preview: any) => {
        if (preview) {
          const linkBlock: LinkBlock = {
            id: generateId(),
            type: 'link',
            url: content,
            title: preview.title,
            description: preview.description,
            image: preview.image
          };
          
          // 텍스트 블록을 링크 블록으로 교체
          setBlocks(prev => prev.map(block => 
            block.id === blockId ? linkBlock : block
          ));
        }
      }).catch(() => {
        // 링크 미리보기 실패 시 그대로 텍스트로 유지
      });
    }
  };

  // 블록 렌더링
  const renderBlock = (block: Block, index: number) => {
    const isUploading = uploadProgress[block.id] !== undefined;
    const progress = uploadProgress[block.id] || 0;

    switch (block.type) {
      case 'text':
        return (
          <div key={block.id} className="group relative">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <TextEditor
                  value={block.content}
                  onChange={(content) => handleTextChange(block.id, content)}
                  placeholder={index === 0 ? placeholder : '텍스트를 입력하세요...'}
                  onFocus={() => setFocusedBlock(block.id)}
                  onBlur={() => setFocusedBlock(null)}
                  onKeyDown={(e) => handleKeyDown(e, block.id)}
                  isFocused={focusedBlock === block.id}
                />
              </div>
              
              {/* 블록 컨트롤 */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddMenu(showAddMenu === block.id ? null : block.id)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 cursor-grab"
                  onMouseDown={() => setDraggedBlock(block.id)}
                >
                  <GripVertical className="h-4 w-4" />
                </Button>
                
                {blocks.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteBlock(block.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            {/* 블록 추가 메뉴 */}
            {showAddMenu === block.id && (
              <div className="absolute left-0 top-full mt-2 bg-white border rounded-lg shadow-lg p-2 z-10">
                <div className="flex gap-1">
                  {BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
                    <Button
                      key={type}
                      variant="ghost"
                      size="sm"
                      onClick={() => addBlock(type as Block['type'], block.id)}
                      className="flex flex-col items-center gap-1 h-auto p-2 min-w-[60px]"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-xs">{label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'image':
        return (
          <div key={block.id} className="group relative my-4">
            {isUploading ? (
              <div className="border-2 border-dashed border-primary rounded-lg p-8 text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">업로드 중... {Math.round(progress)}%</p>
              </div>
            ) : (
              <ImageResizer
                src={block.url}
                alt={block.alt}
                initialWidth={block.width}
                initialHeight={block.height}
                onResize={(width, height) => updateBlock(block.id, { width, height })}
                onDelete={() => deleteBlock(block.id)}
                isFocused={focusedBlock === block.id}
              />
            )}
            
            {/* 이미지 캡션 */}
            {!isUploading && (
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="이미지 설명을 입력하세요..."
                  value={block.caption || ''}
                  onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                  className="w-full text-sm text-center text-muted-foreground bg-transparent border-0 focus:outline-none focus:ring-0"
                />
              </div>
            )}
          </div>
        );

      case 'video':
        return (
          <div key={block.id} className="group relative my-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${block.videoId}`}
                title={block.title || 'YouTube video'}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
            
            {/* 비디오 컨트롤 */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteBlock(block.id)}
                className="h-8 w-8 p-0 bg-black/50 text-white hover:bg-red-500/50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 'link':
        return (
          <div key={block.id} className="group relative my-4">
            <a
              href={block.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block border rounded-lg p-4 hover:bg-accent transition-colors"
            >
              <div className="flex gap-4">
                {block.image && (
                  <img
                    src={block.image}
                    alt=""
                    className="w-24 h-24 object-cover rounded flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium line-clamp-2 mb-1">
                    {block.title || block.url}
                  </h3>
                  {block.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {block.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground truncate">
                    {new URL(block.url).hostname}
                  </p>
                </div>
              </div>
            </a>
            
            {/* 링크 컨트롤 */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteBlock(block.id)}
                className="h-8 w-8 p-0 bg-white/80 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full" {...getRootProps()}>
      <input {...getInputProps()} />
      
      <div 
        ref={editorRef}
        className={`min-h-[200px] transition-colors rounded-lg ${
          isDragActive ? 'bg-primary/5 border-2 border-dashed border-primary' : ''
        }`}
      >
        {/* 드래그 오버레이 */}
        {isDragActive && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-10">
            <div className="text-center">
              <ImageIcon className="h-12 w-12 mx-auto mb-2 text-primary" />
              <p className="text-primary font-medium">이미지를 여기에 놓으세요</p>
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto h-auto p-1 text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* 블록 리스트 */}
        <div className="space-y-2">
          {blocks.map((block, index) => renderBlock(block, index))}
        </div>

        {/* 빈 에디터 플레이스홀더 */}
        {blocks.length === 1 && blocks[0].type === 'text' && !blocks[0].content && (
          <div className="text-muted-foreground text-center py-8">
            <Type className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>글을 작성하거나 이미지를 드래그하여 시작하세요</p>
          </div>
        )}
      </div>
    </div>
  );
} 