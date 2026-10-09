from collections.abc import Sequence

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_worker
from app.core.exceptions import AppError
from app.database.session import get_db
from app.subscriptions.models import SubscriptionPlan, WorkerSubscription
from app.subscriptions.schemas import SubscriptionPlanResponse, WorkerSubscriptionResponse
from app.users.models import User
from app.workers.models import WorkerProfile

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])

@router.get("/plans", response_model=list[SubscriptionPlanResponse])
async def list_plans(db: AsyncSession = Depends(get_db)) -> Sequence[SubscriptionPlan]:
    result = await db.execute(select(SubscriptionPlan).where(SubscriptionPlan.is_active == True))
    return result.scalars().all()

@router.get("/workers/me", response_model=WorkerSubscriptionResponse)
async def get_my_subscription(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_worker)
) -> WorkerSubscription:
    user = current_user
    
    wp_result = await db.execute(select(WorkerProfile).where(WorkerProfile.user_id == user.id))
    wp = wp_result.scalar_one_or_none()
    
    if not wp:
        raise AppError("NOT_FOUND", "Worker profile not found", 404)
        
    sub_result = await db.execute(
        select(WorkerSubscription)
        .where(WorkerSubscription.worker_id == wp.id, WorkerSubscription.is_active == True)
        .order_by(WorkerSubscription.ends_at.desc())
    )
    sub = sub_result.scalars().first()
    
    if not sub:
        raise AppError("NOT_FOUND", "No active subscription", 404)
        
    return sub
