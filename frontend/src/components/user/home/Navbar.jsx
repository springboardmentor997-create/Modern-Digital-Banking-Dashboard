/**
 * Component: Navbar
 *
 * Purpose:
 * - Displays top navigation bar across dashboard pages
 * - Provides quick access to profile, logout, and navigation
 *
 * Connected Files:
 * - Used inside Dashboard layout
 * - Visible on all protected dashboard pages
 *
 * Note:
 * - Does not handle business logic
 * - Purely UI + navigation component
 */



import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "@/assets/logo.png";

const Navbar = () => {
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
  const isXS = screenSize.width < 380;

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: isMobile ? "56px" : "64px",
        backgroundColor: "#f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: isXS ? "0 12px" : isMobile ? "0 16px" : isTablet ? "0 24px" : "0 36px",
        borderBottom: "1px solid #e2e8f0",
      }}
    >
      {/* LOGO + NAME */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: isXS ? "8px" : isMobile ? "10px" : "14px",
        }}
      >
        <img
          src={logo}
          alt="Aureus Logo"
          style={{
            width: isXS ? "32px" : isMobile ? "36px" : isTablet ? "42px" : "48px",
            height: isXS ? "32px" : isMobile ? "36px" : isTablet ? "42px" : "40px",
            objectFit: "contain",
            filter: "contrast(1.3) brightness(0.95)",
          }}
        />

        <span
          style={{
            fontSize: isXS ? "16px" : isMobile ? "18px" : isTablet ? "22px" : "24px",
            fontWeight: "800",
            color: "#020617",
            letterSpacing: "0.8px",
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          Aureus
        </span>
      </div>

      {/* ACTIONS */}
      <div
        style={{
          display: "flex",
          gap: isXS ? "6px" : isMobile ? "8px" : isTablet ? "12px" : "16px",
          alignItems: "center",
        }}
      >
        <Link
          to="/login"
          style={{
            color: "#1e3a8a",
            fontWeight: "600",
            textDecoration: "none",
            padding: isXS ? "4px 8px" : isMobile ? "6px 10px" : isTablet ? "7px 12px" : "8px 14px",
            borderRadius: "8px",
            fontSize: isXS ? "12px" : isMobile ? "14px" : "16px",
            transition: "background 0.2s ease",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "#e0e7ff")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          Login
        </Link>

        <Link
          to="/register"
          style={{
            backgroundColor: "#2563eb",
            color: "#ffffff",
            padding: isXS ? "4px 10px" : isMobile ? "6px 12px" : isTablet ? "7px 16px" : "8px 18px",
            borderRadius: "10px",
            fontWeight: "700",
            fontSize: isXS ? "12px" : isMobile ? "14px" : "16px",
            textDecoration: "none",
            boxShadow: "0 8px 20px rgba(37,99,235,0.35)",
            transition: "transform 0.2s ease",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-1px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          {isXS ? "Register" : "Register"}
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;