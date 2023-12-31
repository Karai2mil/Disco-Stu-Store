"""empty message

Revision ID: 0034f162ef71
Revises: 4db470b06c7d
Create Date: 2023-10-28 19:22:41.788913

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '0034f162ef71'
down_revision = '4db470b06c7d'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('actualizaciones_de_videos',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.Column('articulo_id', sa.Integer(), nullable=True),
    sa.Column('fecha', sa.String(length=20), nullable=True),
    sa.Column('cambios', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    sa.ForeignKeyConstraint(['articulo_id'], ['articulo.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('actualizaciones_de_videos')
    # ### end Alembic commands ###
