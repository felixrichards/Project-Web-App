"""updated galaxy table WC

Revision ID: 26b2853a6278
Revises: 6592c394333b
Create Date: 2018-10-01 19:28:05.657234

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '26b2853a6278'
down_revision = '6592c394333b'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('galaxy', schema=None) as batch_op:
        batch_op.add_column(sa.Column('dec', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('ra', sa.Float(), nullable=True))
        batch_op.alter_column('name',
               existing_type=sa.VARCHAR(length=64),
               nullable=True)
        batch_op.create_index(batch_op.f('ix_galaxy_dec'), ['dec'], unique=False)
        batch_op.create_index(batch_op.f('ix_galaxy_ra'), ['ra'], unique=False)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('galaxy', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_galaxy_ra'))
        batch_op.drop_index(batch_op.f('ix_galaxy_dec'))
        batch_op.alter_column('name',
               existing_type=sa.VARCHAR(length=64),
               nullable=False)
        batch_op.drop_column('ra')
        batch_op.drop_column('dec')

    # ### end Alembic commands ###