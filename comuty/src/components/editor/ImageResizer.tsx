import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Move, 
  X,
  Settings,
  Copy,
  Download
} from 'lucide-react';

interface ImageResizerProps {
  src: string;
  alt?: string;
  initialWidth?: number;
  initialHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  onResize?: (width: number, height: number) => void;
  onDelete?: () => void;
  isFocused?: boolean;
}

const PRESET_SIZES = [
  { label: '작게', width: 300, height: 200 },
  { label: '보통', width: 500, height: 350 },
  { label: '크게', width: 700, height: 500 },
  { label: '전체폭', width: '100%', height: 'auto' },
];

export function ImageResizer({
  src,
  alt = '',
  initialWidth = 500,
  initialHeight = 350,
  maxWidth = 800,
  maxHeight = 600,
  onResize,
  onDelete,
  isFocused = false
}: ImageResizerProps) {
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const [isResizing, setIsResizing] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [aspectRatio, setAspectRatio] = useState(true);
  const [originalRatio, setOriginalRatio] = useState(1);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 이미지 로드 시 원본 비율 계산
  useEffect(() => {
    if (imageRef.current?.naturalWidth && imageRef.current?.naturalHeight) {
      setOriginalRatio(imageRef.current.naturalWidth / imageRef.current.naturalHeight);
    }
  }, [src]);

  // 포커스 상태에 따라 컨트롤 표시
  useEffect(() => {
    setShowControls(isFocused);
  }, [isFocused]);

  const handleImageLoad = () => {
    if (imageRef.current) {
      const naturalWidth = imageRef.current.naturalWidth;
      const naturalHeight = imageRef.current.naturalHeight;
      const ratio = naturalWidth / naturalHeight;
      setOriginalRatio(ratio);
      
      // 초기 크기가 너무 크면 조정
      if (naturalWidth > maxWidth) {
        const newWidth = maxWidth;
        const newHeight = aspectRatio ? newWidth / ratio : initialHeight;
        setSize({ width: newWidth, height: newHeight });
        onResize?.(newWidth, newHeight);
      }
    }
  };

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      width: typeof size.width === 'number' ? size.width : 500,
      height: typeof size.height === 'number' ? size.height : 350,
    });
  };

  const handleResize = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    let newWidth = Math.max(100, dragStart.width + deltaX);
    let newHeight = Math.max(100, dragStart.height + deltaY);
    
    // 최대 크기 제한
    newWidth = Math.min(newWidth, maxWidth);
    newHeight = Math.min(newHeight, maxHeight);
    
    // 비율 유지
    if (aspectRatio && originalRatio) {
      newHeight = newWidth / originalRatio;
    }
    
    setSize({ width: newWidth, height: newHeight });
    onResize?.(newWidth, newHeight);
  };

  const stopResize = () => {
    setIsResizing(false);
  };

  // 마우스 이벤트 리스너
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResize);
      document.addEventListener('mouseup', stopResize);
      return () => {
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', stopResize);
      };
    }
  }, [isResizing, dragStart, aspectRatio, originalRatio]);

  const applyPresetSize = (preset: typeof PRESET_SIZES[0]) => {
    let newWidth = preset.width;
    let newHeight = preset.height;
    
    if (typeof newWidth === 'string') {
      // 전체폭인 경우
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        newWidth = containerWidth;
        newHeight = aspectRatio && originalRatio ? containerWidth / originalRatio : 350;
      } else {
        newWidth = 500; // 기본값
        newHeight = 350;
      }
    }
    
    const finalWidth = typeof newWidth === 'number' ? newWidth : 500;
    const finalHeight = typeof newHeight === 'number' ? newHeight : 350;
    
    setSize({ width: finalWidth, height: finalHeight });
    onResize?.(finalWidth, finalHeight);
  };

  const resetSize = () => {
    if (imageRef.current) {
      const naturalWidth = imageRef.current.naturalWidth;
      const naturalHeight = imageRef.current.naturalHeight;
      const ratio = naturalWidth / naturalHeight;
      
      let newWidth = Math.min(naturalWidth, maxWidth);
      let newHeight = newWidth / ratio;
      
      setSize({ width: newWidth, height: newHeight });
      onResize?.(newWidth, newHeight);
    }
  };

  const copyImageUrl = async () => {
    try {
      await navigator.clipboard.writeText(src);
      // 복사 완료 피드백 (토스트 등으로 개선 가능)
      console.log('이미지 URL이 복사되었습니다.');
    } catch (error) {
      console.error('복사 실패:', error);
    }
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = alt || 'image';
    link.click();
  };

  const getImageStyle = (): React.CSSProperties => ({
    width: typeof size.width === 'number' ? `${size.width}px` : size.width,
    height: typeof size.height === 'number' ? `${size.height}px` : size.height,
    objectFit: 'contain',
    display: 'block',
    borderRadius: '8px',
    cursor: isResizing ? 'nw-resize' : 'pointer'
  });

  return (
    <div 
      ref={containerRef}
      className="relative group inline-block"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => !isFocused && setShowControls(false)}
    >
      {/* 메인 이미지 */}
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        style={getImageStyle()}
        onLoad={handleImageLoad}
        className="transition-all duration-200"
        draggable={false}
      />

      {/* 리사이즈 핸들 */}
      {showControls && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 bg-primary border-2 border-white rounded cursor-nw-resize shadow-lg"
          onMouseDown={startResize}
          title="드래그하여 크기 조절"
        />
      )}

      {/* 컨트롤 패널 */}
      {showControls && (
        <div className="absolute top-2 right-2 bg-black/80 text-white rounded-lg p-1 flex items-center gap-1">
          {/* 크기 프리셋 */}
          <div className="relative group/preset">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-white/20"
              title="크기 프리셋"
            >
              <Settings className="h-4 w-4" />
            </Button>
            
            <div className="absolute top-full right-0 mt-1 bg-white text-black border rounded-lg shadow-lg p-1 min-w-[120px] opacity-0 group-hover/preset:opacity-100 transition-opacity z-10">
              {PRESET_SIZES.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyPresetSize(preset)}
                  className="w-full text-left px-2 py-1 text-sm hover:bg-accent rounded"
                >
                  {preset.label}
                </button>
              ))}
              <div className="border-t my-1" />
              <button
                onClick={resetSize}
                className="w-full text-left px-2 py-1 text-sm hover:bg-accent rounded flex items-center gap-2"
              >
                <RotateCcw className="h-3 w-3" />
                원본 크기
              </button>
            </div>
          </div>

          {/* 비율 유지 토글 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAspectRatio(!aspectRatio)}
            className={`h-8 w-8 p-0 hover:bg-white/20 ${aspectRatio ? 'bg-white/20' : ''}`}
            title={aspectRatio ? '비율 유지 해제' : '비율 유지'}
          >
            {aspectRatio ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>

          {/* 복사 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={copyImageUrl}
            className="h-8 w-8 p-0 hover:bg-white/20"
            title="이미지 URL 복사"
          >
            <Copy className="h-4 w-4" />
          </Button>

          {/* 다운로드 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadImage}
            className="h-8 w-8 p-0 hover:bg-white/20"
            title="이미지 다운로드"
          >
            <Download className="h-4 w-4" />
          </Button>

          {/* 삭제 */}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 hover:bg-red-500/20 text-red-400"
              title="이미지 삭제"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* 크기 정보 표시 */}
      {showControls && (
        <div className="absolute bottom-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
          {typeof size.width === 'number' ? Math.round(size.width) : size.width} × {' '}
          {typeof size.height === 'number' ? Math.round(size.height) : size.height}
        </div>
      )}

      {/* 리사이징 중 오버레이 */}
      {isResizing && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-primary border-dashed rounded-lg flex items-center justify-center">
          <div className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-medium">
            {typeof size.width === 'number' ? Math.round(size.width) : size.width} × {' '}
            {typeof size.height === 'number' ? Math.round(size.height) : size.height}
          </div>
        </div>
      )}
    </div>
  );
} 