"""
This module takes carte of starting the API Server for users, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, Aprobaciones, Artista, Articulo
from api.endpoints.utils import save_to_cloudinary
from api.utils import generate_sitemap, APIException
import json

approvals_api = Blueprint('approvals_api', __name__)


@approvals_api.route('/', methods=['GET'])
@approvals_api.route('/<string:all>', methods=['GET'])
def get_all(all=None):
    approvals = None
    if all is None:
        approvals = Aprobaciones.query.filter_by(estatus='pending').all()
    else:
        approvals = Aprobaciones.query.all()
    response = [approval.to_dict() for approval in approvals]

    return jsonify(response), 200


@approvals_api.route('/reject', methods=['PUT'])
def reject():
    data = request.json

    approval = db.session.query(Aprobaciones).get(data['id'])
    approval.estatus = "rejected"
    db.session.add(approval)
    db.session.commit()

    return jsonify({'message': 'El artículo fue rechazado'}), 200


@approvals_api.route('/add', methods=['POST'])
def add():
    print("adding approval")
    data = json.loads(request.form.get('article'))
    file = None
    file_name = None

    if 'file' in request.files:
        file = request.files['file']
        file_name = file.filename

    session = db.session()

    if data:
        if data['tipo'] == "add":
            try:
                session.begin()
                aprobacion = Aprobaciones(**data)
                artist = Artista.query.get(aprobacion.artista_id)
                aprobacion.titulo = artist.nombre + " - " + aprobacion.titulo
                if file is not None:
                    aprobacion.url_imagen = save_to_cloudinary(
                        file, file_name, True)
                db.session.add(aprobacion)
                db.session.commit()

                return jsonify({'mensaje': "Articulo agregado para aprobación"}), 200
            except Exception as e:
                db.session.rollback()
                return jsonify({'mensaje': "Error al guardar el articulo para aprobación"}), 405
        elif data['tipo'] == "edit":
            try:
                session.begin()
                if data.get('articulo_id') and data.get('articulo_id') > 0:
                    aprobacion = Aprobaciones(**data)
                    artist = Artista.query.get(aprobacion.artista_id)
                    aprobacion.titulo = artist.nombre + " - " + aprobacion.titulo
                    if file is not None:
                        aprobacion.url_imagen = save_to_cloudinary(file, file_name, True)
                    db.session.add(aprobacion)
                    db.session.commit()

                    return jsonify({'mensaje': "Articulo agregado para aprobación"}), 200
            except Exception as e:
                db.session.rollback()
                return jsonify({'mensaje': "Error al guardar el articulo para aprobación"}), 405


@approvals_api.route('/<int:approval_id>', methods=['DELETE'])
def delete_aprobacion(approval_id):
    approval_rejected = Aprobaciones.query.filter_by(id=approval_id).first()

    if not approval_rejected:
        return jsonify({'message': 'Pending Approval not found'}), 404

    db.session.delete(approval_rejected)
    db.session.commit()

    return jsonify({'message': 'Pending approval deleted succesfully'}), 200


@approvals_api.route('/delete_all', methods=['DELETE'])
def delete_all():
    db.session.query(Aprobaciones).delete()
    db.session.commit()

    return jsonify({'message': 'Approvals deleted succesfully'}), 200



