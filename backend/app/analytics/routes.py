from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.analytics.schemas import AnalyticsSummaryResponse
from app.analytics.service import get_analytics_summary
from app.core.dependencies import get_db, require_admin

router = APIRouter(prefix="/analytics", tags=["admin_analytics"])

@router.get("/summary", response_model=AnalyticsSummaryResponse)
async def admin_get_analytics_summary(
    db: AsyncSession = Depends(get_db),
    _=Depends(require_admin)
) -> AnalyticsSummaryResponse:
    """Get basic analytics summary (admin only)."""
    return await get_analytics_summary(db)
