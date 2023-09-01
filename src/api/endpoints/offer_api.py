"""
This module takes offere of starting the API Server for users, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Articulo, Ofertas, Carrito
from api.utils import generate_sitemap, APIException
import traceback

offer_api = Blueprint('offer_api', __name__)

@offer_api.route('/<int:article_id>', methods=['GET'])
def get_offer_by_article(article_id):

    ofertas = Ofertas.query.filter_by(articulo_id=article_id).all()

    ofertas_response = []

    for oferta in ofertas:
        vendedor_id = oferta.vendedor_id
        vendedor = User.query.filter_by(id=vendedor_id).first()
        article_dict = {
            'id': oferta.id,
            'usuario': vendedor.usuario,
            'pais_comprador': vendedor.pais_comprador,
            'valoracion': vendedor.valoracion,
            'cantidad_de_valoraciones': vendedor.cantidad_de_valoraciones,
            'vendedor_id': oferta.vendedor_id,
            'articulo_id': oferta.articulo_id,
            'condicion_funda': oferta.condicion_funda,
            'condicion_soporte': oferta.condicion_soporte,
            'precio': oferta.precio,
            'comentario': oferta.comentario
        }
        ofertas_response.append(article_dict)

    return jsonify(ofertas_response), 200

@offer_api.route('/seller/<int:vendedor_id>', methods=['GET'])
def get_offer_by_seller(vendedor_id):

    ofertas = Ofertas.query.filter_by(vendedor_id=vendedor_id).all()

    ofertas_response = []

    for oferta in ofertas:
        articulo_id = oferta.articulo_id
        articulo = Articulo.query.filter_by(id=articulo_id).first()
        oferta_dict = {
            'id': oferta.id,
            'titulo': articulo.titulo,
            'condicion_funda': oferta.condicion_funda,
            'condicion_soporte': oferta.condicion_soporte,
            'precio': oferta.precio,
        }
        ofertas_response.append(oferta_dict)

    return jsonify(ofertas_response), 200

@offer_api.route('/post', methods=['POST'])
def post_offer():

    data = request.json

    vendedor_id = data.get('vendedor_id')
    articulo_id = data.get('articulo_id')
    condicion_soporte = data.get('condicion_soporte')
    condicion_funda = data.get('condicion_funda')
    precio = data.get('precio')
    comentario = data.get('comentario')
    cantidad = int(data.get('cantidad'))

    for _ in range(cantidad):
        article = Ofertas(
            vendedor_id=vendedor_id,
            articulo_id=articulo_id,
            condicion_soporte=condicion_soporte,
            condicion_funda=condicion_funda,
            precio=precio,
            comentario=comentario
        )
        db.session.add(article)
        db.session.commit()

    response_object = {
        'vendedor_id': vendedor_id,
        'articulo_id': articulo_id,
        'condicion_funda': condicion_funda,
        'condicion_soporte': condicion_soporte,
        'precio': precio,
        'comentario': comentario
    }

    return jsonify('Offer added', response_object), 200

@offer_api.route('/post/<int:offer_id>', methods=['PUT'])
def edit_offer(offer_id):

    condicion_soporte = request.query.get('condicion_soporte')
    condicion_funda = request.query.get('condicion_funda')
    precio = request.query.get('precio')
    comentario = request.query.get('comentario')

    offer = Ofertas.query.filter_by(id=offer_id).first()

    if offer:
        offer.condicion_soporte = condicion_soporte
        offer.condicion_funda = condicion_funda
        offer.precio = precio
        offer.comentario = comentario

        db.session.commit()

        return jsonify('Offer edited'), 200
    else:
        return jsonify('Offer not found'), 404
    
@offer_api.route('/delete', methods=['DELETE'])
def delete_offer():
    try:

        ofertas_ids = request.json.get('ofertas_ids')
        for id in ofertas_ids:
            offer = Ofertas.query.filter_by(id=id).first()
            offers_in_cart = Carrito.query.filter_by(oferta_id=id).all()
            for elem in offers_in_cart:
                db.session.delete(elem)
            if offer:
                db.session.delete(offer)
        db.session.commit()
        return jsonify('COMPLETED'), 200
    except Exception as e:
        traceback.print_exc()
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
