from flask_sqlalchemy import SQLAlchemy
import  json
from sqlalchemy.dialects.postgresql import JSONB

db = SQLAlchemy()

# class User(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     email = db.Column(db.String(120), unique=True, nullable=False)
#     password = db.Column(db.String(80), unique=False, nullable=False)
#     is_active = db.Column(db.Boolean(), unique=False, nullable=False)

#     def __repr__(self):
#         return f'<User {self.email}>'

#     def serialize(self):
#         return {
#             "id": self.id,a
#             "email": self.email,
#             # do not serialize the password, its a security breach
#         }


class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    usuario = db.Column(db.String(250), unique=True, nullable=False)
    nombre = db.Column(db.String(250), unique=True)
    correo = db.Column(db.String(250), unique=True, nullable=False)
    contrasenha = db.Column(db.String(250), unique=False, nullable=False)
    direccion_comprador = db.Column(db.String(250))
    ciudad_comprador = db.Column(db.String(250))
    estado_comprador = db.Column(db.String(250))
    codigo_postal_comprador = db.Column(db.String(250))
    pais_comprador = db.Column(db.String(250))
    telefono_comprador = db.Column(db.String(250))
    valoracion = db.Column(db.Integer, default=0)
    valoraciones_positivas = db.Column(db.Integer, default=0)
    valoraciones_negativas = db.Column(db.Integer, default=0)
    cantidad_de_valoraciones = db.Column(db.Integer, default=0)
    cliente_ID_paypal = db.Column(db.String(250))
    secret_key_paypal = db.Column(db.String(250))
    isSeller = db.Column(db.Boolean(), unique=False, default=False)
    is_admin = db.Column(db.Boolean(), unique=False, nullable=False)

    aprobaciones = db.relationship(
        'Aprobaciones', backref='user', cascade='all, delete-orphan', single_parent=True)


class Articulo(db.Model):
    __tablename__ = 'articulo'
    id = db.Column(db.Integer, primary_key=True)
    url_imagen = db.Column(db.String(250))
    artista_id = db.Column(db.Integer, db.ForeignKey('artista.id'))
    titulo = db.Column(db.String(250), nullable=False)
    sello = db.Column(db.String(250), unique=False)
    formato = db.Column(db.String(250))
    pais = db.Column(db.String(250), nullable=False)
    publicado = db.Column(db.String(250), nullable=False)
    genero = db.Column(db.String(250), nullable=False)
    estilos = db.Column(db.String(250))

    artista = db.relationship('Artista', uselist=False, back_populates='articulo',
                              cascade='all, delete-orphan', single_parent=True)
    tracks = db.relationship(
        'Tracks', back_populates='articulo', cascade='all, delete-orphan')

    def to_dict(self):
        tracks_list = []
        for track in self.tracks:
            tracks_list.append({
                'id': track.id,
                'nombre': track.nombre,
                "posicion": track.posicion
            })

        return {
            'id': self.id,
            'url_imagen': self.url_imagen,
            'artista_id': self.artista_id,
            'titulo': self.titulo,
            'sello': self.sello,
            'formato': self.formato,
            'pais': self.pais,
            'publicado': self.publicado,
            'genero': self.genero,
            'estilos': self.estilos,
            'tracks': tracks_list
        }

# Contenido nuevo

class ComentariosDeArticulo(db.Model):
    __tablename__ = 'comentarios_de_articulo'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    articulo_id = db.Column(db.Integer, db.ForeignKey('articulo.id'))
    comentario = db.Column(db.String(500))
    fecha = db.Column(db.String(50))
    reportados = db.relationship('ComentariosDeArticuloReportados', backref='comentario_articulo', cascade='all, delete-orphan', passive_deletes=True)


class ComentariosDeArticuloReportados(db.Model):
    __tablename__ = 'comentarios_de_articulo_reportados'
    id = db.Column(db.Integer, primary_key=True)
    user_id_escritor = db.Column(db.Integer, db.ForeignKey('user.id'))
    articulo_id = db.Column(db.Integer, db.ForeignKey('articulo.id'))
    comentario = db.Column(db.String(500))
    fecha = db.Column(db.String(50))
    comentario_id = db.Column(db.Integer, db.ForeignKey('comentarios_de_articulo.id', ondelete='CASCADE'), nullable=False)
    fecha_de_reporte = db.Column(db.String(50))
    user_id_denunciante = db.Column(db.Integer, db.ForeignKey('user.id'))

class VideosDeArticulos(db.Model):
    __tablename__ = 'videos_de_articulos'
    id = db.Column(db.Integer, primary_key=True)
    articulo_id = db.Column(db.Integer, db.ForeignKey('articulo.id'))
    video_id = db.Column(db.String(100))
    titulo = db.Column(db.String(100))
    url_imagen = db.Column(db.String(250))
    fecha_creacion_video = db.Column(db.String(100))
    nombre_canal = db.Column(db.String(100))
    canal_id = db.Column(db.String(100))
    posicion = db.Column(db.Integer)

class ActualizacionesDeVideos(db.Model):
    __tablename__ = 'actualizaciones_de_videos'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    articulo_id = db.Column(db.Integer, db.ForeignKey('articulo.id'))
    fecha = db.Column(db.String(50))
    posicion = db.Column(JSONB)
    cambios = db.Column(JSONB)

    def __init__(self, user_id, articulo_id, fecha, cambios=None):
        self.user_id = user_id
        self.articulo_id = articulo_id
        self.fecha = fecha
        self.posicion = {}
        self.cambios = cambios or []

    def agregar_cambio(self, video_id, titulo, url_imagen, fecha_creacion_video, nombre_canal, canal_id, cambio):
        nuevo_objeto = {
            'video_id': video_id,
            'titulo': titulo,
            'url_imagen': url_imagen,
            'fecha_creacion_video': fecha_creacion_video,
            'nombre_canal': nombre_canal,
            'canal_id': canal_id,
            'cambio': cambio
        }
        self.cambios.append(nuevo_objeto)

    def definir_posicion(self, video_id, posicion):
        self.posicion[video_id] = posicion

    def obtener_cambios(self):
        return self.cambios


class Aprobaciones(db.Model):
    __tablename__ = 'aprobaciones'
    id = db.Column(db.Integer, primary_key=True)
    articulo_id = db.Column(db.Integer, nullable=True)
    url_imagen = db.Column(db.String(250))
    artista_id = db.Column(db.Integer, nullable=False)
    titulo = db.Column(db.String(250), nullable=False)
    sello = db.Column(db.String(250), unique=False)
    formato = db.Column(db.String(250))
    pais = db.Column(db.String(250), nullable=False)
    publicado = db.Column(db.String(250), nullable=False)
    genero = db.Column(db.String(250), nullable=False)
    estilos = db.Column(db.String(250))
    tipo = db.Column(db.String(15), nullable=False)
    estatus = db.Column(db.String(15), nullable=False, default="pending")
    user_id = db.Column(db.Integer, db.ForeignKey(
        'user.id', ondelete='CASCADE'), nullable=False)

    user_relationship = db.relationship(
        'User', backref='aprobaciones_related', viewonly=True)

    def to_dict(self):
        return {
            'id': self.id,
            "articulo_id": self.articulo_id,
            'url_imagen': self.url_imagen,
            'artista_id': self.artista_id,
            'titulo': self.titulo,
            'sello': self.sello,
            'formato': self.formato,
            'pais': self.pais,
            'publicado': self.publicado,
            'genero': self.genero,
            'estilos': self.estilos,
            'tipo': self.tipo,
            "estatus": self.estatus,
            'user': {
                'id': self.user_relationship.id,
                'usuario': self.user_relationship.usuario
            }
        }


class Tracks(db.Model):
    __tablename__ = 'tracks'
    id = db.Column(db.Integer, primary_key=True)
    articulo_id = db.Column(db.Integer, db.ForeignKey('articulo.id'))
    nombre = db.Column(db.String(250))
    posicion = db.Column(db.String(250))

    articulo = db.relationship('Articulo', back_populates='tracks')

    def to_dict(self):
        return {
            'id': self.id,
            'articulo_id': self.articulo_id,
            'nombre': self.nombre,
            'posicion': self.posicion
        }


class Favoritos(db.Model):
    __tablename__ = 'favoritos'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    articulo_id = db.Column(db.Integer, db.ForeignKey('articulo.id'))


class Coleccion(db.Model):
    __tablename__ = 'coleccion'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    articulo_id = db.Column(db.Integer, db.ForeignKey('articulo.id'))


class Carrito(db.Model):
    __tablename__ = 'carrito'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    vendedor_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    oferta_id = db.Column(db.Integer, db.ForeignKey('ofertas.id'))


class Bandeja_de_entrada(db.Model):
    _tablename__ = 'bandeja_de_entrada'
    id = db.Column(db.Integer, primary_key=True)
    emisor_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    receptor_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    asunto = db.Column(db.String(250))
    mensaje = db.Column(db.String(250))
    fecha = db.Column(db.String(250))
    isMessage = db.Column(db.Boolean, default=True)


class Bandeja_de_entrada_admin(db.Model):
    _tablename__ = 'bandeja_de_entrada_admin'
    id = db.Column(db.Integer, primary_key=True)
    emisor_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    asunto = db.Column(db.String(250))
    mensaje = db.Column(db.String(250))
    fecha = db.Column(db.String(250))


class Archivo_mensajes_admin(db.Model):
    __tablename__ = 'archivo_mensajes_admin'
    id = db.Column(db.Integer, primary_key=True)
    emisor_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    asunto = db.Column(db.String(250))
    mensaje = db.Column(db.String(250))
    fecha = db.Column(db.String(250))


class Mensajes_enviados(db.Model):
    _tablename__ = 'mensajes_enviados'
    id = db.Column(db.Integer, primary_key=True)
    emisor_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    receptor_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    asunto = db.Column(db.String(250))
    mensaje = db.Column(db.String(250))
    fecha = db.Column(db.String(250))
    isMessage = db.Column(db.Boolean, default=True)


class Mensajes_eliminados(db.Model):
    _tablename__ = 'mensajes_eliminados'
    id = db.Column(db.Integer, primary_key=True)
    emisor_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    receptor_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    asunto = db.Column(db.String(250))
    mensaje = db.Column(db.String(250))
    fecha = db.Column(db.String(250))
    isMessage = db.Column(db.Boolean, default=True)

class Ofertas(db.Model):
    __tablename__ = 'ofertas'
    id = db.Column(db.Integer, primary_key=True)
    vendedor_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    articulo_id = db.Column(db.Integer, db.ForeignKey('articulo.id'))
    condicion_funda = db.Column(db.String(250))
    condicion_soporte = db.Column(db.String(250))
    precio = db.Column(db.Integer)
    comentario = db.Column(db.String(250))


# Tabla intermedia para la relación many-to-many entre Pedido y Articulo
pedido_articulos = db.Table('pedido_articulos',
                            db.Column('pedido_id', db.Integer, db.ForeignKey(
                                'pedido.id'), primary_key=True),
                            db.Column('articulo_id', db.Integer, db.ForeignKey(
                                'articulo.id'), primary_key=True)
                            )


class Pedido(db.Model):
    __tablename__ = 'pedido'
    id = db.Column(db.Integer, primary_key=True)
    subtotal = db.Column(db.Integer)
    precio_envio = db.Column(db.Integer, default=None)
    precio_total = db.Column(db.Integer)
    impuesto = db.Column(db.Integer)
    condicion_funda = db.Column(db.String(250))
    condicion_soporte = db.Column(db.String(250))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    vendedor_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    pagado = db.Column(db.Boolean, default=False)
    valorado = db.Column(db.Boolean, default=False)
    haveShipping = db.Column(db.Boolean, default=False)
    ofertas_ids = db.Column(db.ARRAY(db.Integer))

    user = db.relationship('User', foreign_keys=[
                           user_id], backref='pedidos_realizados')
    vendedor = db.relationship('User', foreign_keys=[
                               vendedor_id], backref='pedidos_vendidos')
    articulos = db.relationship(
        'Articulo', secondary=pedido_articulos, backref=db.backref('pedidos', lazy='dynamic'))

    def marcar_como_pagado(self):
        self.pagado = True


class Artista(db.Model):
    __tablename__ = 'artista'
    id = db.Column(db.Integer, primary_key=True)
    url_imagen = db.Column(db.Text)
    nombre = db.Column(db.String(250))
    nombre_real = db.Column(db.String(250))
    perfil = db.Column(db.Text)

    # articulo = db.relationship('Articulo', uselist=False, backref='artista', overlaps="articulo_relacion")
    articulo = db.relationship('Articulo', uselist=False, back_populates='artista',
                               cascade='all, delete-orphan', single_parent=True)

    def to_dict(self):
        return {
            'id': self.id,
            'url_imagen': self.url_imagen,
            'nombre': self.nombre,
            'nombre_real': self.nombre_real,
            'perfil': self.perfil
        }


class Curiosidades_home(db.Model):
    __tablename__ = 'home_content'
    id = db.Column(db.Integer, primary_key=True)
    posicion = db.Column(db.Integer)
    titulo = db.Column(db.String(300))
    subtitulo = db.Column(db.String(300))
    descripcion = db.Column(db.String(4000))
    url_imagen = db.Column(db.String(350))
