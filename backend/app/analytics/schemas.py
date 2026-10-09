from pydantic import BaseModel


class PeriodStats(BaseModel):
    today: int
    week: int
    month: int

class PeriodRevenue(BaseModel):
    today: int  # in paise
    week: int
    month: int

class AnalyticsSummaryResponse(BaseModel):
    bookings: PeriodStats
    revenue: PeriodRevenue
    new_users: int
    new_workers: int
    pending_kyc: int
