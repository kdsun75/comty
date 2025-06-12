import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Search, Bell, MessageCircle, Menu, Sun, Moon, Settings, User, LogOut, Home, PenTool } from 'lucide-react';
import { logout } from '../../lib/firebase';
import { useAuthStore } from '../../store/authStore';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const navigate = useNavigate();
  const { user, userProfile, clearAuth } = useAuthStore();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = async () => {
    try {
      await logout();
      clearAuth();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        
        {/* Left Section: Logo + Mobile Menu */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">AI</span>
            </div>
            <span className="font-bold text-xl hidden sm:block">Comuty</span>
          </div>
        </div>

        {/* Center Section: Search Bar (Hidden on mobile) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="AI 관련 정보를 검색해보세요..."
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
        </div>

        {/* Right Section: Actions + Profile */}
        <div className="flex items-center gap-2">
          
          {/* Search Button (Mobile only) */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>

          {/* Navigation Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="sm" className="gap-2">
              <Home className="h-4 w-4" />
              홈
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <PenTool className="h-4 w-4" />
              글쓰기
            </Button>
          </div>

          {/* Notifications */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"></span>
            </Button>
            
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-popover border rounded-lg shadow-lg p-4 z-50">
                <h3 className="font-semibold mb-3">알림</h3>
                <div className="space-y-2 text-sm">
                  <div className="p-2 hover:bg-accent rounded-md cursor-pointer">
                    <p className="font-medium">새로운 댓글이 달렸습니다</p>
                    <p className="text-muted-foreground text-xs">5분 전</p>
                  </div>
                  <div className="p-2 hover:bg-accent rounded-md cursor-pointer">
                    <p className="font-medium">게시글에 좋아요가 달렸습니다</p>
                    <p className="text-muted-foreground text-xs">1시간 전</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  모든 알림 보기
                </Button>
              </div>
            )}
          </div>

          {/* Messages */}
          <Button variant="ghost" size="icon">
            <MessageCircle className="h-5 w-5" />
          </Button>

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Profile Menu */}
          <div className="relative">
            {user ? (
              <>
                <Avatar 
                  className="cursor-pointer"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <AvatarImage src={userProfile?.photoURL || user.photoURL || ''} alt="Profile" />
                  <AvatarFallback>
                    {userProfile?.displayName?.substring(0, 2) || user.displayName?.substring(0, 2) || '사용자'}
                  </AvatarFallback>
                </Avatar>
                
                {showProfileMenu && (
                  <div className="absolute right-0 top-12 w-48 bg-popover border rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b">
                      <p className="font-medium">
                        {userProfile?.displayName || user.displayName || '사용자'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <button 
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate('/profile');
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        내 프로필
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        설정
                      </button>
                      <hr className="my-1" />
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center gap-2 text-destructive"
                      >
                        <LogOut className="h-4 w-4" />
                        로그아웃
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/login')}
              >
                로그인
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 