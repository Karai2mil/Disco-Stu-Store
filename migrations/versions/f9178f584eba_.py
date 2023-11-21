"""empty message

Revision ID: f9178f584eba
Revises: e4e3f2766f2b
Create Date: 2023-11-15 01:15:39.106885

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f9178f584eba'
down_revision = 'e4e3f2766f2b'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('actualizaciones_de_videos', schema=None) as batch_op:
        batch_op.add_column(sa.Column('fecha', sa.String(length=50), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('actualizaciones_de_videos', schema=None) as batch_op:
        batch_op.drop_column('fecha')

    # ### end Alembic commands ###