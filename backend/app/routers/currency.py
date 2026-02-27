from fastapi import APIRouter
from fastapi.responses import JSONResponse
import requests
from datetime import datetime

router = APIRouter(prefix="/currency", tags=["Currency"])

# Mock exchange rates for demo (in production, use real API like ExchangeRate-API)
MOCK_RATES = {
    "USD": {"INR": 83.25, "EUR": 0.92, "GBP": 0.79, "JPY": 149.50},
    "INR": {"USD": 0.012, "EUR": 0.011, "GBP": 0.0095, "JPY": 1.80},
    "EUR": {"USD": 1.09, "INR": 90.75, "GBP": 0.86, "JPY": 163.20},
    "GBP": {"USD": 1.27, "INR": 105.50, "EUR": 1.16, "JPY": 189.80}
}

@router.get("/rates")
async def get_exchange_rates(base: str = "USD"):
    """Get current exchange rates for a base currency"""
    try:
        if base.upper() in MOCK_RATES:
            rates = MOCK_RATES[base.upper()]
            return JSONResponse(
                content={
                    "base": base.upper(),
                    "rates": rates,
                    "timestamp": datetime.now().isoformat(),
                    "success": True
                },
                headers={"Access-Control-Allow-Origin": "*"}
            )
        else:
            return JSONResponse(
                content={"error": "Unsupported currency", "success": False},
                status_code=400,
                headers={"Access-Control-Allow-Origin": "*"}
            )
    except Exception as e:
        return JSONResponse(
            content={"error": str(e), "success": False},
            status_code=500,
            headers={"Access-Control-Allow-Origin": "*"}
        )

@router.get("/convert")
async def convert_currency(amount: float, from_currency: str, to_currency: str):
    """Convert amount from one currency to another"""
    try:
        from_curr = from_currency.upper()
        to_curr = to_currency.upper()
        
        if from_curr == to_curr:
            return JSONResponse(
                content={
                    "amount": amount,
                    "from": from_curr,
                    "to": to_curr,
                    "result": amount,
                    "rate": 1.0,
                    "timestamp": datetime.now().isoformat()
                },
                headers={"Access-Control-Allow-Origin": "*"}
            )
        
        if from_curr in MOCK_RATES and to_curr in MOCK_RATES[from_curr]:
            rate = MOCK_RATES[from_curr][to_curr]
            result = amount * rate
            
            return JSONResponse(
                content={
                    "amount": amount,
                    "from": from_curr,
                    "to": to_curr,
                    "result": round(result, 2),
                    "rate": rate,
                    "timestamp": datetime.now().isoformat()
                },
                headers={"Access-Control-Allow-Origin": "*"}
            )
        else:
            return JSONResponse(
                content={"error": "Currency conversion not supported", "success": False},
                status_code=400,
                headers={"Access-Control-Allow-Origin": "*"}
            )
    except Exception as e:
        return JSONResponse(
            content={"error": str(e), "success": False},
            status_code=500,
            headers={"Access-Control-Allow-Origin": "*"}
        )

@router.get("/supported")
async def get_supported_currencies():
    """Get list of supported currencies"""
    return JSONResponse(
        content={
            "currencies": list(MOCK_RATES.keys()),
            "count": len(MOCK_RATES)
        },
        headers={"Access-Control-Allow-Origin": "*"}
    )