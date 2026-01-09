/**
 * Component: Features
 *
 * Purpose:
 * - Showcases key features of the banking application
 *
 * Examples:
 * - Secure payments
 * - Multiple accounts
 * - Expense tracking
 *
 * Connected Files:
 * - Used in: Home.jsx
 *
 * Note:
 * - Purely informational
 * - No logic or API calls
 */



import { useEffect, useRef } from "react";
import useResponsive from "@/hooks/useResponsive";

const features = [
  {
    title: "Multi-Account Overview",
    desc:
      "View and manage all your bank accounts from one unified dashboard. Track balances, monitor activity, and switch accounts seamlessly without logging into multiple apps.",
    img: "/images/features/accounts.png",
  },
  {
    title: "Transactions & Categorization",
    desc:
      "Automatically track all transactions and categorize spending into food, travel, shopping, bills, and more. Get a clear understanding of where your money goes.",
    img: "/images/features/transactions.png",
  },
  {
    title: "Budgets & Insights",
    desc:
      "Set monthly budgets, track progress, and receive insights that help you control spending and improve savings habits over time.",
    img: "/images/features/budgets.png",
  },
  {
    title: "Bills & Reminders",
    desc:
      "Never miss a payment again. Get smart reminders for electricity, rent, subscriptions, and other recurring bills.",
    img: "/images/features/bills.png",
  },
  {
    title: "Rewards Tracking",
    desc:
      "Monitor reward points, cashback, and benefits across cards and programs in one place so you never miss rewards.",
    img: "/images/features/rewards.png",
  },
  {
    title: "Security & Fraud Protection",
    desc:
      "Your data is protected with bank-grade encryption, secure authentication, and real-time fraud detection systems.",
    img: "/images/features/security.png",
  },
];

const FeaturesStack = () => {
  const cardsRef = useRef([]);
  const { isMobile, isTablet, isXS } = useResponsive();

  useEffect(() => {
    const onScroll = () => {
      cardsRef.current.forEach((card) => {
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const offset = Math.max(0, window.innerHeight * 0.25 - rect.top);
        card.style.transform = `translateY(${-offset * 0.15}px)`;
      });
    };

    if (!isMobile) {
      window.addEventListener("scroll", onScroll);
      return () => window.removeEventListener("scroll", onScroll);
    }
  }, [isMobile]);

  return (
    <section
      id="features"
      style={{
        background: "#ffffff",
        padding: isXS ? "60px 16px" : isMobile ? "80px 20px" : "120px 20px",
      }}
    >
      {/* TITLE */}
      <h2
        style={{
          textAlign: "center",
          fontSize: isXS ? "28px" : isMobile ? "32px" : isTablet ? "36px" : "40px",
          fontWeight: "800",
          marginBottom: "16px",
          color: "#0f172a",
        }}
      >
        ✨ Powerful Features
      </h2>

      <p
        style={{
          textAlign: "center",
          fontSize: isXS ? "14px" : isMobile ? "16px" : "18px",
          color: "#475569",
          marginBottom: isXS ? "40px" : isMobile ? "60px" : "80px",
          maxWidth: "600px",
          margin: `0 auto ${isXS ? "40px" : isMobile ? "60px" : "80px"} auto`,
        }}
      >
        Everything you need to manage your finances in one place
      </p>

      {/* STACK */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          position: "relative",
        }}
      >
        {features.map((item, i) => (
          <div
            key={i}
            ref={(el) => (cardsRef.current[i] = el)}
            style={{
              position: isMobile ? "relative" : "sticky",
              top: isMobile ? "auto" : "120px",
              background: "#ffffff",
              borderRadius: isXS ? "24px" : isMobile ? "32px" : "42px",
              padding: isXS ? "24px" : isMobile ? "32px" : isTablet ? "50px" : "70px",
              marginBottom: isXS ? "32px" : isMobile ? "40px" : "80px",
              boxShadow: "0 40px 90px rgba(0,0,0,0.12)",
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr",
              gap: isXS ? "24px" : isMobile ? "32px" : "60px",
              alignItems: "center",
              zIndex: i,
              transition: "all 0.35s ease",
            }}
            onMouseEnter={(e) => {
              if (!isMobile) {
                e.currentTarget.style.boxShadow =
                  "0 55px 130px rgba(30,64,175,0.25)";
                e.currentTarget.style.transform += " translateY(-6px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isMobile) {
                e.currentTarget.style.boxShadow =
                  "0 40px 90px rgba(0,0,0,0.12)";
              }
            }}
          >
            {/* CONTENT */}
            <div style={{ order: isMobile && i % 2 === 1 ? 2 : 1 }}>
              <h3
                style={{
                  fontSize: isXS ? "22px" : isMobile ? "26px" : isTablet ? "30px" : "34px",
                  fontWeight: "700",
                  marginBottom: "18px",
                  color: "#020617",
                  textAlign: isMobile ? "center" : "left",
                }}
              >
                {item.title}
              </h3>

              <p
                style={{
                  fontSize: isXS ? "14px" : isMobile ? "16px" : "18px",
                  lineHeight: "1.7",
                  color: "#475569",
                  textAlign: isMobile ? "center" : "left",
                }}
              >
                {item.desc}
              </p>
            </div>

            {/* IMAGE */}
            <div
              style={{
                background: "#eef2ff",
                borderRadius: isXS ? "16px" : isMobile ? "20px" : "28px",
                height: isXS ? "180px" : isMobile ? "200px" : "260px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                order: isMobile && i % 2 === 1 ? 1 : 2,
              }}
            >
              <img
                src={item.img}
                alt={item.title}
                style={{
                  maxWidth: "80%",
                  maxHeight: "80%",
                  objectFit: "contain",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesStack;
