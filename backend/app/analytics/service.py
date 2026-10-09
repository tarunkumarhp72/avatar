from datetime import UTC, datetime, timedelta

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.analytics.schemas import AnalyticsSummaryResponse, PeriodRevenue, PeriodStats
from app.bookings.models import Booking, BookingStatus
from app.users.models import User, UserRole
from app.workers.models import WorkerLifecycleStatus, WorkerProfile


async def get_analytics_summary(db: AsyncSession) -> AnalyticsSummaryResponse:
    now = datetime.now(UTC)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=now.weekday())
    month_start = today_start.replace(day=1)

    # Bookings count
    async def get_booking_count(start_time: datetime) -> int:
        stmt = select(func.count(Booking.id)).where(Booking.created_at >= start_time)
        res = await db.execute(stmt)
        return res.scalar_one() or 0

    bookings_today = await get_booking_count(today_start)
    bookings_week = await get_booking_count(week_start)
    bookings_month = await get_booking_count(month_start)

    # Revenue (platform_fee_paise from paid bookings)
    async def get_revenue(start_time: datetime) -> int:
        stmt = select(func.sum(Booking.platform_fee_paise)).where(
            and_(
                Booking.status == BookingStatus.PAID,
                Booking.created_at >= start_time
            )
        )
        res = await db.execute(stmt)
        return res.scalar_one() or 0

    revenue_today = await get_revenue(today_start)
    revenue_week = await get_revenue(week_start)
    revenue_month = await get_revenue(month_start)

    # New users / workers
    new_users_stmt = select(func.count(User.id)).where(User.role == UserRole.CUSTOMER)
    new_users = (await db.execute(new_users_stmt)).scalar_one() or 0

    new_workers_stmt = select(func.count(User.id)).where(User.role == UserRole.WORKER)
    new_workers = (await db.execute(new_workers_stmt)).scalar_one() or 0

    # Pending KYC
    pending_kyc_stmt = select(func.count(WorkerProfile.id)).where(WorkerProfile.status == WorkerLifecycleStatus.PENDING_KYC)
    pending_kyc = (await db.execute(pending_kyc_stmt)).scalar_one() or 0

    return AnalyticsSummaryResponse(
        bookings=PeriodStats(today=bookings_today, week=bookings_week, month=bookings_month),
        revenue=PeriodRevenue(today=revenue_today, week=revenue_week, month=revenue_month),
        new_users=new_users,
        new_workers=new_workers,
        pending_kyc=pending_kyc
    )
