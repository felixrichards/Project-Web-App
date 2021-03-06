"""added tc and bc points for rect/ellipse

Revision ID: a2fdd28f6f10
Revises: dccd9ceeb2a8
Create Date: 2021-02-24 21:26:11.303170

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a2fdd28f6f10'
down_revision = 'dccd9ceeb2a8'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('shape', sa.Column('dec_bc', sa.REAL(), nullable=True))
    op.add_column('shape', sa.Column('dec_tc', sa.REAL(), nullable=True))
    op.add_column('shape', sa.Column('ra_bc', sa.REAL(), nullable=True))
    op.add_column('shape', sa.Column('ra_tc', sa.REAL(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('shape', 'ra_tc')
    op.drop_column('shape', 'ra_bc')
    op.drop_column('shape', 'dec_tc')
    op.drop_column('shape', 'dec_bc')
    # ### end Alembic commands ###
