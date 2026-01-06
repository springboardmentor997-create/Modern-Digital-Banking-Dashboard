import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

// Hook to use the context in other components
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const SidebarProvider = ({ children }) => {
  // --- SIDEBAR STATE ---
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => setIsExpanded((prev) => !prev);
  const toggleMobileSidebar = () => setIsMobileOpen((prev) => !prev);
  const closeMobileSidebar = () => setIsMobileOpen(false);

  // --- DARK MODE STATE ---
  // Initialize state by checking localStorage immediately
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      // Return true only if string is exactly 'true'
      return saved === 'true'; 
    }
    return false;
  });

  // Effect to apply the class to HTML tag whenever state changes
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  return (
    <SidebarContext.Provider value={{
      // Sidebar Props
      isExpanded,
      toggleSidebar,
      isMobileOpen,
      toggleMobileSidebar,
      closeMobileSidebar,

      // Theme Props
      isDarkMode,
      toggleTheme 
    }}>
      {children}
    </SidebarContext.Provider>
  );
};