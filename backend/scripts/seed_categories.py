import asyncio

from sqlalchemy import select

from app.categories.models import PricingModel, ServiceCategory
from app.database.session import AsyncSessionLocal

CATEGORIES = [
    {"name": "Plumber", "slug": "plumber", "description": "Pipe repairs and installations", "pricing_model": PricingModel.INSPECTION_QUOTE},
    {"name": "Electrician", "slug": "electrician", "description": "Electrical repairs and wiring", "pricing_model": PricingModel.INSPECTION_QUOTE},
    {"name": "Carpenter", "slug": "carpenter", "description": "Woodwork and furniture repairs", "pricing_model": PricingModel.PROJECT_QUOTE},
    {"name": "AC Repair", "slug": "ac-repair", "description": "AC servicing and repairs", "pricing_model": PricingModel.FIXED},
    {"name": "House Cleaning", "slug": "house-cleaning", "description": "Full house deep cleaning", "pricing_model": PricingModel.FIXED},
    {"name": "Painter", "slug": "painter", "description": "Wall painting and texturing", "pricing_model": PricingModel.PROJECT_QUOTE},
    {"name": "Pest Control", "slug": "pest-control", "description": "Extermination services", "pricing_model": PricingModel.FIXED},
    {"name": "Appliance Repair", "slug": "appliance-repair", "description": "Home appliances fixing", "pricing_model": PricingModel.INSPECTION_QUOTE},
    {"name": "Massage", "slug": "massage", "description": "Spa and massage therapy", "pricing_model": PricingModel.FIXED},
    {"name": "Salon at Home", "slug": "salon-at-home", "description": "Haircut and grooming", "pricing_model": PricingModel.FIXED},
    {"name": "Driver", "slug": "driver", "description": "On-demand driver", "pricing_model": PricingModel.FIXED},
    {"name": "Gardener", "slug": "gardener", "description": "Lawn mowing and plant care", "pricing_model": PricingModel.FIXED},
    {"name": "RO Repair", "slug": "ro-repair", "description": "Water purifier service", "pricing_model": PricingModel.FIXED},
    {"name": "Packers & Movers", "slug": "packers-movers", "description": "Relocation services", "pricing_model": PricingModel.PROJECT_QUOTE},
    {"name": "Laptop Repair", "slug": "laptop-repair", "description": "Computer troubleshooting", "pricing_model": PricingModel.INSPECTION_QUOTE},
    {"name": "Car Wash", "slug": "car-wash", "description": "Car cleaning at home", "pricing_model": PricingModel.FIXED},
    {"name": "Sofa Cleaning", "slug": "sofa-cleaning", "description": "Dry cleaning of sofas", "pricing_model": PricingModel.FIXED},
    {"name": "Mason", "slug": "mason", "description": "Brickwork and tiling", "pricing_model": PricingModel.PROJECT_QUOTE},
    {"name": "Welder", "slug": "welder", "description": "Metal fabrication and repairs", "pricing_model": PricingModel.PROJECT_QUOTE},
    {"name": "Tutor", "slug": "tutor", "description": "Home tutoring services", "pricing_model": PricingModel.FIXED},
]


async def seed():
    async with AsyncSessionLocal() as session:
        for cat_data in CATEGORIES:
            result = await session.execute(select(ServiceCategory).where(ServiceCategory.slug == cat_data["slug"]))
            existing = result.scalar_one_or_none()
            if not existing:
                category = ServiceCategory(
                    name=cat_data["name"],
                    slug=cat_data["slug"],
                    description=cat_data["description"],
                    pricing_model=cat_data["pricing_model"],
                    is_active=True,
                )
                session.add(category)
        
        await session.commit()
        print("Categories seeded successfully")


if __name__ == "__main__":
    asyncio.run(seed())
