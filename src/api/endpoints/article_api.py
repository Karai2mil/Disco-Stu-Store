"""
This module takes care of starting the API Server for users, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, Articulo, Artista, Aprobaciones, VideosDeArticulos, ActualizacionesDeVideos, User, ComentariosDeArticulo, ComentariosDeArticuloReportados
from sqlalchemy import func, or_
from api.endpoints.utils import save_to_cloudinary
import json
import datetime

article_api = Blueprint('article_api', __name__)


@article_api.route('/', methods=['GET'])
def get_all():
    articles = Articulo.query.all()
    response = [article.to_dict() for article in articles]

    return jsonify(response), 200


@article_api.route('/<int:article_id>', methods=['GET'])
def get_article(article_id):
    article = Articulo.query.filter_by(id=article_id).first()

    if article is None:
        return jsonify({'status': 'NOT FOUND', 'message': 'Artículo no encontrado'}), 404

    response = article.to_dict()
    return jsonify({'article': response})


@article_api.route('/search/', methods=['GET'])
@article_api.route('/search/<string:term>', methods=['GET'])
def search(term=None):
    if term is None:
        articles = Articulo.query.all()
        response = [article.to_dict() for article in articles]
        return jsonify(response), 200

    term = term.lower()
    articles = Articulo.query.filter(
        or_(
            Articulo.titulo.ilike(f'%{term}%'),
            Articulo.sello.ilike(f'%{term}%'),
            Articulo.formato.ilike(f'%{term}%'),
            Articulo.pais.ilike(f'%{term}%'),
            Articulo.genero.ilike(f'%{term}%'),
            Articulo.estilos.ilike(f'%{term}%'),
            Articulo.artista.has(
                nombre=term) | Articulo.artista.has(nombre_real=term)
        )
    ).all()

    response = [article.to_dict() for article in articles]
    return jsonify(response), 200


@article_api.route('/genre/<string:genre_name>', methods=['GET'])
def get_by_genre(genre_name):
    articles = Articulo.query.filter(func.lower(
        Articulo.genero) == genre_name.lower()).all()
    response = [article.to_dict() for article in articles]

    return jsonify(response), 200


@article_api.route('/get_all_grouped_by_genre', methods=['GET'])
def get_all_grouped_by_genre():
    response = {}
    genres = db.session.query(Articulo.genero).distinct().all()

    for genre_tuple in genres:
        genre = genre_tuple[0]
        print(genre)
        group = db.session.query(Articulo).filter(
            Articulo.genero == genre).limit(10).all()

        article_list = [article.to_dict() for article in group]

        response[genre] = article_list

    return jsonify(response), 200


@article_api.route('/style/<string:style_name>', methods=['GET'])
def get_by_style(style_name):
    style_name = style_name.replace("%20", " ").strip()
    # response = db.session.query(Articulo).filter(Articulo.estilos.ilike(f"%, {style_name},") |
    #                                            Articulo.estilos.ilike(f"{style_name}, %")).all()
    response = db.session.query(Articulo).filter(or_(
        Articulo.estilos.ilike(f"%{style_name},%"),
        Articulo.estilos.ilike(f"%{style_name}"),
        Articulo.estilos.ilike(f"{style_name},%"),
    )).all()
    matching_articulos_json = [articulo.to_dict() for articulo in response]
    return jsonify(matching_articulos_json), 200


@article_api.route('/country/<string:country_name>', methods=['GET'])
def get_by_country(country_name):
    response = db.session.query(Articulo).filter(
        Articulo.pais == country_name).all()
    matching_articulos_json = [articulo.to_dict() for articulo in response]
    return jsonify(matching_articulos_json), 200


@article_api.route('/get_all_filter', methods=['GET'])
def get_all_filters():
    distinct_generos = db.session.query(Articulo.genero).distinct().all()
    distinct_estilos = db.session.query(Articulo.estilos).distinct().all()
    distinct_pais = db.session.query(Articulo.pais).distinct().all()

    generos = [item[0] for item in distinct_generos]
    estilos = [style for item in distinct_estilos for style in (
        item[0].split(', ') if item[0] else [])]
    pais = [item[0] for item in distinct_pais]

    result = {
        "generos": generos,
        "estilos": estilos,
        "paises": pais
    }

    return jsonify(result)


@article_api.route('/genres', methods=['GET'])
def get_genres():
    genres = db.session.query(Articulo.genero).distinct().all()

    response_body = [{'name': genre[0]} for genre in genres]

    return jsonify(response_body)

# @article_api.route('/add', methods=['POST'])
# def add():
#     data = json.loads(request.form.get('article'))
#     file = request.files['file']
#     file_name = file.filename

#     try:
#         data['url_imagen'] = save_to_cloudinary(file, file_name)

#         if data.get('id') and data.get('id') > 0:
#             article = db.session.query(Articulo).get(data['id'])
#             artist = Artista.query.get(article.artista_id)
#             article.titulo = artist.nombre + " - " + article.titulo
#             if article:
#                 for key, value in data.items():
#                     setattr(article, key, value)
#                 db.session.add(article)
#                 db.session.commit()
#         else:
#             article = Articulo(**data)
#             artist = Artista.query.get(article.artista_id)
#             article.titulo = artist.nombre + " - " + article.titulo
#             db.session.add(article)
#             db.session.commit()
#     except Exception as e:
#         return jsonify(e), 500

#     return jsonify(article.to_dict()), 200


"""
This end-point should be used in testing mode
"""


@article_api.route('/delete_all', methods=['GET'])
def delete_all():
    Articulo.query.delete()
    db.session.commit()

    return jsonify({"message": "All items deleted"}), 200


@article_api.route('/add', methods=['POST'])
def add_article():
    data = request.json
    session = db.session
    articulo = None

    session.begin()

    try:
        approved_article = session.query(Aprobaciones).get(data['id'])
        approved_article.estatus = "approved"
        session.add(approved_article)

        if approved_article.articulo_id and approved_article.articulo_id > 0:
            articulo = session.query(Articulo).get(
                approved_article.articulo_id)

            articulo.url_imagen = data['url_imagen']
            articulo.artista_id = data['artista_id']
            articulo.titulo = data['titulo']
            articulo.sello = data['sello']
            articulo.formato = data['formato']
            articulo.pais = data['pais']
            articulo.publicado = data['publicado']
            articulo.genero = data['genero']
            articulo.estilos = data['estilos']
        else:
            articulo = Articulo(
                url_imagen=data['url_imagen'],
                artista_id=data['artista_id'],
                titulo=data['titulo'],
                sello=data['sello'],
                formato=data['formato'],
                pais=data['pais'],
                publicado=data['publicado'],
                genero=data['genero'],
                estilos=data['estilos']
            )

        session.add(articulo)
        session.commit()

        return jsonify({"message": "Artículo guardado satisfactoriamente"})
    except Exception as e:
        session.rollback()
        error_message = 'Error al agregar artículo: ' + str(e)
        print(error_message)
        return jsonify({'error': error_message}), 500

# ----------------------- GET AND POST VIDEO UPDATES TO REVIEW -----------------------


@article_api.route('/get_updates', methods=['GET'])
def get_updates_requests():

    updates = ActualizacionesDeVideos.query.all()
    return_data = []

    for update in updates:
        db_videos_data = update.obtener_cambios()
        videos_data = []
        for video_data in db_videos_data:
            video_dict = {
                'video_id': video_data['video_id'],
                'titulo': video_data['titulo'],
                'url_imagen': video_data['url_imagen'],
                'fecha_creacion_video': video_data['fecha_creacion_video'],
                'nombre_canal': video_data['nombre_canal'],
                'canal_id': video_data['canal_id'],
                'cambio': video_data['cambio']
            }
            videos_data.append(video_dict)

        usuario_response = User.query.filter_by(id=update.user_id).first()
        articulo_response = Articulo.query.filter_by(
            id=update.articulo_id).first()
        object_dict = {
            'id': update.id,
            'user_id': update.user_id,
            'usuario': usuario_response.usuario,
            'articulo_id': update.articulo_id,
            'articulo_titulo': articulo_response.titulo,
            'fecha': update.fecha,
            'cambios_data': videos_data
        }
        return_data.append(object_dict)

    return jsonify({'status': 'COMPLETED', 'data': return_data}), 200


@article_api.route('/add_update', methods=['POST'])
def add_update_request():

    data = request.json
    user_id = data.get('user_id')
    articulo_id = data.get('articulo_id')
    videos_data_agregar = data.get('videos_data_agregar')
    videos_data_eliminar = data.get('videos_data_eliminar')

    if not user_id or not articulo_id:
        return jsonify({'error': 'Datos incompletos'}), 400

    fecha = datetime.date.today().strftime("%d/%m/%Y")

    updates = ActualizacionesDeVideos(
        user_id=user_id,
        articulo_id=articulo_id,
        fecha=fecha
    )

    if videos_data_agregar:
        for video_data in videos_data_agregar:
            updates.agregar_cambio(
                video_data['video_id'],
                video_data['titulo'],
                video_data['url_imagen'],
                video_data['fecha_creacion_video'],
                video_data['nombre_canal'],
                video_data['canal_id'],
                video_data['cambio']
            )

    if videos_data_eliminar:
        for video_data in videos_data_eliminar:
            updates.agregar_cambio(
                video_data['video_id'],
                video_data['titulo'],
                video_data['url_imagen'],
                video_data['fecha_creacion_video'],
                video_data['nombre_canal'],
                video_data['canal_id'],
                video_data['cambio']
            )

    db.session.add(updates)
    db.session.commit()

    return jsonify({'status': 'COMPLETED'}), 200

# ----------------------- POST (APPROVED), DELETE (REJECTED) AND GET (APPROVED) VIDEO UPDATES -----------------------


@article_api.route('/add_update/<int:update_id>', methods=['POST'])
def add_update(update_id):

    update = ActualizacionesDeVideos.query.filter_by(id=update_id).first()

    if update:
        articulo_id = update.articulo_id
        db_videos_data = update.obtener_cambios()

        for video_data in db_videos_data:
            if video_data['cambio'] == 'agregar':
                video_id =video_data['video_id']
                variable_to_check = VideosDeArticulos.query.filter_by(
                    articulo_id=articulo_id, video_id=video_id).first()
                if not variable_to_check:  # Check if the video was added before
                    nuevo_video = VideosDeArticulos(
                        articulo_id=articulo_id,
                        video_id=video_data['video_id'],
                        titulo=video_data['titulo'],
                        url_imagen=video_data['url_imagen'],
                        fecha_creacion_video=video_data['fecha_creacion_video'],
                        nombre_canal=video_data['nombre_canal'],
                        canal_id=video_data['canal_id']
                        )
                    db.session.add(nuevo_video)
            elif video_data['cambio'] == 'eliminar':
                video_id =video_data['video_id']
                video_a_borrar = VideosDeArticulos.query.filter_by(
                    articulo_id=articulo_id, video_id=video_id).first()
                if video_a_borrar:  # Check if the video was deleted before
                    db.session.delete(video_a_borrar)

        db.session.delete(update)
        db.session.commit()
        return jsonify({'status': 'COMPLETED'}), 200
    else:
        return jsonify({'error': 'Actualizacion no encontrada'}), 404


@article_api.route('/reject_update/<int:id>', methods=['DELETE'])
def reject_update(id):

    update = ActualizacionesDeVideos.query.filter_by(id=id).first()

    if not update:
        return jsonify({'error': 'Id incorrecto'}), 400

    db.session.delete(update)
    db.session.commit()

    return jsonify({'status': 'COMPLETED'}), 200


@article_api.route('/get_videos/<int:articulo_id>', methods=['GET'])
def get_videos(articulo_id):

    videos = VideosDeArticulos.query.filter_by(articulo_id=articulo_id).all()

    videos_content = []

    for video in videos:
        content_dict = {
            'id': video.id,
            'articulo_id': video.articulo_id,
            'video_id': video.video_id,
            'titulo': video.titulo,
            'url_imagen': video.url_imagen,
            'fecha_creacion_video': video.fecha_creacion_video,
            'nombre_canal': video.nombre_canal,
            'canal_id': video.canal_id
        }
        videos_content.append(content_dict)

    return jsonify({'data': videos_content})

@article_api.route('/delete_all_videos', methods=['DELETE'])
def delete_all_videos():

    videos = VideosDeArticulos.query.all()
    for video in videos:
        db.session.delete(video)
    db.session.commit()

    return jsonify({'status': 'COMPLETED'})

@article_api.route('/delete_all_updates', methods=['DELETE'])
def delete_all_updates():
    
    updates = ActualizacionesDeVideos.query.all()

    for update in updates:
        db.session.delete(update)
    
    db.session.commit()

    return jsonify({'status': 'COMPLETED'})

# ----------------------- POST, GET, REPORT, DELETE REPORT AND DELETE ARTICLE COMMENTS -----------------------


@article_api.route('/add_comment', methods=['POST'])
def add_comment():

    user_id = request.json.get('user_id')
    articulo_id = request.json.get('articulo_id')
    comentario = request.json.get('comentario')
    fecha = datetime.date.today().strftime("%d/%m/%Y")

    new_comment = ComentariosDeArticulo(
        user_id=user_id, articulo_id=articulo_id, comentario=comentario, fecha=fecha)

    if new_comment:
        db.session.add(new_comment)
        db.session.commit()

        return jsonify({'status': 'COMPLETED'}), 200
    else:
        return jsonify({'error': 'New comment declaration failed'}), 400


@article_api.route('/get_comments/<int:articulo_id>', methods=['GET'])
def get_article_comments(articulo_id):

    db_comments = ComentariosDeArticulo.query.filter_by(
        articulo_id=articulo_id).all()

    response = []
    if db_comments:
        for comment in db_comments:
            user = User.query.filter_by(id=comment.user_id).first()
            comment_dict = {
                'id': comment.id,
                'user_id': comment.user_id,
                'user_usuario': user.usuario,
                'comentario': comment.comentario,
                'fecha': comment.fecha,
            }
            response.append(comment_dict)

    return jsonify({'status': 'COMPLETED', 'data': response})


@article_api.route('/report_comment', methods=['POST'])
def report_comment():

    user_id_denunciante = request.json.get('user_id')
    comment_id = request.json.get('comment_id')
    fecha_de_reporte = datetime.date.today().strftime("%d/%m/%Y")

    comentario = ComentariosDeArticulo.query.filter_by(id=comment_id).first()

    nueva_denuncia = ComentariosDeArticuloReportados(
        user_id_escritor=comentario.user_id,
        articulo_id=comentario.articulo_id,
        comentario=comentario.comentario,
        fecha=comentario.fecha,
        comentario_id=comentario.id,
        fecha_de_reporte=fecha_de_reporte,
        user_id_denunciante=user_id_denunciante
    )

    db.session.add(nueva_denuncia)
    db.session.commit()

    return jsonify({'status': 'COMPLETED'})


@article_api.route('/get_reported_comments', methods=['GET'])
def get_reported_comments():

    reported_comments = ComentariosDeArticuloReportados.query.all()

    comments_response = []
    for reported_comment in reported_comments:
        escritor = User.query.get(reported_comment.user_id_escritor)
        denunciante = User.query.get(reported_comment.user_id_denunciante)
        comment_dict = {
            'id': reported_comment.id,
            'user_id_escritor': reported_comment.user_id_escritor,
            'user_escritor_usuario': escritor.usuario,
            'articulo_id': reported_comment.articulo_id,
            'comentario': reported_comment.comentario,
            'fecha': reported_comment.fecha,
            'comentario_id': reported_comment.comentario_id,
            'fecha_de_reporte': reported_comment.fecha_de_reporte,
            'user_id_denunciante': reported_comment.user_id_denunciante,
            'user_denunciante_usuario': denunciante.usuario
        }
        comments_response.append(comment_dict)

    return jsonify({'status': 'COMPLETED', 'data': comments_response}), 200


@article_api.route('/delete_report/<int:report_id>', methods=['DELETE'])
def delete_report(report_id):

    report = ComentariosDeArticuloReportados.query.filter_by(
        id=report_id).first()

    if report:
        db.session.delete(report)
        db.session.commit()

        return jsonify({'status': 'COMPLETED'}), 200
    else:
        return jsonify({'error': 'Report not founded'}), 400


@article_api.route('/delete_comment/<int:reported_comment_id>', methods=['DELETE'])
def delete_comment(reported_comment_id):
    try:

        reported_comment = ComentariosDeArticulo.query.filter_by(
            id=reported_comment_id).first()

        if reported_comment:

            # Eliminar todas las entradas correspondientes en los comentarios reportados
            comentario_id = reported_comment.id
            otras_denuncias_mismo_comentario = ComentariosDeArticuloReportados.query.filter_by(
                comentario_id=comentario_id).all()
            for otras_denuncias in otras_denuncias_mismo_comentario:
                db.session.delete(otras_denuncias)

            db.session.delete(reported_comment)

            # Commit después de realizar todas las operaciones
            db.session.commit()

            return jsonify({'status': 'COMPLETED'}), 200
        else:
            return jsonify({'error': 'Comment not found'}), 404

    except Exception as e:
        # Manejar errores de la base de datos
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), 500
