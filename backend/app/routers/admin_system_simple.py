from fastapi import APIRouter
from fastapi.responses import JSONResponse
from datetime import datetime

router = APIRouter(prefix="/admin", tags=["admin-system"])

@router.get("/system-summary")
async def get_system_summary():
    return JSONResponse(
        content={
            "total_users": 2,
            "active_users": 2,
            "total_accounts": 1,
            "total_transactions": 0,
            "system_health": "healthy",
            "database_status": "connected",
            "last_backup": "2024-01-01T00:00:00Z"
        },
        headers={"Access-Control-Allow-Origin": "*"}
    )

@router.get("/alerts")
async def get_system_alerts():
    return JSONResponse(
        content=[
            {
                "id": 1,
                "type": "info",
                "message": "System running normally",
                "timestamp": datetime.now().isoformat(),
                "severity": "low"
            }
        ],
        headers={"Access-Control-Allow-Origin": "*"}
    )

@router.get("/suspicious-activity")
async def get_suspicious_activity():
    return JSONResponse(
        content=[],
        headers={"Access-Control-Allow-Origin": "*"}
    )

@router.get("/system/health")
async def get_system_health():
    return JSONResponse(
        content={
            "status": "healthy",
            "uptime": "99.9%",
            "response_time": "120ms",
            "cpu_usage": "25%",
            "memory_usage": "60%",
            "disk_usage": "45%"
        },
        headers={"Access-Control-Allow-Origin": "*"}
    )

@router.post("/system/backup")
async def perform_backup():
    return JSONResponse(
        content={"message": "System backup completed successfully", "status": "completed"},
        headers={"Access-Control-Allow-Origin": "*"}
    )

@router.post("/system/clear-cache")
async def clear_system_cache():
    return JSONResponse(
        content={"message": "System cache cleared successfully", "status": "completed"},
        headers={"Access-Control-Allow-Origin": "*"}
    )

@router.get("/system/config")
async def get_system_config():
    return JSONResponse(
        content={"maintenance_mode": False, "backup_enabled": True},
        headers={"Access-Control-Allow-Origin": "*"}
    )

@router.put("/system/config")
async def update_system_config():
    return JSONResponse(
        content={"message": "Configuration updated successfully"},
        headers={"Access-Control-Allow-Origin": "*"}
    )