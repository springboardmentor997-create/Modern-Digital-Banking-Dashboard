/**
 * Component: Footer
 *
 * Purpose:
 * - Displays footer information across public pages
 *
 * Pages Used:
 * - Home
 * - Login
 * - Register
 *
 * Note:
 * - Static informational component
 */




// import { Link, useNavigate } from "react-router-dom";
// import {
//   Home,
//   Layers,
//   Settings,
//   LogIn,
//   UserPlus,
//   HelpCircle,
//   Shield,
//   FileText,
//   Mail,
//   Lock,
// } from "lucide-react";

// import logoWhite from "@/assets/logo-white.png";

// const Footer = () => {
//   const navigate = useNavigate();

//   // ✅ FIXED scroll (navbar-safe)
//   const scrollTo = (id) => {
//     const el = document.getElementById(id);
//     if (!el) return;

//     const yOffset = -80; // navbar height
//     const y =
//       el.getBoundingClientRect().top +
//       window.pageYOffset +
//       yOffset;

//     window.scrollTo({ top: y, behavior: "smooth" });
//   };

//   const linkStyle = {
//     display: "flex",
//     alignItems: "center",
//     gap: "10px",
//     cursor: "pointer",
//     color: "#c7d2fe",
//     transition: "all 0.3s ease",
//   };

//   const hoverEffect = (e) => {
//     e.currentTarget.style.color = "#ffffff";
//     e.currentTarget.style.transform = "translateX(6px)";
//   };

//   const leaveEffect = (e) => {
//     e.currentTarget.style.color = "#c7d2fe";
//     e.currentTarget.style.transform = "translateX(0)";
//   };

//   return (
//     <footer
//       style={{
//         background:
//           "linear-gradient(135deg, #020617, #0f172a, #1e3a8a)",
//         color: "#ffffff",
//         padding: "70px 60px 30px",
//         marginTop: "100px",
//       }}
//     >
//       {/* TOP */}
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "1.5fr 1fr 1fr",
//           gap: "60px",
//           marginBottom: "50px",
//         }}
//       >
//         {/* BRAND */}
//         <div>
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: "14px",
//               marginBottom: "18px",
//             }}
//           >
//             <img
//               src={logoWhite}
//               alt="Aureus Logo"
//               style={{ width: "90px", height: "74px" }}
//             />
//             <h3 style={{ fontSize: "24px", fontWeight: "800" }}>
//               Aureus
//             </h3>
//           </div>

//           <p
//             style={{
//               fontSize: "15px",
//               lineHeight: "1.8",
//               color: "#cbd5f5",
//               maxWidth: "420px",
//             }}
//           >
//             A secure and smart digital banking platform to manage
//             accounts, track expenses, pay bills, and gain real-time
//             financial insights.
//           </p>
//         </div>

//         {/* QUICK LINKS */}
//         <div>
//           <h4 style={{ marginBottom: "18px", fontSize: "16px" }}>
//             Quick Links
//           </h4>

//           <ul style={{ listStyle: "none", padding: 0, lineHeight: "2.4" }}>
//             <li
//               style={linkStyle}
//               onMouseEnter={hoverEffect}
//               onMouseLeave={leaveEffect}
//               onClick={() => scrollTo("hero")}
//             >
//               <Home size={18} /> Home
//             </li>

//             <li
//               style={linkStyle}
//               onMouseEnter={hoverEffect}
//               onMouseLeave={leaveEffect}
//               onClick={() => scrollTo("features")}
//             >
//               <Layers size={18} /> Features
//             </li>

//             <li
//               style={linkStyle}
//               onMouseEnter={hoverEffect}
//               onMouseLeave={leaveEffect}
//               onClick={() => scrollTo("how-it-works")}
//             >
//               <Settings size={18} /> How It Works
//             </li>

//             <li
//               style={linkStyle}
//               onMouseEnter={hoverEffect}
//               onMouseLeave={leaveEffect}
//               onClick={() => navigate("/login")}
//             >
//               <LogIn size={18} /> Login
//             </li>

//             <li
//               style={linkStyle}
//               onMouseEnter={hoverEffect}
//               onMouseLeave={leaveEffect}
//               onClick={() => navigate("/register")}
//             >
//               <UserPlus size={18} /> Register
//             </li>
//           </ul>
//         </div>

//         {/* SUPPORT */}
//         <div>
//           <h4 style={{ marginBottom: "18px", fontSize: "16px" }}>
//             Support
//           </h4>

//           <ul style={{ listStyle: "none", padding: 0, lineHeight: "2.4" }}>
//             <li style={linkStyle} onMouseEnter={hoverEffect} onMouseLeave={leaveEffect}>
//               <HelpCircle size={18} /> Help Center
//             </li>

//             <li style={linkStyle} onMouseEnter={hoverEffect} onMouseLeave={leaveEffect}>
//               <Shield size={18} /> Privacy Policy
//             </li>

//             <li style={linkStyle} onMouseEnter={hoverEffect} onMouseLeave={leaveEffect}>
//               <FileText size={18} /> Terms of Service
//             </li>

//             <li style={linkStyle} onMouseEnter={hoverEffect} onMouseLeave={leaveEffect}>
//               <Mail size={18} /> Contact Us
//             </li>
//           </ul>
//         </div>
//       </div>

//       {/* DIVIDER */}
//       <div
//         style={{
//           height: "1px",
//           background: "rgba(255,255,255,0.2)",
//           marginBottom: "20px",
//         }}
//       />

//       {/* BOTTOM */}
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           flexWrap: "wrap",
//           fontSize: "14px",
//           color: "#cbd5f5",
//           gap: "10px",
//         }}
//       >
//         <p>© {new Date().getFullYear()} Aureus. All rights reserved.</p>

//         <p style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//           <Lock size={16} /> Secure • Reliable • Modern Banking
//         </p>
//       </div>
//     </footer>
//   );
// };

// export default Footer;

/**
 * Component: Footer
 *
 * Purpose:
 * - Displays footer information across public pages
 *
 * Pages Used:
 * - Home
 * - Login
 * - Register
 *
 * Note:
 * - Static informational component
 */




import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  Layers,
  Settings,
  LogIn,
  UserPlus,
  HelpCircle,
  Shield,
  FileText,
  Mail,
  Lock,
} from "lucide-react";

import logoWhite from "@/assets/logo-white.png";
import "./Footer.css";

const Footer = () => {
  const navigate = useNavigate();

  // ✅ FIXED scroll (navbar-safe)
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;

    const yOffset = -80; // navbar height
    const y =
      el.getBoundingClientRect().top +
      window.pageYOffset +
      yOffset;

    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const linkStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    color: "#c7d2fe",
    transition: "all 0.3s ease",
  };

  const hoverEffect = (e) => {
    e.currentTarget.style.color = "#ffffff";
    e.currentTarget.style.transform = "translateX(6px)";
  };

  const leaveEffect = (e) => {
    e.currentTarget.style.color = "#c7d2fe";
    e.currentTarget.style.transform = "translateX(0)";
  };

  return (
    <footer
      className="footer-container"
      style={{
        background:
          "linear-gradient(135deg, #020617, #0f172a, #1e3a8a)",
        color: "#ffffff",
        padding: "70px 60px 30px",
        marginTop: "100px",
      }}
    >
      {/* TOP */}
      <div
        className="footer-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr 1fr",
          gap: "60px",
          marginBottom: "50px",
        }}
      >
        {/* BRAND */}
        <div className="footer-brand">
          <div
            className="footer-brand-header"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginBottom: "18px",
            }}
          >
            <img
              src={logoWhite}
              alt="Aureus Logo"
              className="footer-brand-logo"
              style={{ width: "90px", height: "74px" }}
            />
            <h3 className="footer-brand-title" style={{ fontSize: "24px", fontWeight: "800" }}>
              Aureus
            </h3>
          </div>

          <p
            className="footer-brand-desc"
            style={{
              fontSize: "15px",
              lineHeight: "1.8",
              color: "#cbd5f5",
              maxWidth: "420px",
            }}
          >
            A secure and smart digital banking platform to manage
            accounts, track expenses, pay bills, and gain real-time
            financial insights.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h4 className="footer-section-title" style={{ marginBottom: "18px", fontSize: "16px" }}>
            Quick Links
          </h4>

          <ul className="footer-links" style={{ listStyle: "none", padding: 0, lineHeight: "2.4" }}>
            <li
              className="footer-link-item"
              style={linkStyle}
              onMouseEnter={hoverEffect}
              onMouseLeave={leaveEffect}
              onClick={() => scrollTo("hero")}
            >
              <Home size={18} /> Home
            </li>

            <li
              className="footer-link-item"
              style={linkStyle}
              onMouseEnter={hoverEffect}
              onMouseLeave={leaveEffect}
              onClick={() => scrollTo("features")}
            >
              <Layers size={18} /> Features
            </li>

            <li
              className="footer-link-item"
              style={linkStyle}
              onMouseEnter={hoverEffect}
              onMouseLeave={leaveEffect}
              onClick={() => scrollTo("how-it-works")}
            >
              <Settings size={18} /> How It Works
            </li>

            <li
              className="footer-link-item"
              style={linkStyle}
              onMouseEnter={hoverEffect}
              onMouseLeave={leaveEffect}
              onClick={() => navigate("/login")}
            >
              <LogIn size={18} /> Login
            </li>

            <li
              className="footer-link-item"
              style={linkStyle}
              onMouseEnter={hoverEffect}
              onMouseLeave={leaveEffect}
              onClick={() => navigate("/register")}
            >
              <UserPlus size={18} /> Register
            </li>
          </ul>
        </div>

        {/* SUPPORT */}
        <div>
          <h4 className="footer-section-title" style={{ marginBottom: "18px", fontSize: "16px" }}>
            Support
          </h4>

          <ul className="footer-links" style={{ listStyle: "none", padding: 0, lineHeight: "2.4" }}>
            <li className="footer-link-item" style={linkStyle} onMouseEnter={hoverEffect} onMouseLeave={leaveEffect}>
              <HelpCircle size={18} /> Help Center
            </li>

            <li className="footer-link-item" style={linkStyle} onMouseEnter={hoverEffect} onMouseLeave={leaveEffect}>
              <Shield size={18} /> Privacy Policy
            </li>

            <li className="footer-link-item" style={linkStyle} onMouseEnter={hoverEffect} onMouseLeave={leaveEffect}>
              <FileText size={18} /> Terms of Service
            </li>

            <li className="footer-link-item" style={linkStyle} onMouseEnter={hoverEffect} onMouseLeave={leaveEffect}>
              <Mail size={18} /> Contact Us
            </li>
          </ul>
        </div>
      </div>

      {/* DIVIDER */}
      <div
        style={{
          height: "1px",
          background: "rgba(255,255,255,0.2)",
          marginBottom: "20px",
        }}
      />

      {/* BOTTOM */}
      <div
        className="footer-bottom"
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          fontSize: "14px",
          color: "#cbd5f5",
          gap: "10px",
        }}
      >
        <p>© {new Date().getFullYear()} Aureus. All rights reserved.</p>

        <p style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Lock size={16} /> Secure • Reliable • Modern Banking
        </p>
      </div>
    </footer>
  );
};

export default Footer;