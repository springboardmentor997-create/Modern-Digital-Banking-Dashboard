"""
Bills Categories

Purpose:
- Central source of truth for bill types
- Used for validation + transaction category mapping
"""

BILL_CATEGORIES = {
    "electricity": {
        "category": "Bills",
        "description": "Electricity Bill Payment"
    },
    "mobile_recharge": {
        "category": "Bills",
        "description": "Mobile Recharge"
    },
    "subscription": {
        "category": "Bills",
        "description": "Subscription Payment"
    },
    "credit_card": {
        "category": "Bills",
        "description": "Credit Card Bill Payment"
    },
    "fastag": {
        "category": "Bills",
        "description": "FASTag Recharge"
    },
    "google_play": {
        "category": "Bills",
        "description": "Google Play Recharge"
    }
}
