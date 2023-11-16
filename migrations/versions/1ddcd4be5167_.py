"""empty message

Revision ID: 1ddcd4be5167
Revises: 594c81bcf63a
Create Date: 2023-11-01 14:04:35.363934

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1ddcd4be5167'
down_revision = '594c81bcf63a'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('actualizaciones_de_videos', schema=None) as batch_op:
        batch_op.add_column(sa.Column('titulo', sa.String(length=100), nullable=True))

    with op.batch_alter_table('videos_de_articulos', schema=None) as batch_op:
        batch_op.add_column(sa.Column('titulo', sa.String(length=100), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('videos_de_articulos', schema=None) as batch_op:
        batch_op.drop_column('titulo')

    with op.batch_alter_table('actualizaciones_de_videos', schema=None) as batch_op:
        batch_op.drop_column('titulo')

    # ### end Alembic commands ###
