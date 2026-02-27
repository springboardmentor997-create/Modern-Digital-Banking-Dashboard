from fastapi import APIRouter
from fastapi.responses import JSONResponse

# Admin rewards router - handles reward management endpoints
router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/rewards/recent")
async def get_recent_rewards():
    return JSONResponse(
        content=[],
        headers={"Access-Control-Allow-Origin": "*"}
    )

@router.post("/users/{user_id}/give-reward")
async def give_reward_to_user(user_id: int):
    return JSONResponse(
        content={"message": f"Successfully gave reward to user {user_id}"},
        headers={"Access-Control-Allow-Origin": "*"}
    )