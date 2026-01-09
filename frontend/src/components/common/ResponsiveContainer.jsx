/**
 * ResponsiveContainer Component
 * 
 * Purpose:
 * Provides a responsive container with consistent padding and max-width
 * across different screen sizes for better content layout
 */

import { useState, useEffect } from 'react';

const ResponsiveContainer = ({ 
  children, 
  className = '', 
  style = {},
  maxWidth = true,
  padding = true 
}) => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = screenSize.width < 640;
  const isTablet = screenSize.width >= 640 && screenSize.width < 1024;
  const isDesktop = screenSize.width >= 1024;

  const getResponsivePadding = () => {
    if (!padding) return '0';
    if (isMobile) return '1rem';
    if (isTablet) return '1.5rem';
    return '2rem';
  };

  const getMaxWidth = () => {
    if (!maxWidth) return '100%';
    if (isMobile) return '100%';
    if (isTablet) return '768px';
    return '1280px';
  };

  const containerStyle = {
    width: '100%',
    maxWidth: getMaxWidth(),
    margin: '0 auto',
    padding: getResponsivePadding(),
    boxSizing: 'border-box',
    ...style
  };

  return (
    <div 
      className={`responsive-container ${className}`}
      style={containerStyle}
    >
      {children}
    </div>
  );
};

export default ResponsiveContainer;