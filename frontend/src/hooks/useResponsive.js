/**
 * useResponsive Hook
 * 
 * Purpose:
 * Custom hook for responsive design that provides screen size information
 * and breakpoint utilities across components
 */

import { useState, useEffect } from 'react';

const useResponsive = () => {
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

  // Breakpoint definitions
  const breakpoints = {
    xs: 320,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  };

  // Device type detection
  const isMobile = screenSize.width < breakpoints.md;
  const isTablet = screenSize.width >= breakpoints.md && screenSize.width < breakpoints.lg;
  const isDesktop = screenSize.width >= breakpoints.lg;
  const isXS = screenSize.width < breakpoints.xs;

  // Responsive utilities
  const getResponsiveValue = (mobileValue, tabletValue, desktopValue) => {
    if (isMobile) return mobileValue;
    if (isTablet) return tabletValue || mobileValue;
    return desktopValue || tabletValue || mobileValue;
  };

  const getResponsivePadding = (scale = 1) => {
    const basePadding = {
      mobile: 16 * scale,
      tablet: 24 * scale,
      desktop: 32 * scale
    };
    
    if (isMobile) return `${basePadding.mobile}px`;
    if (isTablet) return `${basePadding.tablet}px`;
    return `${basePadding.desktop}px`;
  };

  const getResponsiveFontSize = (baseSize = 16) => {
    if (isMobile) return `${baseSize * 0.875}px`;
    if (isTablet) return `${baseSize}px`;
    return `${baseSize * 1.125}px`;
  };

  return {
    screenSize,
    breakpoints,
    isMobile,
    isTablet,
    isDesktop,
    isXS,
    getResponsiveValue,
    getResponsivePadding,
    getResponsiveFontSize
  };
};

export default useResponsive;