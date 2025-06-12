import React from 'react';
import { Home, TrendingUp, MessageCircle, User, Plus } from 'lucide-react';

export function BottomNav() {
  const navItems = [
    { icon: Home, label: '홈', href: '/', active: true },
    { icon: TrendingUp, label: '인기', href: '/trending' },
    { icon: Plus, label: '글쓰기', href: '/create', isAction: true },
    { icon: MessageCircle, label: '채팅', href: '/chat' },
    { icon: User, label: '프로필', href: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-around h-16 px-4">
        {navItems.map((item) => (
          <button
            key={item.href}
            className={`
              flex flex-col items-center justify-center flex-1 h-full
              ${item.isAction 
                ? 'relative' 
                : item.active 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }
              transition-colors duration-200
            `}
          >
            {item.isAction ? (
              <div className="absolute -top-2 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
                <item.icon className="h-6 w-6 text-primary-foreground" />
              </div>
            ) : (
              <>
                <item.icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
} 