import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { TaskDetail } from './TaskDetail';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="app-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main className="app-main" style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
      <TaskDetail />
    </div>
  );
};
