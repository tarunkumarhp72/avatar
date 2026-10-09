import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppError
from app.customers.models import Address, CustomerProfile
from app.customers.schemas import AddressCreate, AddressUpdate, CustomerProfileUpdate


async def get_or_create_profile(user_id: uuid.UUID, db: AsyncSession) -> CustomerProfile:
    result = await db.execute(select(CustomerProfile).where(CustomerProfile.user_id == user_id))
    profile = result.scalars().first()
    if not profile:
        profile = CustomerProfile(user_id=user_id)
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
    return profile


async def update_profile(user_id: uuid.UUID, data: CustomerProfileUpdate, db: AsyncSession) -> CustomerProfile:
    profile = await get_or_create_profile(user_id, db)
    if data.default_address_id is not None:
        # Validate address belongs to user
        address = await get_address(user_id, data.default_address_id, db)
        profile.default_address_id = address.id
    
    await db.commit()
    await db.refresh(profile)
    return profile


async def list_addresses(user_id: uuid.UUID, db: AsyncSession) -> list[Address]:
    result = await db.execute(select(Address).where(Address.user_id == user_id))
    return list(result.scalars().all())


async def get_address(user_id: uuid.UUID, address_id: uuid.UUID, db: AsyncSession) -> Address:
    result = await db.execute(select(Address).where(Address.id == address_id, Address.user_id == user_id))
    address = result.scalars().first()
    if not address:
        raise AppError(status_code=404, code="ADDRESS_NOT_FOUND", message="Address not found")
    return address


async def create_address(user_id: uuid.UUID, data: AddressCreate, db: AsyncSession) -> Address:
    address = Address(user_id=user_id, **data.model_dump())
    db.add(address)
    await db.commit()
    await db.refresh(address)
    
    # If it's the first address or is_default is true, set it as default
    if address.is_default:
        await set_default_address(user_id, address.id, db)
    
    return address


async def update_address(user_id: uuid.UUID, address_id: uuid.UUID, data: AddressUpdate, db: AsyncSession) -> Address:
    address = await get_address(user_id, address_id, db)
    
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(address, key, value)
        
    await db.commit()
    await db.refresh(address)
    
    if data.is_default is True:
        await set_default_address(user_id, address.id, db)
        
    return address


async def delete_address(user_id: uuid.UUID, address_id: uuid.UUID, db: AsyncSession) -> None:
    address = await get_address(user_id, address_id, db)
    await db.delete(address)
    await db.commit()


async def set_default_address(user_id: uuid.UUID, address_id: uuid.UUID, db: AsyncSession) -> Address:
    address = await get_address(user_id, address_id, db)
    
    # Unset all other defaults
    result = await db.execute(select(Address).where(Address.user_id == user_id, Address.is_default == True))
    for old_default in result.scalars().all():
        old_default.is_default = False
        
    address.is_default = True
    
    profile = await get_or_create_profile(user_id, db)
    profile.default_address_id = address.id
    
    await db.commit()
    await db.refresh(address)
    return address
