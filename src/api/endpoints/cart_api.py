"""
This module takes carte of starting the API Server for users, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User,  Carrito, Ofertas, Articulo, Artista
from api.utils import generate_sitemap, APIException

cart_api = Blueprint('cart_api', __name__)


@cart_api.route('/<int:user_id>', methods=['GET'])
def get_cart(user_id):

    cart_element_unordered = Carrito.query.filter_by(user_id=user_id).all()
    if not cart_element_unordered:
        return jsonify({'error': 'No se encontraron elementos en el carrito'}), 404

    sellers_ids = set()
    for elem in cart_element_unordered:
        sellers_ids.add(elem.vendedor_id)

    cart_content = []

    for seller_id in sellers_ids:
        object_dict = {
            'seller': {},
            'offers': []
        }
        seller = User.query.filter_by(id=seller_id).first()
        seller_dict = {
            'usuario': seller.usuario,
            'id':  seller.id,
            'valoracion': seller.valoracion,
            'cantidad_de_valoraciones': seller.cantidad_de_valoraciones
        }
        object_dict['seller'] = seller_dict
        offers_ids = [elem.oferta_id for elem in cart_element_unordered if elem.vendedor_id == seller_id]
        offers_dict = []
        for id in offers_ids:
            offer = Ofertas.query.filter_by(id=id).first()
            seller = User.query.filter_by(id=offer.vendedor_id).first()
            article = Articulo.query.filter_by(id=offer.articulo_id).first()
            offer_dict = {
                'oferta_id': offer.id,
                'vendedor_id': offer.vendedor_id,
                'articulo_id': offer.articulo_id,
                'condicion_funda': offer.condicion_funda,
                'condicion_soporte': offer.condicion_soporte,
                'precio': offer.precio,
                'comentario': offer.comentario,
                'url_imagen': article.url_imagen,
                'titulo': article.titulo
            }
            offers_dict.append(offer_dict)
        object_dict['offers'] = offers_dict

        cart_content.append(object_dict)

    return jsonify(cart_content), 200


@cart_api.route('/add', methods=['POST'])
def new_cart_element():

    user_id = request.json.get('user_id')
    vendedor_id = request.json.get('vendedor_id')
    oferta_id = request.json.get('oferta_id')

    element=Carrito.query.filter_by(
        user_id=user_id,
        vendedor_id=vendedor_id,
        oferta_id=oferta_id
    ).first()
    
    if element:
        return jsonify('Already exist')

    new_element = Carrito(
        user_id=user_id,
        vendedor_id=vendedor_id,
        oferta_id=oferta_id
    )
    db.session.add(new_element)
    db.session.commit()

    return_element = {
        'id': new_element.id,
        'user_id': new_element.user_id,
        'vendedor_id': new_element.vendedor_id,
        'oferta_id': new_element.oferta_id
    }

    return jsonify("COMPLETED")


@cart_api.route('/delete_item', methods=['DELETE'])
def delete_one_article():

    user_id = request.json.get('user_id')
    vendedor_id = request.json.get('vendedor_id')
    oferta_id = request.json.get('oferta_id')

    element_to_delete = Carrito.query.filter_by(
        user_id=user_id, vendedor_id=vendedor_id, oferta_id=oferta_id).first()

    if element_to_delete:
        db.session.delete(element_to_delete)
        db.session.commit()
        return jsonify('Cart element deleted'), 200
    else:
        return jsonify('Cart element not found'), 404



@cart_api.route('/delete_by_seller', methods=['DELETE'])
def delete_articles_for_seller():

    user_id = request.json.get('user_id')
    vendedor_id = request.json.get('vendedor_id')

    articles = Carrito.query.filter_by(
        user_id=user_id, vendedor_id=vendedor_id).all()

    for article in articles:
        db.session.delete(article)
        db.session.commit()

    return jsonify('Cart elements for a seller deleted')
