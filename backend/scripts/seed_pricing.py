import asyncio
import datetime
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import engine
from app.pricing.models import PricingModel, PricingRule
from app.users.models import User, UserRole


async def seed_pricing():
    async with AsyncSession(engine) as session:
        # Check if rules already exist
        from sqlalchemy import select
        result = await session.execute(select(PricingRule).limit(1))
        if result.scalar_one_or_none():
            print("Pricing rules already seeded. Skipping.")
            return

        # Get an admin user
        result = await session.execute(select(User).where(User.role == UserRole.ADMIN).limit(1))
        admin = result.scalar_one_or_none()
        
        if not admin:
            admin = User(
                id=uuid.uuid4(),
                phone="+9999999990",
                full_name="Seed Admin",
                role=UserRole.ADMIN,
                is_active=True
            )
            session.add(admin)
            await session.commit()
            await session.refresh(admin)

        # Create basic pricing rules (Global)
        global_rule = PricingRule(
            id=uuid.uuid4(),
            category_id=None,
            area_id=None,
            pricing_model=PricingModel.FIXED,
            base_amount_paise=50000,  # 500 INR
            visit_fee_paise=10000,    # 100 INR
            distance_fee_per_km_paise=1500, # 15 INR/km
            distance_fee_threshold_km=5.0,
            emergency_fee_paise=30000, # 300 INR
            platform_fee_percent=10.0,
            worker_commission_percent=90.0,
            material_charges_allowed=True,
            material_charges_max_paise=500000, # 5000 INR
            effective_from=datetime.date(2026, 1, 1),
            effective_until=None,
            created_by=admin.id
        )
        
        session.add(global_rule)
        await session.commit()
        print("Pricing rules seeded successfully.")

if __name__ == "__main__":
    asyncio.run(seed_pricing())
