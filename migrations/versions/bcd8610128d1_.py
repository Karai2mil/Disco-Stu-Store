"""empty message

Revision ID: bcd8610128d1
Revises: 680b6cda40c6
Create Date: 2023-11-12 17:20:19.006119

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'bcd8610128d1'
down_revision = '680b6cda40c6'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('comentarios_de_articulo_reportados', schema=None) as batch_op:
        batch_op.alter_column('comentario_id',
               existing_type=sa.INTEGER(),
               nullable=False)
        batch_op.drop_constraint('comentarios_de_articulo_reportados_comentario_id_fkey', type_='foreignkey')
        batch_op.create_foreign_key(None, 'comentarios_de_articulo', ['comentario_id'], ['id'], ondelete='CASCADE')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('comentarios_de_articulo_reportados', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.create_foreign_key('comentarios_de_articulo_reportados_comentario_id_fkey', 'comentarios_de_articulo', ['comentario_id'], ['id'])
        batch_op.alter_column('comentario_id',
               existing_type=sa.INTEGER(),
               nullable=True)

    # ### end Alembic commands ###
