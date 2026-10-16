"""add noun base_price items to service_categories

Revision ID: 9999_category_details
Revises: 4eaf0669d0a1
Create Date: 2026-10-16 16:30:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = '9999_category_details'
down_revision: str | Sequence[str] | None = '4eaf0669d0a1'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column('service_categories', sa.Column('noun', sa.String(length=255), nullable=True, server_default='professional'))
    op.add_column('service_categories', sa.Column('base_price', sa.Integer(), nullable=False, server_default='499'))
    op.add_column('service_categories', sa.Column('items', sa.JSON(), nullable=False, server_default='[]'))


def downgrade() -> None:
    op.drop_column('service_categories', 'items')
    op.drop_column('service_categories', 'base_price')
    op.drop_column('service_categories', 'noun')
