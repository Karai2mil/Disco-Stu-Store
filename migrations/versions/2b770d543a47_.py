"""empty message

Revision ID: 2b770d543a47
Revises: dde14eb43d04
Create Date: 2023-08-21 07:15:53.769883

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2b770d543a47'
down_revision = 'dde14eb43d04'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('pedido', schema=None) as batch_op:
        batch_op.drop_column('precio_envio')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('pedido', schema=None) as batch_op:
        batch_op.add_column(sa.Column('precio_envio', sa.INTEGER(), autoincrement=False, nullable=True))

    # ### end Alembic commands ###
