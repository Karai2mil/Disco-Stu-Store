"""
This module takes ordere of starting the API Server for users, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Pedido, pedido_articulos, Bandeja_de_entrada
from api.utils import generate_sitemap, APIException
from datetime import datetime

order_api = Blueprint('order_api', __name__)

# Ruta para crear un pedido


@order_api.route('/', methods=['POST'])
def create_order():
    try:
        data = request.json

        user_id = data.get('usuario_id')
        articles_ids = data.get('articles_ids', [])
        ofertas_ids = data.get('ofertas_ids', [])
        precio_envio = data.get('precio_envio', 0)
        subtotal = data.get('subtotal', 0)
        condicion_funda = data.get('condicion_funda', '')
        condicion_soporte = data.get('condicion_soporte', '')
        vendedor_id = data.get('vendedor_id')
        pagado = False

        if not user_id or not articles_ids:
            return jsonify({'error': 'Datos incompletos'}), 400

        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404

        pedido = Pedido(
            precio_envio=precio_envio,
            subtotal=subtotal,
            condicion_funda=condicion_funda,
            condicion_soporte=condicion_soporte,
            user_id=user_id,
            vendedor_id=vendedor_id,
            ofertas_ids=ofertas_ids,
            pagado=pagado,
        )
        print(pedido)
        db.session.add(pedido)
        db.session.commit()

        fecha_actual = datetime.now()
        dia = str(fecha_actual.day)
        mes = str(fecha_actual.month)
        anio = str(fecha_actual.year)
        pedido_id = str(pedido.id)

        fecha_formateada = dia + '/' + mes + '/' + anio
        mensaje_vendedor = Bandeja_de_entrada(
            emisor_id=user_id,
            receptor_id=vendedor_id,
            fecha=fecha_formateada,
            asunto='Pedido #' + pedido_id,
            isMessage=False
        )

        db.session.add(mensaje_vendedor)
        db.session.commit()

        for article_id in articles_ids:
            pedido_articulo = pedido_articulos.insert().values(
                pedido_id=pedido.id, articulo_id=article_id)
            db.session.execute(pedido_articulo)

        db.session.commit()

        return jsonify({'message': 'Pedido creado con éxito'}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Ruta para obtener todos los pedidos de un usario


@order_api.route('/<int:user_id>', methods=['GET'])
def get_pedidos_by_user_id(user_id):
    try:
        pedidos = Pedido.query.filter_by(user_id=user_id).all()
        if not pedidos:
            return jsonify({'message': 'No se encontraron pedidos para este usuario'}), 404

        pedidos_list = []
        for pedido in pedidos:
            pedido_data = {
                'id': pedido.id,
                'precio_envio': pedido.precio_envio,
                'subtotal': pedido.subtotal,
                'precio_total': pedido.precio_total,
                'vendedor_id': pedido.vendedor_id,
                'condicion_funda': pedido.condicion_funda,
                'condicion_soporte': pedido.condicion_soporte,
                'articulos': [],
                'ofertas_ids': pedido.ofertas_ids,
                'pagado': pedido.pagado,
                'valorado': pedido.valorado,
                'haveShipping': pedido.haveShipping
            }

            for articulo in pedido.articulos:
                articulo_data = {
                    'id': articulo.id,
                    'titulo': articulo.titulo,
                }

                pedido_data['articulos'].append(articulo_data)

            pedidos_list.append(pedido_data)

        return jsonify({'pedidos': pedidos_list}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Ruta para obtener un pedido


@order_api.route('/order/<int:order_id>', methods=['GET'])
def get_order_by_id(order_id):
    try:
        pedido = Pedido.query.get(order_id)
        if not pedido:
            return jsonify({'message': 'No se encontró el pedido'}), 404

        pedido_data = {
            'id': pedido.id,
            'subtotal': pedido.subtotal,
            'precio_total': pedido.precio_total,
            'precio_envio': pedido.precio_envio,
            'vendedor_id': pedido.vendedor_id,
            'condicion_funda': pedido.condicion_funda,
            'condicion_soporte': pedido.condicion_soporte,
            'articulos': [],
            'pagado': pedido.pagado,
            'valorado': pedido.valorado,
            'haveShipping': pedido.haveShipping
        }

        for articulo in pedido.articulos:
            articulo_data = {
                'id': articulo.id,
                'titulo': articulo.titulo,
            }

            pedido_data['articulos'].append(articulo_data)

        return jsonify(pedido_data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

#Ruta para establcer precio de envío

@order_api.route('/order', methods=['PUT'])
def set_shipping_cost():
    try:
        order_id=request.json.get('order_id')
        shipping_cost=request.json.get('shipping_cost')

        order=Pedido.query.get(order_id)

        subtotal = float(order.subtotal)
        shipping_cost = float(shipping_cost)
        precio_total = subtotal + shipping_cost
        
        order.precio_total = precio_total
        order.precio_envio=shipping_cost
        order.haveShipping=True
        db.session.commit()

        return jsonify('COMPLETED')
    
    except Exception as e:
        print("Error:", str(e)) 
        return jsonify({'error': str(e)}), 500

# Ruta para borrar un pedido


@order_api.route('/<int:user_id>/<int:order_id>', methods=['DELETE'])
def delete_order(user_id, order_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404

        order = Pedido.query.filter_by(id=order_id, user_id=user_id).first()
        if not order:
            return jsonify({'error': 'Pedido no encontrado'}), 404

        db.session.delete(order)
        db.session.commit()

        return jsonify({'message': 'Pedido eliminado con éxito'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Ruta para actualizar el estado de pagado de un pedido


@order_api.route('/<int:pedido_id>', methods=['PUT'])
def actualizar_estado_pago_pedido(pedido_id):
    pedido = Pedido.query.get(pedido_id)

    if pedido:
        try:
            nuevo_estado_pagado = request.json.get('pagado')
            if nuevo_estado_pagado is not None:
                pedido.pagado = nuevo_estado_pagado
                db.session.commit()
                return jsonify({'message': 'Estado de pago del pedido actualizado'}), 200
            else:
                return jsonify({'message': 'La propiedad "pagado" no fue proporcionada'}), 400
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': 'Error al actualizar el estado de pago del pedido', 'error': str(e)}), 500
    else:
        return jsonify({'message': 'Pedido no encontrado'}), 404

# Ruta para actualizar valoraciones


@order_api.route('/upload_rating', methods=['PUT'])
def actualizar_valoracion():

    vendedor_id = request.json.get('vendedor_id')
    positivo_o_negativo = request.json.get('positivo_o_negativo')
    order_id = request.json.get('order_id')

    vendedor = User.query.get(vendedor_id)
    if vendedor:
        if positivo_o_negativo == 'POSITIVO':
            vendedor.valoraciones_positivas += 1
            vendedor.cantidad_de_valoraciones += 1
        elif positivo_o_negativo == 'NEGATIVO':
            vendedor.valoraciones_negativas += 1
            vendedor.cantidad_de_valoraciones += 1

        total_valoraciones = vendedor.valoraciones_positivas + \
            vendedor.valoraciones_negativas
        if total_valoraciones > 0:
            valoracion = (vendedor.valoraciones_positivas /
                          total_valoraciones) * 100
        else:
            valoracion = 0
        vendedor.valoracion = valoracion

        pedido = Pedido.query.get(order_id)
        pedido.valorado = True
        
        db.session.commit()

        return jsonify('COMPLETED'), 200
    else:
        return jsonify({'error': 'Vendedor no encontrado.'}), 404
