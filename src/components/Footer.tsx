import React from 'react';
import './Footer.css';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <span className="brand-dot"></span>
          <span>TaskCollaborate</span>
        </div>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Help Center</a>
        </div>
        <div className="footer-copyright">
          &copy; {currentYear} Collaborative Task System. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
