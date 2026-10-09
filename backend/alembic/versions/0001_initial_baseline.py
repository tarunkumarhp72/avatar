"""initial_baseline

Revision ID: 7ef9c1254411
Revises: 
Create Date: 2026-10-08 20:12:06.269582

"""
from collections.abc import Sequence

# revision identifiers, used by Alembic.
revision: str = '7ef9c1254411'
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""


def downgrade() -> None:
    """Downgrade schema."""
