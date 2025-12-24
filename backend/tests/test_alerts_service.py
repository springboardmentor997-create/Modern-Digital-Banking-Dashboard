from app.database import SessionLocal
from app.alerts.service import create_budget_exceeded_alert
from app.budgets.models import Budget
from app.alerts.models import Alerts


def run_test():
    db = SessionLocal()

    USER_ID = 2  # we already agreed this is your existing user

    # Fetch any existing budget for this user
    budget = (
        db.query(Budget)
        .filter(Budget.user_id == USER_ID)
        .first()
    )

    if not budget:
        print("No budget found for user. Create a budget first.")
        return

    print("Creating budget exceeded alert...")
    alert = create_budget_exceeded_alert(
        db=db,
        user_id=USER_ID,
        budget=budget,
    )

    if alert:
        print("Alert created:", alert.id)
    else:
        print("Alert already exists, no duplicate created.")

    # Verify alerts count
    alerts_count = (
        db.query(Alerts)
        .filter(Alerts.user_id == USER_ID)
        .count()
    )

    print("Total alerts for user:", alerts_count)

    db.close()


if __name__ == "__main__":
    run_test()
