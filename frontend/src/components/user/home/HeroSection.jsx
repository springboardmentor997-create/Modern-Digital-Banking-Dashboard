/**
 * Component: HeroSection
 *
 * Purpose:
 * - Top visual section of the Home page
 * - Highlights product value and main call-to-action
 *
 * Key Behavior:
 * - Displays headline, subtitle, and action buttons
 * - Encourages user to Sign Up or Login
 *
 * Connected Files:
 * - Used in: Home.jsx
 *
 * Note:
 * - Static UI component
 */




import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  CreditCard,
  BarChart3,
  Wallet,
  ShieldCheck,
  Bell,
} from "lucide-react";
import useResponsive from "@/hooks/useResponsive";

/* ---------------- CARD DATA ---------------- */

const cards = [
  {
    icon: CreditCard,
    title: "Smart Accounts",
    points: [
      "→ Multiple bank accounts",
      "→ Unified dashboard",
      "→ Secure access",
      "→ Easy switching",
    ],
  },
  {
    icon: BarChart3,
    title: "Expense Analytics",
    points: [
      "→ Real-time charts",
      "→ Spending categories",
      "→ Monthly insights",
      "→ Trend tracking",
    ],
  },
  {
    icon: Wallet,
    title: "Budgets & Control",
    points: [
      "→ Monthly budgets",
      "→ Spending limits",
      "→ Category control",
      "→ Smart planning",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Bank-Grade Security",
    points: [
      "→ 256-bit encryption",
      "→ Secure login",
      "→ Fraud detection",
      "→ Data protection",
    ],
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    points: [
      "→ Bill reminders",
      "→ Spending alerts",
      "→ Unusual activity",
      "→ Monthly summaries",
    ],
  },
];

/* ---------------- SLIDING CARDS ---------------- */

const SlidingCards = () => {
  const [index, setIndex] = useState(0);
  const { isMobile, isTablet, isXS } = useResponsive();

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % cards.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const handleLearnMore = () => {
    const el = document.getElementById("features");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: isXS ? "320px" : isMobile ? "360px" : isTablet ? "400px" : "420px",
        overflow: "hidden",
        borderRadius: isMobile ? "16px" : "22px",
      }}
    >
      {cards.map((card, i) => {
        const Icon = card.icon;
        const slideDistance = "100%";
        const active = i === index;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              padding: isXS ? "20px" : isMobile ? "24px" : isTablet ? "32px" : "38px",
              borderRadius: isMobile ? "16px" : "22px",
              background: "linear-gradient(145deg, #f8fafc, #e0e7ff)",
              color: "#020617",
              boxShadow: "0 25px 70px rgba(2,6,23,0.6)",
              transform:
                active
                  ? "translateX(0)"
                  : i < index
                  ? `translateX(-${slideDistance})`
                  : `translateX(${slideDistance})`,
              opacity: active ? 1 : 0,
              transition: "all 0.9s ease",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            {/* ICON WITH ANIMATION */}
            <div
              style={{
                width: isXS ? "48px" : "56px",
                height: isXS ? "48px" : "56px",
                borderRadius: "14px",
                background: "rgba(15,23,42,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: active
                  ? "scale(1) translateY(-6px)"
                  : "scale(0.85) translateY(0)",
                boxShadow: active
                  ? "0 0 0 8px rgba(37,99,235,0.18)"
                  : "0 0 0 0 rgba(0,0,0,0)",
                opacity: active ? 1 : 0.6,
                transition:
                  "transform 0.7s cubic-bezier(0.22,1,0.36,1), box-shadow 0.7s ease, opacity 0.5s ease",
              }}
            >
              <Icon
                size={isXS ? 20 : 26}
                color="#facc15"
                style={{
                  transform: active ? "scale(1.1)" : "scale(1)",
                  transition: "transform 0.6s ease",
                }}
              />
            </div>

            {/* CONTENT */}
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  fontSize: isXS ? "18px" : isMobile ? "20px" : "22px",
                  fontWeight: "700",
                  marginBottom: "14px",
                }}
              >
                {card.title}
              </h3>

              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  color: "#334155",
                  fontSize: isXS ? "13px" : isMobile ? "14px" : "15px",
                  lineHeight: "1.8",
                }}
              >
                {card.points.map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
            </div>

            {/* LEARN MORE */}
            <button
              onClick={handleLearnMore}
              style={{
                alignSelf: "flex-start",
                background: "#2563eb",
                color: "#ffffff",
                border: "none",
                padding: isXS ? "8px 14px" : "10px 18px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: isXS ? "13px" : "14px",
              }}
            >
              Learn More →
            </button>
          </div>
        );
      })}

      {/* DOT INDICATORS */}
      <div
        style={{
          position: "absolute",
          bottom: "14px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "8px",
        }}
      >
        {cards.map((_, i) => (
          <span
            key={i}
            style={{
              width: isXS ? "6px" : "8px",
              height: isXS ? "6px" : "8px",
              borderRadius: "50%",
              backgroundColor: i === index ? "#2563eb" : "#cbd5f5",
              transition: "background 0.3s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
};

/* ---------------- HERO SECTION ---------------- */

const HeroSection = () => {
  const { isMobile, isTablet, isXS } = useResponsive();

  return (
    <section
      id="hero"
      style={{
        backgroundColor: "#f8fafc",
        padding: isXS ? "40px 16px" : isMobile ? "50px 20px" : "70px 20px",
      }}
    >
      <div
        className="hero-card"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          borderRadius: isMobile ? "20px" : "28px",
          padding: isXS ? "24px" : isMobile ? "32px" : isTablet ? "50px" : "70px",
          background: "linear-gradient(135deg, #020617, #0f172a, #1e3a8a)",
          color: "#ffffff",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? "32px" : "40px",
          alignItems: "center",
          boxShadow: "0 30px 80px rgba(2,6,23,0.55)",
        }}
      >
        {/* LEFT */}
        <div style={{ textAlign: isMobile ? "center" : "left" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "rgba(255,255,255,0.12)",
              padding: isXS ? "4px 10px" : "6px 14px",
              borderRadius: "999px",
              fontSize: isXS ? "12px" : "14px",
              marginBottom: "16px",
            }}
          >
            ⭐ Trusted by modern digital users
          </span>

          <h1
            style={{
              fontSize: isXS ? "28px" : isMobile ? "34px" : isTablet ? "42px" : "48px",
              fontWeight: "800",
              lineHeight: "1.15",
              marginBottom: "18px",
            }}
          >
            Modern Digital <br /> Banking
          </h1>

          <p
            style={{
              fontSize: isXS ? "14px" : isMobile ? "16px" : "18px",
              color: "#cbd5f5",
              lineHeight: "1.6",
              maxWidth: "520px",
              margin: isMobile ? "0 auto 34px" : "0 0 34px",
            }}
          >
            Smart & secure banking to manage accounts, track expenses,
            pay bills, and get real-time insights — all in one place.
          </p>

          <Link
            to="/register"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#facc15",
              color: "#020617",
              padding: isXS ? "10px 20px" : isMobile ? "12px 26px" : "14px 34px",
              borderRadius: "14px",
              fontWeight: "700",
              fontSize: isXS ? "14px" : "16px",
              textDecoration: "none",
              boxShadow: "0 14px 30px rgba(250,204,21,0.45)",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            🚀 Get Started
          </Link>
        </div>

        {/* RIGHT */}
        <SlidingCards />
      </div>
    </section>
  );
};

export default HeroSection;
