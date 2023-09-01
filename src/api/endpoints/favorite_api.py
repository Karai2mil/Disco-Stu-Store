"""
This module takes favoritee of starting the API Server for users, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Favoritos
from api.utils import generate_sitemap, APIException

favorite_api = Blueprint('favorite_api', __name__)


@favorite_api.route('/', methods=['GET'])
def get_all():
    favorites = Favoritos.query.all()
    response = [favorite.to_dict() for favorite in favorites]

    return jsonify(response), 200


@favorite_api.route('/<int:user_id>', methods=['GET'])
def favorites_by_user_id(user_id):
    try:
        user_favorites = Favoritos.query.filter_by(user_id=user_id).all()

        favorites_data = []
        for favorite in user_favorites:
            favorites_data.append({
                'id': favorite.id,
                'user_id': favorite.user_id,
                'articulo_id': favorite.articulo_id
            })

        return jsonify({'favorites': favorites_data})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@favorite_api.route('/<int:user_id>', methods=['POST'])
def add_favorite(user_id):

    data = request.get_json()

    if 'article_id' not in data:
        return jsonify({'message': 'Missing article_id'}), 400

    article_id = data['article_id']

    existing_favorite = Favoritos.query.filter_by(
        user_id=user_id, articulo_id=article_id).first()
    if existing_favorite:
        return jsonify({'message': 'El articulo ya esta agregado a Favoritos'}), 400

    new_favorite = Favoritos(user_id=user_id, articulo_id=data['article_id'])
    db.session.add(new_favorite)
    db.session.commit()

    return jsonify({'message': 'Favorite added successfully'}), 201


@favorite_api.route('/<int:user_id>/favorites/<int:article_id>', methods=['DELETE'])
def delete_favorite(user_id, article_id):
    favorite = Favoritos.query.filter_by(
        user_id=user_id, articulo_id=article_id).first()

    if not favorite:
        return jsonify({'message': 'Favorite not found'}), 404

    db.session.delete(favorite)
    db.session.commit()

    return jsonify({'message': 'Favorite deleted successfully'}), 200