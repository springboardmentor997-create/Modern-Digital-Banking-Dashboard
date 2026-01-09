/**
 * Component: FAQ
 *
 * Purpose:
 * - Displays Frequently Asked Questions for users
 * - Helps users understand common doubts without contacting support
 *
 * Content Includes:
 * - Account creation
 * - Transaction PIN usage
 * - Payments & security
 *
 * Connected Files:
 * - Used in: Home.jsx or Help / Support sections
 *
 * Note:
 * - Static informational component
 * - No API calls or state management
 */



import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Is Aureus safe to use?",
    a: "Yes. Aureus uses bank-grade encryption, secure authentication, and best practices to protect your financial data at all times.",
  },
  {
    q: "Can I add multiple bank accounts?",
    a: "Absolutely. You can add and manage multiple bank accounts in one unified dashboard without switching apps.",
  },
  {
    q: "How does transaction tracking work?",
    a: "All your transactions are automatically recorded and categorized so you can clearly see where your money is going.",
  },
  {
    q: "Will I get alerts for bills and budgets?",
    a: "Yes. Aureus sends smart alerts for bill due dates, budget limits, and unusual spending activity.",
  },
  {
    q: "Is Aureus free to use?",
    a: "Aureus offers core features for free. Advanced insights and premium tools may be introduced later.",
  },
];

const FAQ = () => {
  const [open, setOpen] = useState(null);

  return (
    <section
      id="faq"
      style={{
        padding: "100px 20px",
        background: "#f8fafc",
      }}
    >
      {/* TITLE */}
      <div style={{ textAlign: "center", marginBottom: "60px" }}>
        <h2
          style={{
            fontSize: "38px",
            fontWeight: "800",
            color: "#0f172a",
            marginBottom: "10px",
          }}
        >
          ❓ Frequently Asked Questions
        </h2>

        <p
          style={{
            fontSize: "18px",
            color: "#475569",
          }}
        >
          Everything you need to know about Aureus
        </p>
      </div>

      {/* FAQ LIST */}
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        {faqs.map((item, index) => {
          const isOpen = open === index;

          return (
            <div
              key={index}
              style={{
                background: "#ffffff",
                borderRadius: "18px",
                boxShadow: "0 18px 40px rgba(2,6,23,0.08)",
                overflow: "hidden",
                transition: "all 0.3s ease",
              }}
            >
              {/* QUESTION */}
              <button
                onClick={() => setOpen(isOpen ? null : index)}
                style={{
                  width: "100%",
                  padding: "22px 26px",
                  background: "transparent",
                  border: "none",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  fontSize: "17px",
                  fontWeight: "700",
                  color: "#020617",
                }}
              >
                {item.q}

                <ChevronDown
                  size={22}
                  style={{
                    transition: "transform 0.3s ease",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                    color: "#facc15", // gold
                  }}
                />
              </button>

              {/* ANSWER */}
              <div
                style={{
                  maxHeight: isOpen ? "200px" : "0",
                  overflow: "hidden",
                  transition: "max-height 0.35s ease",
                }}
              >
                <p
                  style={{
                    padding: "0 26px 22px",
                    fontSize: "16px",
                    lineHeight: "1.7",
                    color: "#475569",
                  }}
                >
                  {item.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FAQ;
