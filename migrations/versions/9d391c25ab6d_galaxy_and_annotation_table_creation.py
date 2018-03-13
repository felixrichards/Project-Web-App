"""galaxy and annotation table creation

Revision ID: 9d391c25ab6d
Revises: 
Create Date: 2018-03-05 21:35:02.337669

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9d391c25ab6d'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('galaxy',
    sa.Column('g_id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=64), nullable=True),
    sa.Column('survey', sa.String(length=64), nullable=True),
    sa.PrimaryKeyConstraint('g_id')
    )
    op.create_index(op.f('ix_galaxy_name'), 'galaxy', ['name'], unique=True)
    op.create_index(op.f('ix_galaxy_survey'), 'galaxy', ['survey'], unique=False)
    op.create_table('annotations',
    sa.Column('a_id', sa.Integer(), nullable=False),
    sa.Column('g_id', sa.Integer(), nullable=True),
    sa.Column('timestamp', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['g_id'], ['galaxy.g_id'], ),
    sa.PrimaryKeyConstraint('a_id')
    )
    op.create_index(op.f('ix_annotations_timestamp'), 'annotations', ['timestamp'], unique=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_annotations_timestamp'), table_name='annotations')
    op.drop_table('annotations')
    op.drop_index(op.f('ix_galaxy_survey'), table_name='galaxy')
    op.drop_index(op.f('ix_galaxy_name'), table_name='galaxy')
    op.drop_table('galaxy')
    # ### end Alembic commands ###
