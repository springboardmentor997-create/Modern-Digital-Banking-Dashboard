/**
 * Dashboard layout wrapper
 *
 * Purpose:
 * Provides common layout structure
 * (sidebar, header, content area)
 * for all dashboard pages.
 */

import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";

const DashboardLayout = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ 
      display: "flex", 
      minHeight: "100vh",
      flexDirection: isMobile ? "column" : "row"
    }}>
      <div style={{ 
        flex: 1, 
        display: "flex", 
        flexDirection: "column",
        width: "100%"
      }}>
        <main style={{ 
          padding: isMobile ? "16px" : "30px 40px", 
          flex: 1,
          width: "100%",
          maxWidth: "100%",
          overflowX: "hidden"
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

