/**
 * Component: Reviews
 *
 * Purpose:
 * - Displays user testimonials / feedback
 * - Builds trust and credibility
 *
 * Connected Files:
 * - Used in: Home.jsx
 *
 * Note:
 * - Static content
 */



import { useEffect, useState } from "react";

const stories = [
  {
    name: "Arun Kumar",
    role: "Small Business Owner",
    rating: 5,
    text: "This platform made managing my business accounts extremely simple and stress-free.",
  },
  {
    name: "Priya Sharma",
    role: "Freelance Designer",
    rating: 5,
    text: "Tracking expenses and budgets is effortless. I finally understand where my money goes.",
  },
  {
    name: "Rahul Verma",
    role: "Startup Founder",
    rating: 5,
    text: "The insights and alerts helped me control overspending and plan better every month.",
  },
];

const Reviews = () => {
  const [active, setActive] = useState(0);

  // Auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % stories.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const story = stories[active];

  return (
    <section
      style={{
        padding: "100px 20px",
        background: "#ffffff",
        textAlign: "center",
      }}
    >
      {/* TITLE */}
      <h2
        style={{
          fontSize: "36px",
          fontWeight: "700",
          marginBottom: "10px",
          color: "#0f172a",
        }}
      >
        💬 User Stories
      </h2>

      <p
        style={{
          fontSize: "18px",
          color: "#64748b",
          marginBottom: "50px",
        }}
      >
        Real feedback from professionals using FinBank
      </p>

      {/* REVIEW CARD */}
      <div
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "46px 42px",
          borderRadius: "26px",
          background: "linear-gradient(135deg, #020617, #1e3a8a)",
          color: "#ffffff",
          boxShadow: "0 30px 80px rgba(2,6,23,0.35)",
          transition: "all 0.5s ease",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-10px) scale(1.02)";
          e.currentTarget.style.boxShadow =
            "0 50px 140px rgba(30,58,138,0.65)";
          e.currentTarget.style.background =
            "linear-gradient(135deg, #020617, #2563eb)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0) scale(1)";
          e.currentTarget.style.boxShadow =
            "0 30px 80px rgba(2,6,23,0.35)";
          e.currentTarget.style.background =
            "linear-gradient(135deg, #020617, #1e3a8a)";
        }}
      >
        {/* STARS */}
        <div
          className="review-stars"
          style={{
            marginBottom: "18px",
            fontSize: "18px",
            transition: "transform 0.3s ease",
          }}
        >
          {"⭐".repeat(story.rating)}
        </div>

        {/* TEXT */}
        <p
          style={{
            fontSize: "20px",
            lineHeight: "1.7",
            marginBottom: "28px",
          }}
        >
          “{story.text}”
        </p>

        {/* NAME */}
        <h4 style={{ fontSize: "18px", fontWeight: "700" }}>
          {story.name}
        </h4>

        <p style={{ fontSize: "14px", opacity: 0.9 }}>
          {story.role}
        </p>
      </div>

      {/* SWITCH BUTTONS */}
      <div
        style={{
          marginTop: "36px",
          display: "flex",
          justifyContent: "center",
          gap: "14px",
          flexWrap: "wrap",
        }}
      >
        {stories.map((item, index) => (
          <button
            key={index}
            onClick={() => setActive(index)}
            style={{
              padding: "10px 22px",
              borderRadius: "999px",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              background:
                active === index ? "#1e3a8a" : "#e5e7eb",
              color: active === index ? "#ffffff" : "#111827",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              if (active !== index) {
                e.currentTarget.style.background = "#c7d2fe";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                active === index ? "#1e3a8a" : "#e5e7eb";
            }}
          >
            {item.name.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* STAR HOVER EFFECT */}
      <style>
        {`
          .review-stars:hover {
            transform: scale(1.15);
          }
        `}
      </style>
    </section>
  );
};

export default Reviews;
