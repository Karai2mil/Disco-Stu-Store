"""empty message

Revision ID: 0bfca7930941
Revises: 15904a2210f6
Create Date: 2023-07-31 00:43:52.430187

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0bfca7930941'
down_revision = '15904a2210f6'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('articulo', schema=None) as batch_op:
        batch_op.drop_constraint('articulo_sello_key', type_='unique')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('articulo', schema=None) as batch_op:
        batch_op.create_unique_constraint('articulo_sello_key', ['sello'])

    # ### end Alembic commands ###
