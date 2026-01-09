/**
 * Component: HowItWorks
 *
 * Purpose:
 * - Explains step-by-step how the application works
 * - Helps new users understand the flow
 *
 * Steps Explained:
 * - Create account
 * - Add bank account
 * - Create transaction PIN
 * - Send payments securely
 *
 * Connected Files:
 * - Used in: Home.jsx
 */




const HowItWorks = () => {
  const steps = [
    {
      step: "01",
      icon: "🧾",
      title: "Create an Account",
      desc: "Sign up securely using your email and basic details.",
    },
    {
      step: "02",
      icon: "🏦",
      title: "Add Bank Accounts",
      desc: "Link or add your bank accounts to the dashboard.",
    },
    {
      step: "03",
      icon: "📈",
      title: "Track Spending",
      desc: "View transactions, categories, and monthly expenses.",
    },
    {
      step: "04",
      icon: "💡",
      title: "Get Smart Insights",
      desc: "Analyze budgets, bills, and financial insights in one place.",
    },
  ];

  return (
    <section
      id="how-it-works"
      style={{
        padding: "90px 60px",
        backgroundColor: "#f1f5f9",
      }}
    >
      {/* SECTION TITLE */}
      <h2
        style={{
          textAlign: "center",
          fontSize: "36px",
          marginBottom: "12px",
          color: "#0f172a",
          fontWeight: "700",
        }}
      >
        ⚙️ How It Works
      </h2>

      <p
        style={{
          textAlign: "center",
          fontSize: "18px",
          marginBottom: "60px",
          color: "#475569",
        }}
      >
        Get started with digital banking in just a few simple steps
      </p>

      {/* STEPS GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "32px",
        }}
      >
        {steps.map((item, index) => (
          <div
            key={index}
            style={{
              padding: "36px 30px",
              borderRadius: "16px",
              backgroundColor: "#ffffff",
              boxShadow: "0 10px 28px rgba(0,0,0,0.08)",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow =
                "0 18px 40px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 10px 28px rgba(0,0,0,0.08)";
            }}
          >
            {/* STEP NUMBER */}
            <div
              style={{
                width: "52px",
                height: "52px",
                margin: "0 auto 16px",
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, #7f3aed, #3b82f6)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                fontSize: "16px",
              }}
            >
              {item.step}
            </div>

            {/* ICON */}
            <div
              style={{
                fontSize: "26px",
                marginBottom: "14px",
              }}
            >
              {item.icon}
            </div>

            {/* TITLE */}
            <h3
              style={{
                fontSize: "20px",
                marginBottom: "10px",
                color: "#111827",
                fontWeight: "600",
              }}
            >
              {item.title}
            </h3>

            {/* DESCRIPTION */}
            <p
              style={{
                fontSize: "16px",
                color: "#6b7280",
                lineHeight: "1.6",
              }}
            >
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
