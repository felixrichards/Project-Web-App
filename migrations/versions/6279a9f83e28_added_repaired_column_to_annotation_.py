"""added repaired column to annotation table

Revision ID: 6279a9f83e28
Revises: a2fdd28f6f10
Create Date: 2021-02-25 17:46:15.821426

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6279a9f83e28'
down_revision = 'a2fdd28f6f10'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('annotation', sa.Column('repaired', sa.Boolean(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('annotation', 'repaired')
    # ### end Alembic commands ###
