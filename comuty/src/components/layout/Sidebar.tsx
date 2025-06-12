
import { Button } from '../ui/button';
import { 
  Home, 
  TrendingUp, 
  Bookmark, 
  MessageCircle, 
  User, 
  Settings, 
  Bot,
  BookOpen,
  Users,
  Lightbulb
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const menuItems = [
    { icon: Home, label: '홈', href: '/', active: true },
    { icon: TrendingUp, label: '인기 글', href: '/trending' },
    { icon: BookOpen, label: 'AI 학습', href: '/learn' },
    { icon: Bot, label: 'AI 도구', href: '/tools' },
    { icon: Lightbulb, label: '아이디어', href: '/ideas' },
    { icon: Users, label: '커뮤니티', href: '/community' },
  ];

  const personalItems = [
    { icon: Bookmark, label: '북마크', href: '/bookmarks' },
    { icon: MessageCircle, label: '채팅', href: '/chat' },
    { icon: User, label: '내 프로필', href: '/profile' },
    { icon: Settings, label: '설정', href: '/settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-64 
        transform transition-transform duration-300 ease-in-out
        border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60
        md:relative md:top-0 md:h-[calc(100vh-4rem)] md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          
          {/* Navigation Menu */}
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-2">
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  탐색
                </h3>
                {menuItems.map((item) => (
                  <Button
                    key={item.href}
                    variant={item.active ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3 h-10"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                ))}
              </div>

              <div className="mb-6">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  개인
                </h3>
                {personalItems.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className="w-full justify-start gap-3 h-10"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </nav>
          </div>

          {/* Trending Topics */}
          <div className="p-4 border-t">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              인기 주제
            </h3>
            <div className="space-y-2">
              <div className="p-2 rounded-md hover:bg-accent cursor-pointer">
                <p className="text-sm font-medium">#ChatGPT</p>
                <p className="text-xs text-muted-foreground">1,234개의 게시글</p>
              </div>
              <div className="p-2 rounded-md hover:bg-accent cursor-pointer">
                <p className="text-sm font-medium">#머신러닝</p>
                <p className="text-xs text-muted-foreground">892개의 게시글</p>
              </div>
              <div className="p-2 rounded-md hover:bg-accent cursor-pointer">
                <p className="text-sm font-medium">#딥러닝</p>
                <p className="text-xs text-muted-foreground">567개의 게시글</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-t">
            <Button className="w-full" size="sm">
              새 글 작성
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
} 