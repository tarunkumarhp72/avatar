import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_customer
from app.customers import schemas, service
from app.database.session import get_db
from app.users.models import User

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.get("/me", response_model=schemas.CustomerProfileResponse)
async def get_my_profile(
    current_user: User = Depends(require_customer),  # noqa: B008
    db: AsyncSession = Depends(get_db)  # noqa: B008
):
    return await service.get_or_create_profile(current_user.id, db)


@router.patch("/me", response_model=schemas.CustomerProfileResponse)
async def update_my_profile(
    data: schemas.CustomerProfileUpdate,
    current_user: User = Depends(require_customer),  # noqa: B008
    db: AsyncSession = Depends(get_db)  # noqa: B008
):
    return await service.update_profile(current_user.id, data, db)


@router.get("/me/addresses", response_model=list[schemas.AddressResponse])
async def list_my_addresses(
    current_user: User = Depends(require_customer),  # noqa: B008
    db: AsyncSession = Depends(get_db)  # noqa: B008
):
    return await service.list_addresses(current_user.id, db)


@router.post("/me/addresses", response_model=schemas.AddressResponse, status_code=status.HTTP_201_CREATED)
async def create_my_address(
    data: schemas.AddressCreate,
    current_user: User = Depends(require_customer),  # noqa: B008
    db: AsyncSession = Depends(get_db)  # noqa: B008
):
    return await service.create_address(current_user.id, data, db)


@router.patch("/me/addresses/{address_id}", response_model=schemas.AddressResponse)
async def update_my_address(
    address_id: uuid.UUID,
    data: schemas.AddressUpdate,
    current_user: User = Depends(require_customer),  # noqa: B008
    db: AsyncSession = Depends(get_db)  # noqa: B008
):
    return await service.update_address(current_user.id, address_id, data, db)


@router.delete("/me/addresses/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_address(
    address_id: uuid.UUID,
    current_user: User = Depends(require_customer),  # noqa: B008
    db: AsyncSession = Depends(get_db)  # noqa: B008
):
    await service.delete_address(current_user.id, address_id, db)


@router.post("/me/addresses/{address_id}/set-default", response_model=schemas.AddressResponse)
async def set_my_default_address(
    address_id: uuid.UUID,
    current_user: User = Depends(require_customer),  # noqa: B008
    db: AsyncSession = Depends(get_db)  # noqa: B008
):
    return await service.set_default_address(current_user.id, address_id, db)
