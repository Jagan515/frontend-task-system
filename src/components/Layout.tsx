import React from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { TaskDetail } from './TaskDetail';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const authPaths = ['/login', '/signup', '/reset-password'];
  const isAuthPage = authPaths.includes(location.pathname);

  return (
    <div className="app-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isAuthPage && <Header />}
      <main className="app-main" style={{ flex: 1 }}>
        {children}
      </main>
      {!isAuthPage && <Footer />}
      <TaskDetail />
    </div>
  );
};
