"""
This module takes favoritee of starting the API Server for users, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, Curiosidades_home
from api.utils import generate_sitemap, APIException
import cloudinary
import cloudinary.uploader
import cloudinary.api
from sqlalchemy import asc


home_api = Blueprint('home_api', __name__)


def save_to_cloudinary(image_file, custom_public_id):
    cloudinary.config(
        cloud_name='disco-stu',
        api_key='639893174366669',
        api_secret='NOzrJLcM6aktcSU7Qt32ocZR6ik'
    )

    folder_path = 'images/curiosities'

    try:
        upload_result = cloudinary.uploader.upload(
            image_file,
            folder=folder_path,
            public_id=custom_public_id)

        return upload_result["secure_url"]
    except cloudinary.exceptions.Error as e:
        # Handle Cloudinary API errors
        print("Cloudinary API Error:", e)
        return jsonify({'message': "error al subir imagen"}), 500
    except cloudinary.uploader.Error as e:
        # Handle Cloudinary uploader errors
        print("Cloudinary Uploader Error:", e)
        return jsonify({'message': "error al subir imagen"}), 500

def delete_image_by_url(image_url):
    cloudinary.config(
        cloud_name='disco-stu',
        api_key='639893174366669',
        api_secret='NOzrJLcM6aktcSU7Qt32ocZR6ik'
    )
    
    try:
        result = cloudinary.uploader.destroy(image_url)
        if result.get('result') == 'ok':
            return True
        else:
            return False
    except cloudinary.exceptions.Error as e:
        # Handle Cloudinary API errors
        print("Cloudinary API Error:", e)
        return False

@home_api.route('/', methods=['GET'])
def get_home():

    db_curiosidades = Curiosidades_home.query.order_by(asc(Curiosidades_home.posicion)).all()
    if not db_curiosidades:
        db_curiosidades_empty = []
        curiosidades = []
        for curiosidad in db_curiosidades_empty:
            curiosidades_dict = {
                'posicion': curiosidad.posicion,
                'titulo': curiosidad.titulo,
                'subtitulo': curiosidad.subtitulo,
                'descripcion': curiosidad.descripcion,
                'url_imagen': curiosidad.url_imagen
            }
            curiosidades.append(curiosidades_dict)

        return jsonify(curiosidades), 200
    
    curiosidades = []
    for curiosidad in db_curiosidades:
        curiosidades_dict = {
            'posicion': curiosidad.posicion,
            'titulo': curiosidad.titulo,
            'subtitulo': curiosidad.subtitulo,
            'descripcion': curiosidad.descripcion,
            'url_imagen': curiosidad.url_imagen
        }
        curiosidades.append(curiosidades_dict)

    return jsonify(curiosidades), 200


@home_api.route('/edit', methods=['PUT'])
def edit_home():

    posicion = request.form.get('posicion')
    titulo = request.form.get('titulo')
    subtitulo = request.form.get('subtitulo')
    descripcion = request.form.get('descripcion')
    imagen_file = request.files.get('imagen')

    curiosidad = Curiosidades_home.query.filter_by(posicion=posicion).first()

    if (curiosidad):
        if (curiosidad.url_imagen):
            image_url_to_delete = curiosidad.url_imagen
            result = delete_image_by_url(image_url_to_delete)
            if result:
                print("Imagen eliminada correctamente")
            else:
                print("Error al eliminar la imagen")

        # Guardamos nueva información 
        url_imagen = save_to_cloudinary(imagen_file, posicion)
        curiosidad.titulo = titulo
        curiosidad.subtitulo = subtitulo
        curiosidad.descripcion = descripcion
        curiosidad.url_imagen = url_imagen

        db.session.commit()

        response_body = {
            'posicion': curiosidad.posicion,
            'titulo': curiosidad.titulo,
            'subtitulo': curiosidad.subtitulo,
            'descripcion': curiosidad.descripcion,
            'url_imagen': curiosidad.url_imagen
        }

        return jsonify({'status':'COMPLETED'}), 200
    
    url_imagen = save_to_cloudinary(imagen_file, posicion)
    new_curiosidad = Curiosidades_home(
        posicion= posicion,
        titulo= titulo,
        subtitulo= subtitulo,
        descripcion= descripcion,
        url_imagen= url_imagen
    )
    
    db.session.add(new_curiosidad)
    db.session.commit()

    response_body = {
        'posicion': new_curiosidad.posicion,
        'titulo': new_curiosidad.titulo,
        'subtitulo': new_curiosidad.subtitulo,
        'descripcion': new_curiosidad.descripcion,
        'url_imagen': new_curiosidad.url_imagen
    }

    return jsonify({'status':'COMPLETED'}), 200


@home_api.route('/delete', methods=['DELETE'])
def delete_curiosities():
    try:
        # Obtén todos los registros de Curiosidades_home
        curiosities = Curiosidades_home.query.all()

        # Itera sobre cada registro y elimínalo
        for curiosity in curiosities:
            db.session.delete(curiosity)
        
        # Realiza la confirmación de cambios
        db.session.commit()

        return jsonify({'message': 'Todos los elementos fueron eliminados correctamente'})
    except Exception as e:
        # Maneja cualquier error que pueda ocurrir durante el proceso de eliminación
        print("Error al eliminar los elementos:", e)
        db.session.rollback()  # Vuelve atrás en caso de error
        return jsonify({'message': 'Error al eliminar los elementos'}), 500