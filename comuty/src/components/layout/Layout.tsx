import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header onMenuToggle={toggleSidebar} />
      
      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar - Hidden on mobile, shown on desktop */}
        <div className="hidden md:block">
          <Sidebar isOpen={true} />
        </div>
        
        {/* Mobile Sidebar */}
        <div className="md:hidden">
          <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)] md:ml-0">
          <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
            {children}
          </div>
        </main>
      </div>
      
      {/* Bottom Navigation - Mobile only */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
} 