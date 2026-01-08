from decimal import Decimal
from typing import Dict

# Simple currency conversion rates (in production, use real-time API)
EXCHANGE_RATES = {
    'INR': {'USD': 0.012, 'EUR': 0.010, 'INR': 1.0},
    'USD': {'EUR': 0.85, 'INR': 83.0, 'USD': 1.0},
    'EUR': {'USD': 1.18, 'INR': 97.6, 'EUR': 1.0}
}

def convert_currency(amount: Decimal, from_currency: str, to_currency: str) -> Decimal:
    """Convert amount from one currency to another"""
    if from_currency == to_currency:
        return amount
    
    if from_currency not in EXCHANGE_RATES or to_currency not in EXCHANGE_RATES[from_currency]:
        raise ValueError(f"Conversion from {from_currency} to {to_currency} not supported")
    
    rate = EXCHANGE_RATES[from_currency][to_currency]
    return amount * Decimal(str(rate))

def get_supported_currencies() -> Dict[str, str]:
    """Get list of supported currencies"""
    return {
        'INR': 'Indian Rupee',
        'USD': 'US Dollar',
        'EUR': 'Euro'
    }

def get_default_currency() -> str:
    """Get default currency for the system"""
    return 'INR'