import { getBudgets } from "@/services/api";
import { createContext, useContext, useState } from "react";

const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
  const [budgets, setBudgets] = useState([
    // sample structure (later from backend)
    {
      id: 1,
      category: "Food",
      limit_amount: 10000,
      spent_amount: 9500,
    },
  ]);

  const applyPaymentToBudget = (category, amount) => {
    setBudgets((prev) =>
      prev.map((b) =>
        b.category === category
          ? { ...b, spent_amount: b.spent_amount + amount }
          : b
      )
    );
  };

  const checkBudget = (category, amount) => {
    const budget = budgets.find((b) => b.category === category);
    if (!budget) return { status: "no-budget" };

    const remaining = budget.limit_amount - budget.spent_amount;

    if (amount > remaining) {
      return {
        status: "exceeded",
        exceededBy: amount - remaining,
        budget,
      };
    }

    if (remaining - amount <= budget.limit_amount * 0.2) {
      return { status: "near", budget };
    }

    return { status: "ok", budget };
  };

  return (
    <BudgetContext.Provider
      value={{ budgets, checkBudget, applyPaymentToBudget }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudgets = () => useContext(BudgetContext);
