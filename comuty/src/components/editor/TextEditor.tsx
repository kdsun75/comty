import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { 
  Bold, 
  Italic, 
  Underline, 
  Palette, 
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered
} from 'lucide-react';

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  isFocused?: boolean;
}

interface TextStyle {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  color: string;
  fontSize: string;
  align: 'left' | 'center' | 'right';
}

const TEXT_COLORS = [
  '#000000', '#374151', '#6B7280', '#EF4444', '#F59E0B', 
  '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F97316'
];

const FONT_SIZES = [
  { label: '작게', value: '14px' },
  { label: '보통', value: '16px' },
  { label: '크게', value: '18px' },
  { label: '제목3', value: '20px' },
  { label: '제목2', value: '24px' },
  { label: '제목1', value: '32px' },
];

export function TextEditor({ 
  value, 
  onChange, 
  placeholder = '텍스트를 입력하세요...', 
  onFocus,
  onBlur,
  onKeyDown,
  isFocused = false
}: TextEditorProps) {
  const [showToolbar, setShowToolbar] = useState(false);
  const [textStyle, setTextStyle] = useState<TextStyle>({
    bold: false,
    italic: false,
    underline: false,
    color: '#000000',
    fontSize: '16px',
    align: 'left'
  });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 포커스 상태에 따라 툴바 표시
  useEffect(() => {
    setShowToolbar(isFocused);
  }, [isFocused]);

  // 텍스트 영역 자동 높이 조절
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.max(40, textareaRef.current.scrollHeight) + 'px';
    }
  }, [value]);

  const handleStyleChange = (styleKey: keyof TextStyle, styleValue: any) => {
    setTextStyle(prev => ({
      ...prev,
      [styleKey]: styleValue
    }));
  };

  const getTextStyle = (): React.CSSProperties => ({
    fontWeight: textStyle.bold ? 'bold' : 'normal',
    fontStyle: textStyle.italic ? 'italic' : 'normal',
    textDecoration: textStyle.underline ? 'underline' : 'none',
    color: textStyle.color,
    fontSize: textStyle.fontSize,
    textAlign: textStyle.align,
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleFocus = () => {
    setShowToolbar(true);
    onFocus?.();
  };

  const handleBlur = () => {
    // 툴바를 클릭할 때는 blur 되지 않도록 딜레이 추가
    setTimeout(() => {
      if (!document.activeElement?.closest('.text-toolbar')) {
        setShowToolbar(false);
        setShowColorPicker(false);
        setShowFontSizePicker(false);
        onBlur?.();
      }
    }, 150);
  };

  const insertText = (before: string, after: string = '') => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);
    
    // 커서 위치 복원
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(start + before.length, end + before.length);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 키보드 단축키 처리
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          handleStyleChange('bold', !textStyle.bold);
          break;
        case 'i':
          e.preventDefault();
          handleStyleChange('italic', !textStyle.italic);
          break;
        case 'u':
          e.preventDefault();
          handleStyleChange('underline', !textStyle.underline);
          break;
      }
    }
    
    onKeyDown?.(e);
  };

  return (
    <div className="relative">
      {/* 텍스트 입력 영역 */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full min-h-[40px] p-3 border-0 resize-none focus:outline-none text-base transition-all"
        style={getTextStyle()}
        rows={1}
      />

      {/* 서식 툴바 */}
      {showToolbar && (
        <div className="text-toolbar absolute -top-12 left-0 bg-white border rounded-lg shadow-lg p-2 flex items-center gap-1 z-20">
          {/* 기본 서식 */}
          <Button
            variant={textStyle.bold ? "default" : "ghost"}
            size="sm"
            onClick={() => handleStyleChange('bold', !textStyle.bold)}
            className="h-8 w-8 p-0"
          >
            <Bold className="h-4 w-4" />
          </Button>
          
          <Button
            variant={textStyle.italic ? "default" : "ghost"}
            size="sm"
            onClick={() => handleStyleChange('italic', !textStyle.italic)}
            className="h-8 w-8 p-0"
          >
            <Italic className="h-4 w-4" />
          </Button>
          
          <Button
            variant={textStyle.underline ? "default" : "ghost"}
            size="sm"
            onClick={() => handleStyleChange('underline', !textStyle.underline)}
            className="h-8 w-8 p-0"
          >
            <Underline className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* 글자 크기 */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFontSizePicker(!showFontSizePicker)}
              className="h-8 px-2 text-xs"
            >
              <Type className="h-4 w-4 mr-1" />
              {FONT_SIZES.find(size => size.value === textStyle.fontSize)?.label || '보통'}
            </Button>
            
            {showFontSizePicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg p-1 min-w-[100px] z-30">
                {FONT_SIZES.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => {
                      handleStyleChange('fontSize', size.value);
                      setShowFontSizePicker(false);
                    }}
                    className={`w-full text-left px-2 py-1 text-sm hover:bg-accent rounded ${
                      textStyle.fontSize === size.value ? 'bg-accent' : ''
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 글자 색상 */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="h-8 w-8 p-0"
            >
              <div className="relative">
                <Palette className="h-4 w-4" />
                <div 
                  className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-white"
                  style={{ backgroundColor: textStyle.color }}
                />
              </div>
            </Button>
            
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg p-2 z-30">
                <div className="grid grid-cols-5 gap-1">
                  {TEXT_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        handleStyleChange('color', color);
                        setShowColorPicker(false);
                      }}
                      className={`w-6 h-6 rounded border-2 hover:scale-110 transition-transform ${
                        textStyle.color === color ? 'border-gray-400' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-border mx-1" />

          {/* 정렬 */}
          <Button
            variant={textStyle.align === 'left' ? "default" : "ghost"}
            size="sm"
            onClick={() => handleStyleChange('align', 'left')}
            className="h-8 w-8 p-0"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant={textStyle.align === 'center' ? "default" : "ghost"}
            size="sm"
            onClick={() => handleStyleChange('align', 'center')}
            className="h-8 w-8 p-0"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          
          <Button
            variant={textStyle.align === 'right' ? "default" : "ghost"}
            size="sm"
            onClick={() => handleStyleChange('align', 'right')}
            className="h-8 w-8 p-0"
          >
            <AlignRight className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* 마크다운 버튼들 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertText('**', '**')}
            className="h-8 px-2 text-xs"
            title="굵게 (Ctrl+B)"
          >
            **B**
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertText('*', '*')}
            className="h-8 px-2 text-xs"
            title="기울임 (Ctrl+I)"
          >
            *I*
          </Button>
        </div>
      )}
    </div>
  );
} 