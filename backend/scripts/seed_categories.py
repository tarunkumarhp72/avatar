import asyncio

from sqlalchemy import select

from app.categories.models import PricingModel, ServiceCategory
from app.database.session import AsyncSessionLocal

CATEGORIES = [
    {
        "name": "House Cleaning",
        "slug": "cleaning",
        "description": "Full house deep cleaning, sanitization, and room upkeep",
        "noun": "house cleaner",
        "base_price": 599,
        "pricing_model": PricingModel.FIXED,
        "sort_order": 1,
        "items": [
            {"id": "c0", "name": "Standard home clean", "desc": "Dusting, floors, kitchen and bathrooms", "time": "2–3 hrs", "add": 0, "em": False},
            {"id": "c1", "name": "Deep clean", "desc": "Top to bottom, inside appliances", "time": "4–5 hrs", "add": 700, "em": False},
            {"id": "c2", "name": "Kitchen and bathrooms", "desc": "Grease, limescale and tile scrub", "time": "2 hrs", "add": 250, "em": False},
            {"id": "c3", "name": "Move-in or move-out", "desc": "Empty-home clean for handover", "time": "4 hrs", "add": 900, "em": False},
            {"id": "c4", "name": "Sofa and carpet", "desc": "Shampoo and stain treatment", "time": "2 hrs", "add": 450, "em": False},
            {"id": "c5", "name": "Same-day urgent clean", "desc": "Guests arriving or inspection today", "time": "under 60 min", "add": 0, "em": True},
        ],
    },
    {
        "name": "Maid",
        "slug": "maid",
        "description": "Daily housekeeping, meal prep support, and home chores",
        "noun": "house maid",
        "base_price": 499,
        "pricing_model": PricingModel.FIXED,
        "sort_order": 2,
        "items": [
            {"id": "m_0", "name": "Daily housekeeping & dusting", "desc": "Sweeping, mopping, tidying rooms", "time": "1–2 hrs", "add": 0, "em": False},
            {"id": "m_1", "name": "Kitchen utensil cleaning", "desc": "Dishwashing, counter wipe, sink clean", "time": "45 min", "add": 50, "em": False},
            {"id": "m_2", "name": "Clothes washing & folding", "desc": "Machine wash, hand wash and fold", "time": "60 min", "add": 100, "em": False},
            {"id": "m_3", "name": "Full house helper (day)", "desc": "Complete day household chores", "time": "4 hrs", "add": 400, "em": False},
            {"id": "m_4", "name": "Post-party quick cleanup", "desc": "Trash clearance and floor scrubbing", "time": "90 min", "add": 200, "em": False},
            {"id": "m_5", "name": "Emergency same-day helper", "desc": "Immediate maid assistance", "time": "under 45 min", "add": 0, "em": True},
        ],
    },
    {
        "name": "Plumber",
        "slug": "plumber",
        "description": "Leak detection, pipe repairs, faucet fixtures, and drain cleaning",
        "noun": "licensed plumber",
        "base_price": 499,
        "pricing_model": PricingModel.INSPECTION_QUOTE,
        "sort_order": 3,
        "items": [
            {"id": "p0", "name": "Leaking pipe or faucet", "desc": "Sink, vanity, supply lines, valves", "time": "30–60 min", "add": 0, "em": False},
            {"id": "p1", "name": "Clogged drain", "desc": "Standing water, slow or backed-up drains", "time": "45 min", "add": 150, "em": False},
            {"id": "p2", "name": "Water heater repair", "desc": "No hot water, tank leaks, pilot issues", "time": "60–90 min", "add": 350, "em": False},
            {"id": "p3", "name": "Toilet running or overflowing", "desc": "Flush valve, seal and chain repair", "time": "30–45 min", "add": 100, "em": False},
            {"id": "p4", "name": "Low water pressure", "desc": "Regulator and aerator checks", "time": "45 min", "add": 120, "em": False},
            {"id": "p5", "name": "Burst pipe or flooding", "desc": "Active flooding, shut-off help", "time": "under 30 min", "add": 0, "em": True},
        ],
    },
    {
        "name": "Electrician",
        "slug": "electrician",
        "description": "Wiring, circuit breakers, lighting installation, and electrical safety",
        "noun": "licensed electrician",
        "base_price": 449,
        "pricing_model": PricingModel.INSPECTION_QUOTE,
        "sort_order": 4,
        "items": [
            {"id": "e0", "name": "Breaker keeps tripping", "desc": "Overloaded circuits and sub-panel checks", "time": "45 min", "add": 100, "em": False},
            {"id": "e1", "name": "Dead outlet or switch", "desc": "Replace sockets, dimmers and switches", "time": "30 min", "add": 0, "em": False},
            {"id": "e2", "name": "Light or fan install", "desc": "Chandeliers, ceiling fans, smart switches", "time": "60 min", "add": 150, "em": False},
            {"id": "e3", "name": "Panel upgrade or rewiring", "desc": "Breaker box, surge protection, rewiring", "time": "2–3 hrs", "add": 1200, "em": False},
            {"id": "e4", "name": "Inverter or UPS check", "desc": "Wiring and battery health check", "time": "40 min", "add": 100, "em": False},
            {"id": "e5", "name": "Sparks or burning smell", "desc": "Short-circuit risk. Switch off at the mains", "time": "under 30 min", "add": 0, "em": True},
        ],
    },
    {
        "name": "Mechanic",
        "slug": "mechanic",
        "description": "Doorstep vehicle diagnostic, battery swap, and roadside repairs",
        "noun": "mobile mechanic",
        "base_price": 549,
        "pricing_model": PricingModel.INSPECTION_QUOTE,
        "sort_order": 5,
        "items": [
            {"id": "m0", "name": "Car will not start", "desc": "Battery, starter and fuel checks", "time": "45 min", "add": 0, "em": False},
            {"id": "m1", "name": "Brake or clutch issue", "desc": "Pads, discs, fluid and cable work", "time": "90 min", "add": 400, "em": False},
            {"id": "m2", "name": "Battery replacement", "desc": "Test, remove and fit a new battery", "time": "30 min", "add": 200, "em": False},
            {"id": "m3", "name": "Oil and routine service", "desc": "Oil, filters and a full inspection", "time": "90 min", "add": 350, "em": False},
            {"id": "m4", "name": "Flat tyre or puncture", "desc": "Repair or swap with your spare", "time": "30 min", "add": 0, "em": False},
            {"id": "m5", "name": "Broken down on the road", "desc": "Priority roadside response", "time": "under 30 min", "add": 0, "em": True},
        ],
    },
    {
        "name": "Carpenter",
        "slug": "carpenter",
        "description": "Furniture assembly, woodwork, cabinetry, and door repairs",
        "noun": "carpenter",
        "base_price": 499,
        "pricing_model": PricingModel.PROJECT_QUOTE,
        "sort_order": 6,
        "items": [
            {"id": "k0", "name": "Door or window repair", "desc": "Alignment, hinges, frames, locks", "time": "60 min", "add": 100, "em": False},
            {"id": "k1", "name": "Furniture repair", "desc": "Joints, drawers, broken legs", "time": "90 min", "add": 200, "em": False},
            {"id": "k2", "name": "Custom shelf or wardrobe", "desc": "Measured, built and fitted", "time": "3+ hrs", "add": 1200, "em": False},
            {"id": "k3", "name": "Bed or sofa assembly", "desc": "Flat-pack and framed pieces", "time": "60 min", "add": 0, "em": False},
            {"id": "k4", "name": "Cabinet hinges and locks", "desc": "Soft-close, handles, latches", "time": "45 min", "add": 80, "em": False},
            {"id": "k5", "name": "Broken door or lock", "desc": "Urgent re-secure of your home", "time": "under 30 min", "add": 0, "em": True},
        ],
    },
    {
        "name": "Handyman",
        "slug": "handyman",
        "description": "Wall mounting, minor fixes, furniture assembly, and home touch-ups",
        "noun": "licensed handyman",
        "base_price": 399,
        "pricing_model": PricingModel.FIXED,
        "sort_order": 7,
        "items": [
            {"id": "h0", "name": "Furniture assembly", "desc": "Beds, wardrobes, desks, shelves", "time": "60 min", "add": 0, "em": False},
            {"id": "h1", "name": "Wall mounting", "desc": "TV, shelves, mirrors, curtain rods", "time": "45 min", "add": 50, "em": False},
            {"id": "h2", "name": "Drywall patch and paint", "desc": "Holes, cracks, damp patches", "time": "90 min", "add": 250, "em": False},
            {"id": "h3", "name": "Door and lock fix", "desc": "Sticking doors, loose hinges, new locks", "time": "45 min", "add": 100, "em": False},
            {"id": "h4", "name": "General fixes", "desc": "A list of small jobs in one visit", "time": "60 min", "add": 0, "em": False},
            {"id": "h5", "name": "Something just broke", "desc": "Urgent repair that cannot wait", "time": "under 30 min", "add": 0, "em": True},
        ],
    },
    {
        "name": "HVAC Repair",
        "slug": "hvac",
        "description": "AC servicing, cooling issues, gas recharge, and thermostat repairs",
        "noun": "AC technician",
        "base_price": 799,
        "pricing_model": PricingModel.FIXED,
        "sort_order": 8,
        "items": [
            {"id": "v0", "name": "AC not cooling", "desc": "Gas, filter and compressor diagnosis", "time": "60 min", "add": 0, "em": False},
            {"id": "v1", "name": "Service and gas check", "desc": "Deep clean and pressure test", "time": "60 min", "add": 300, "em": False},
            {"id": "v2", "name": "New AC installation", "desc": "Mounting, piping and commissioning", "time": "2 hrs", "add": 900, "em": False},
            {"id": "v3", "name": "Water leaking from AC", "desc": "Drain line and tray fix", "time": "45 min", "add": 150, "em": False},
            {"id": "v4", "name": "Strange noise or smell", "desc": "Fan, motor and coil inspection", "time": "45 min", "add": 100, "em": False},
            {"id": "v5", "name": "AC stopped completely", "desc": "Priority repair in extreme heat", "time": "under 45 min", "add": 0, "em": True},
        ],
    },
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
                    noun=cat_data["noun"],
                    base_price=cat_data["base_price"],
                    items=cat_data["items"],
                    pricing_model=cat_data["pricing_model"],
                    sort_order=cat_data["sort_order"],
                    is_active=True,
                )
                session.add(category)
            else:
                existing.name = cat_data["name"]
                existing.description = cat_data["description"]
                existing.noun = cat_data["noun"]
                existing.base_price = cat_data["base_price"]
                existing.items = cat_data["items"]
                existing.sort_order = cat_data["sort_order"]
                existing.is_active = True
        
        await session.commit()
        print("Categories seeded and updated successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
