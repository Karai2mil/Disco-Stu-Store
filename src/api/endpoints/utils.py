"""
This module takes care of starting the API Server for users, Loading the DB and Adding the endpoints
"""
import requests
import time
import secrets
import string
import os
import json
from flask import Flask, request, jsonify, url_for, Blueprint, send_from_directory
from api.models import db, Articulo, Tracks, Artista, User, Curiosidades_home
from api.utils import generate_sitemap, APIException
from werkzeug.security import generate_password_hash
import cloudinary
import cloudinary.uploader
import cloudinary.api
from urllib.parse import urlparse
import traceback

utils_api = Blueprint('utils_api', __name__)

"""
Solo para pruebas iniciales. Este método no debería estar en productivo
"""


def save_to_cloudinary(image_url, custom_public_id, isRelease):
    cloudinary.config(
        cloud_name='disco-stu',
        api_key='639893174366669',
        api_secret='NOzrJLcM6aktcSU7Qt32ocZR6ik'
    )

    folder_path = 'images/'

    if isRelease:
        folder_path += "releases/"
    else:
        folder_path += "artists/"
    print('esta es la url imagen que entregamos:', image_url)
    try:
        upload_result = cloudinary.uploader.upload(
            image_url,
            folder=folder_path,
            public_id=custom_public_id)
        print(upload_result["secure_url"])
        return upload_result["secure_url"]
    except cloudinary.exceptions.Error as e:
        # Handle Cloudinary API errors
        print("Cloudinary API Error:", e)
        return jsonify({'message': "error al subir imagen"}), 500
    except cloudinary.uploader.Error as e:
        # Handle Cloudinary uploader errors
        print("Cloudinary Uploader Error:", e)
        return jsonify({'message': "error al subir imagen"}), 500


def save_initial_data_from_discosg(data):
    directory_name = "data"
    if not os.path.exists(directory_name):
        os.makedirs(directory_name)
    file_name = "data_inicial.json"
    folder_path = os.path.join(os.getcwd(), directory_name)
    file_path = os.path.join(folder_path, file_name)

    with open(file_path, "w") as file:
        json.dump(data, file, indent=4, ensure_ascii=False)


@utils_api.route('/execute_initial_data', methods=['GET'])
def load_initial_file():
    filename = "api/data/data_inicial.json"
    final_releases = None

    print("inicializando inserciones...")

    with open(filename, "r") as file:
        final_releases = json.load(file)

    session = db.session

    try:
        session.begin()
        batch_size = 10  # Tamaño del lote
        num_batches = len(final_releases) // batch_size

        for i in range(num_batches):
            batch = final_releases[i * batch_size:(i + 1) * batch_size]

            for release_item in batch:
                time.sleep(5)
                articulo_data = release_item["release"]
                artista_data = release_item.get("artist", None)
                tracklist_data = release_item["tracklist"]

                articulo = Articulo(**articulo_data)
                artista = None

                if artista_data is not None:
                    artista = Artista(**artista_data)

                tracks = [Tracks(articulo=articulo, **track_data)
                          for track_data in tracklist_data]
                articulo.tracks = tracks
                if artista.url_imagen and articulo.url_imagen:
                    try:
                        articulo.url_imagen = save_to_cloudinary(
                            articulo.url_imagen, articulo.id, True)

                        existing_artista = db.session.query(
                            Artista).filter_by(id=artista.id).first()
                        if not existing_artista:
                            session.add(artista)
                            artista.url_imagen = save_to_cloudinary(
                                artista.url_imagen, artista.id, False)
                            articulo.artista_id = artista.id
                    except Exception as e:
                        return jsonify({'message': e})

                session.add(articulo)
                session.add_all(tracks)

            session.commit()

        hashed_pass_admin = generate_password_hash("Admin123!")
        hashed_pass_user = generate_password_hash("User123!")
        user_admin = User(usuario="Admin", nombre="Admin",
                          correo="admin@discostu.com",
                          contrasenha=hashed_pass_admin,
                          is_admin=True)
        user = User(usuario="User", nombre="User",
                    correo="user@discostu.com",
                    contrasenha=hashed_pass_user,
                    is_admin=False,
                    pais_comprador="USA",
                    valoracion="100",
                    cantidad_de_valoraciones="367")
        user2 = User(usuario="User2", nombre="User2",
                     correo="user2@discostu.com",
                     contrasenha=hashed_pass_user,
                     is_admin=False,
                     pais_comprador="BRASIL",
                     valoracion="45",
                     cantidad_de_valoraciones="129")
        session.add(user_admin)
        session.add(user)
        session.add(user2)

        session.commit()
        print("Users are created...")

        create_curiosities(session)

        session.commit()

        print("Curiosities are created...")
        print("inserción de datos e imágenes terminada")
    except Exception as e:
        error_message = str(e)
        traceback.print_exc()
        session.rollback()
        print(f"Transaction failed: {e}")
        return jsonify({'message': 'Error occurred while loading initial data'}), 500
    finally:
        session.close()

    return jsonify(final_releases), 200



"""
Ejecutar solo cuando no exista el archivo JSON inicial para generarlo
"""


@utils_api.route('/load_initial_realeases', methods=['GET'])
def load_initial_realeases():
    GENRES = ['electronic', 'rock', 'jazz', 'blues', 'pop']
    RECORDS_NUMBER = 20
    final_realases = []

    print("Empezando extracción de datos de discosg...")

    for genre in GENRES:
        url = f"https://api.discogs.com/database/search?genre={genre}&type=master&key=reNoslojmDphrdPTiKQx&secret=SilbGLucXwjNzZrzffvdFtyrdaVZXUlE&per_page={RECORDS_NUMBER}&page=1"
        response_release = requests.get(url)
        data_general = response_release.json()
        print("Data General:", data_general)
        data_release = data_general["results"]
        # print("data_release: " + str(data_release))

        counter = 1

        for release in data_release:
            print("Intentando el release no: " + str(counter))
            counter += 1

            release_item = {}
            single_release = {}
            single_release['id'] = release['id']
            single_release["titulo"] = release["title"]
            single_release["url_imagen"] = release["cover_image"]
            single_release["sello"] = release["catno"]
            single_release["formato"] = release["format"][0]
            if (release["genre"]):
                single_release["genero"] = ", ".join(release["genre"]) if len(
                    release["genre"]) > 1 else release["genre"][0]
            single_release["pais"] = release["country"]
            single_release["publicado"] = release.get(
                "year", "unassigned")  # DUDAS DE ESTE CAMPO
            if (release["style"]):
                single_release["estilos"] = ", ".join(release["style"]) if len(
                    release["style"]) > 1 else release["style"][0]
            if "videos" in release:
                single_release["videos"] = release["videos"]
            release_item["release"] = single_release

            # SE OBTIENE INFORMACIÓN MASTER DEL RELEASE
            url_master = release["master_url"] + \
                "?key=reNoslojmDphrdPTiKQx&secret=SilbGLucXwjNzZrzffvdFtyrdaVZXUlE"
            response_master = requests.get(url_master)
            data_master = response_master.json()
            # print("data_master: " + str(data_master))
            tracklist = data_master.get("tracklist", [])
            # print("tracklist: " + str(tracklist))

            # SE OBTIENE INFORMACIÓN DEL TRACKLIST
            new_tracklist = []
            for track in tracklist:
                new_track = {}
                new_track["nombre"] = track["title"]
                new_track["posicion"] = track["position"]
                new_tracklist.append(new_track)
            release_item["tracklist"] = new_tracklist

            # SE OBTIENE INFORMACIÓN DEL ARTISTA
            artist = data_master.get("artists", None)
            if artist is not None:
                if artist and artist[0]["resource_url"]:
                    url_artist = artist[0]["resource_url"] + \
                        "?key=reNoslojmDphrdPTiKQx&secret=SilbGLucXwjNzZrzffvdFtyrdaVZXUlE"
                    response_artist = requests.get(url_artist)
                    data_artist = response_artist.json()
                    # print("data_artist: " + str(data_artist));

                    single_artist = {}
                    single_artist["id"] = data_artist["id"]
                    single_artist["nombre"] = data_artist.get(
                        "name", "unasigned")
                    single_artist["nombre_real"] = data_artist.get(
                        "nombre_real", "unasigned")
                    single_artist["perfil"] = data_artist.get(
                        "profile", "unasigned")
                    if "images" in data_artist and data_artist["images"]:
                        single_artist["url_imagen"] = data_artist["images"][0].get(
                            "resource_url", "unasigned")
                        # if data_artist["images"][0].get("resource_url", "unasigned") != "unasigned":
                        # single_artist["url_imagen"] = save_to_cloudinary( data_artist["images"][0].get("resource_url"), data_artist["id"])
                    # else:
                        # single_artist["url_imagen"] = "unasigned"

                release_item["artist"] = single_artist

            final_realases.append(release_item)
            # print("4 segundos para el siguiente fetch y evitar error 429...")
            time.sleep(2)
    print("Extración de datos de discosg terminada...")

    save_initial_data_from_discosg(final_realases)

    return jsonify(final_realases), 200

def create_curiosities(session):
    curiosidad_home_1 = Curiosidades_home(
            posicion="1",
            titulo=" Del plato a su oido",
            subtitulo="La lógica y mistica detrás del disco de vinilo; desde sus inicios y para siempre",
            descripcion="""El vinilo, ese icónico disco negro que ha perdurado a lo largo de las
décadas, sigue siendo un medio de reproducción de música venerado por los audiófilos
y amantes de la música analógica. Su característico sonido cálido y nostálgico se debe
en gran parte a su funcionamiento físico único y a las delicadas púas de lectura que
recorren sus surcos. En este texto, exploraremos con detalle el funcionamiento físico
del vinilo y cómo las púas de lectura interpretan su contenido musical. Los vinilos están
compuestos por un material termoplástico llamado polivinilo de cloruro (PVC). Un
disco de vinilo típico tiene una estructura en capas que consiste en una base de vinilo,
una capa central de material absorbente de choques y una capa superior que alberga
los surcos. Los surcos son la esencia del vinilo. Están dispuestos en espiral desde el
centro hacia el borde del disco y se asemejan a una serie continua de crestas y valles
microscópicos. Estos surcos contienen la información de audio codificada, que es el
resultado de una serie de vibraciones capturadas durante el proceso de grabación. La
creación de un disco de vinilo comienza con el proceso de grabación. La música se
interpreta en un estudio y se captura mediante micrófonos y otros dispositivos. Estas
señales eléctricas, que representan la música, se dirigen hacia un dispositivo llamado
cortadora de discos. La cortadora de discos es el corazón de la grabación de vinilos.
Aquí, las señales eléctricas se convierten en señales mecánicas que graban las
vibraciones en el surco del disco maestro. La cabeza de corte, montada en un brazo,
tiene una aguja que sigue las variaciones de las señales eléctricas y las convierte en
movimientos microscópicos en el surco. Durante la grabación, las vibraciones
generadas por la aguja del cabezal de corte crean valles y crestas en el surco. Los valles
representan las partes de la música con menos energía y las crestas las partes con más
energía. Esta modulación mecánica en el surco es una representación física de la
música grabada. La reproducción de vinilos es un proceso inverso al de grabación. Una
vez que un disco de vinilo es prensado a partir del disco maestro, puede ser
reproducido en un tocadiscos. El tocadiscos tiene una plataforma giratoria que
sostiene el vinilo y hace que gire a una velocidad constante. La aguja de reproducción,
también conocida como púa, se coloca en el extremo de un brazo de lectura. La púa es
un componente crucial, ya que es la encargada de seguir los surcos y convertir las
modulaciones mecánicas en señales eléctricas. La púa tiene una forma cónica o elíptica
y está hecha de un material duradero, como diamante o zafiro sintético. Esta forma le
permite rastrear las variaciones en el surco con precisión. A medida que la púa recorre
el surco, las vibraciones en el surco hacen que la púa se mueva, generando una
corriente eléctrica en los cables conectados a la misma. La corriente eléctrica generada
por las vibraciones de la púa es extremadamente débil y necesita ser amplificada. Por
lo tanto, la señal se envía a través del brazo de lectura hasta el preamplificador, donde
se amplifica lo suficiente para ser procesada por el sistema de sonido. En el
preamplificador, la señal débil y delicada se ajusta en términos de nivel de volumen y
ecualización. Luego, la señal amplificada se dirige al amplificador principal, donde se
refuerza aún más antes de ser enviada a los altavoces y convertirse en sonido audible.""",
            url_imagen="https://res.cloudinary.com/disco-stu/image/upload/v1692329995/images/curiosities/1"
        )

    curiosidad_home_2 = Curiosidades_home(
            posicion="2",
            titulo="Disco Stu: Origenes",
            subtitulo="La idea, el proceso y las mentes detrás del proyecto Disco Stu Store",
            descripcion="""Había una vez en un bullicioso mundo digital, emergió un nuevo refugio para los entusiastas de la música y los coleccionistas de vinilos. Este reino virtual se conocía como DiscoStu, una vibrante aplicación web que atendía al amor eterno por los discos de vinilo, un medio que había trascendido generaciones y géneros.
DiscoStu comenzó su viaje en la mente creativa de su fundador, Sam Turner. Un amante apasionado de la música y un ávido coleccionista de discos de vinilo, Sam siempre había soñado con crear una plataforma que celebrara la belleza y la nostalgia de la música en vinilo en la era digital. Visualizaba un lugar donde los aficionados a la música de todos los ámbitos pudieran unirse para compartir su pasión, descubrir joyas ocultas y conectarse con otros entusiastas del vinilo.
Con un corazón lleno de determinación y un toque de espíritu emprendedor, Sam se embarcó en su misión de dar vida a DiscoStu. Reunió a un diverso equipo de desarrolladores, diseñadores y amantes de la música que compartían su visión. Trabajaron incansablemente, fusionando sus talentos y experiencia para crear una aplicación web que capturara la esencia de la cultura del vinilo y ofreciera una experiencia digital sin interrupciones.
El diseño de DiscoStu fue una sinfonía visual en sí mismo. La interfaz de usuario estaba adornada con tonos intensos de azules profundos y rojos ardientes, recordando las portadas de álbumes vibrantes que adornaban los clásicos en vinilo. El diseño del sitio web exudaba un encanto de la vieja escuela, con un toque moderno que facilitaba la navegación incluso para aquellos nuevos en el mundo del vinilo.
El corazón de DiscoStu residía en su doble propósito: ser un mercado donde se pudieran comprar y vender discos de vinilo, y una comunidad donde se compartieran historias, conocimientos y recuerdos sobre el vinilo. Vendedores de todo el mundo mostraban sus colecciones más preciadas, abarcando géneros desde el rock 'n' roll hasta el jazz, desde el hip-hop hasta la música clásica. Cada listado era un testimonio de la historia y el legado que cada vinilo llevaba dentro de sus surcos.
Los compradores, tanto coleccionistas experimentados como novatos curiosos, emprendieron sus propios viajes musicales mientras exploraban el vasto catálogo. Las innovadoras funciones de búsqueda de DiscoStu permitían a los usuarios encontrar sus álbumes favoritos con facilidad, al tiempo que sugerían joyas ocultas en función de sus preferencias. La aplicación web se convirtió en una tienda de discos virtual, abierta las 24 horas, donde cada clic resonaba con la alegría de hojear pilas de vinilos en una tienda física.
El aspecto comunitario de DiscoStu floreció a medida que los entusiastas compartían anécdotas de sus primeras compras de vinilos, recuerdos afectuosos de tocar discos con familiares y amigos, y el sentimiento indescriptible de colocar la aguja en la superficie del vinilo. Un foro dedicado brindaba un espacio para discusiones sobre el mantenimiento de los tocadiscos, la apreciación del arte del álbum y la búsqueda de ediciones raras.
A medida que DiscoStu continuó creciendo, se convirtió en algo más que una aplicación web; evolucionó en un centro cultural que celebraba el pasado, el presente y el futuro de la música en vinilo. Era un homenaje a los artistas que vertieron sus almas en la creación de música que resonó a través de las edades. Era un testimonio de las personas que preservaron la magia del vinilo y la transmitieron a nuevas generaciones.
Y así, la historia de DiscoStu comenzó con un sueño apasionado y un compromiso de preservar el arte del vinilo en una era digital. La visión de Sam Turner cobró vida, y la aplicación web prosperó como un lugar de encuentro para aquellos que compartían un amor común: el amor por la música que giraba en surcos, contaba historias a través de melodías y conectaba almas a lo largo del tiempo y el espacio.
""",
            url_imagen="https://res.cloudinary.com/disco-stu/image/upload/v1692329995/images/curiosities/2"
        )
    
    curiosidad_home_3 = Curiosidades_home(
            posicion="3",
            titulo="Audio analogico vs audio digital",
            subtitulo=" La gran batalla continua; el frio y contundente sonido del audio digital contra el calido y mistico sonido analogico",
            descripcion=""" La gran batalla continua; el frio y contundente sonido del audio digital
contra el calido y mistico sonido analogico
Descripcion: En el corazón de la experiencia musical yace un debate que ha persistido a
lo largo de décadas: el sonido analógico versus el digital. Dos enfoques completamente
distintos para capturar, almacenar y reproducir la música, cada uno con sus propias
cualidades y seguidores apasionados. Sumergirse en esta disyuntiva es adentrarse en
un fascinante viaje que explora la esencia misma del sonido y cómo lo percibimos.
El sonido analógico, encarnado por los vinilos y las cintas magnéticas, es un testimonio
del proceso orgánico y continuo de la música. En este mundo, las vibraciones sonoras
se traducen directamente en surcos físicos o magnetización, preservando la energía
original en su forma más pura. Los amantes del sonido analógico celebran su calidez,
su riqueza tonal y el toque nostálgico que los transporta a épocas pasadas. Los vinilos,
en particular, son venerados no solo por su sonido, sino por la experiencia ritualística
de manipularlos y sumergirse en el arte de las portadas.
Contrastando con esto, el sonido digital abraza la era de los ceros y unos,
transformando las señales sonoras en datos numéricos que se almacenan y procesan
electrónicamente. La precisión matemática de este enfoque brinda una reproducción
constante y fidedigna. La música digital ha democratizado el acceso, permitiendo que
millones de canciones estén al alcance de un clic. Además, la manipulación digital
ofrece un lienzo infinito para la creatividad, desde la mezcla y la masterización hasta la
experimentación sónica.
Sin embargo, en este deslumbrante avance tecnológico también surgen
cuestionamientos. Los puristas del sonido argumentan que la conversión y compresión
digital pueden reducir sutilezas y detalles presentes en el sonido analógico. Los vinilos,
en su naturaleza analógica, capturan imperfecciones y matices que, paradójicamente,
los vuelven más humanos y auténticos. El crujido de una aguja sobre un surco, la
vibración de un altavoz antiguo: estas peculiaridades añaden una dimensión emocional
a la experiencia auditiva.
Pero los defensores de lo digital señalan que la tecnología ha avanzado para superar
las limitaciones del pasado. La alta resolución y la capacidad de reproducción precisa
han llevado la calidad de audio digital a nuevas alturas. La portabilidad de miles de
canciones en un dispositivo pequeño y la comodidad de las plataformas de streaming
son ventajas innegables.
En última instancia, la elección entre analógico y digital es una cuestión de preferencia
personal y contexto. Algunos buscan la autenticidad y la conexión con el pasado que
brindan los vinilos. Otros valoran la fidelidad y la accesibilidad de la música digital en el
mundo moderno. Afortunadamente, no se trata de una elección excluyente. Ambos
mundos coexisten, y cada uno puede enriquecer nuestra comprensión y apreciación de
la música. La diversidad de opciones significa que podemos saborear la experiencia
sonora de maneras únicas y emocionalmente resonantes.""",
            url_imagen="https://res.cloudinary.com/disco-stu/image/upload/v1692329995/images/curiosities/3"
        )
    
    curiosidad_home_4 = Curiosidades_home(
            posicion="4",
            titulo="Racconto de lo ritmos y sonidos que nos anteceden",
            subtitulo="La musica: un regalo de la naturaleza, una herramienta para la vida",
            descripcion="""La música, ese lenguaje universal que atraviesa las barreras del tiempo y la cultura,
tiene sus raíces profundamente arraigadas en la esencia misma de la humanidad.
Desde los albores de la civilización, los seres humanos han buscado formas de
expresarse a través de sonidos y ritmos, creando un tapiz sonoro que ha
evolucionado y florecido a lo largo de los siglos.
Los primeros capítulos de la historia de la música son un testimonio de la relación
innata del ser humano con su entorno. En las vastas extensiones de la naturaleza, las
tribus ancestrales crearon música utilizando los elementos a su alrededor. La voz
humana imitaba los cantos de aves y el murmullo de los ríos, mientras que la
percusión nacía de las palmas y los golpes rítmicos de piedras y troncos. Estos
sonidos eran más que meras notas; eran conexiones entre las personas y el mundo
que los rodeaba.
Con el tiempo, la música se convirtió en un medio para comunicar emociones y
contar historias. Los instrumentos musicales primitivos, hechos a mano con
elementos naturales, se convirtieron en herramientas para narrar mitos, celebrar
victorias y llorar pérdidas. Las antiguas civilizaciones de Mesopotamia, Egipto, China
y más allá, emplearon la música en sus rituales religiosos y ceremonias, creando
melodías que resonaban en las paredes de los templos y reverberaban en los
corazones de los fieles.
La antigua Grecia dejó una marca indeleble en la historia de la música con sus teorías
y prácticas. Pitágoras y Aristóteles exploraron la matemática detrás de la música,
estableciendo las bases para la comprensión de las escalas y los intervalos. El aulos y
la lira acompañaban las representaciones teatrales, estableciendo una relación
estrecha entre la música y el drama.
El Medioevo vio la consolidación de la música sacra en la forma de canto gregoriano.
Las catedrales resonaban con himnos que trascendían el tiempo y el espacio,
conectando a las generaciones a través de su espiritualidad. Al mismo tiempo, los
trovadores y troveros recorrían las cortes y los caminos de Europa, cantando sobre el
amor cortés y las aventuras caballerescas en las canciones de gesta y los poemas
épicos.
El Renacimiento trajo consigo una explosión de creatividad musical, con
compositores como Josquin des Prez y Palestrina que experimentaron con la
polifonía y la armonía. La invención de la imprenta musical permitió una difusión
más amplia de la música escrita, democratizando el acceso a la melodía y la letra
impresas.
El Barroco trajo la grandiosidad y la emoción desbordante de compositores como
Bach y Handel. Las óperas de Monteverdi y Purcell combinaron la música con el
drama, dando lugar a una nueva forma de expresión artística. El Clasicismo refinó la
estructura y la forma, con Mozart y Beethoven guiando la música hacia la era
moderna.
El Romanticismo desató la imaginación, permitiendo que los compositores se
sumergieran en sus emociones y exploraran nuevos sonidos. Chopin evocaba la
pasión en sus piezas para piano, mientras que Wagner transformaba la ópera en una
experiencia total. El siglo XX revolucionó la música con el jazz, el blues, el rock 'n'
roll y la música electrónica. Los avances tecnológicos llevaron la música a los hogares
y a los bolsillos, transformando la forma en que experimentamos la melodía y el
ritmo.
En la actualidad, la música es un tapiz diverso y colorido que abarca géneros y estilos
de todo el mundo. La globalización y la conectividad digital han permitido que las
influencias culturales se fusionen, dando lugar a géneros híbridos y colaboraciones
internacionales. La historia de la música es un tributo a la creatividad humana, un
reflejo de nuestras aspiraciones, luchas y triunfos a lo largo del tiempo. Cada nota,
cada acorde, cada canción es un recordatorio de nuestra capacidad de crear belleza y
expresión a través del sonido.""",
            url_imagen="https://res.cloudinary.com/disco-stu/image/upload/v1692329995/images/curiosities/4"
        )

    curiosidad_home_5 = Curiosidades_home(
            posicion="5",
            titulo="Del pasado, para el presente y futuro",
            subtitulo="Historias de vinilos legendarios: Inmersión profunda en joyas musicales inolvidables",
            descripcion="""En la vastedad de la historia musical, ciertos vinilos trascienden las
limitaciones de su medio y se elevan a la categoría de leyendas. Cada uno de estos
discos no solo ha transformado la música, sino que también ha dejado una huella
imborrable en la cultura y en las almas de aquellos que los han escuchado. Aquí, te
sumergirás en historias más profundas detrás de estos vinilos legendarios que han
dado forma a la banda sonora de la vida.
1. "Sgt. Pepper's Lonely Hearts Club Band" - The Beatles:
En 1967, The Beatles sorprendieron al mundo con "Sgt. Pepper's Lonely Hearts Club
Band". Más que un simple álbum, fue un manifiesto musical que redefinió las
fronteras del pop. Cada canción es una aventura en sí misma, desde la ecléctica "Lucy
in the Sky with Diamonds" hasta la profunda "A Day in the Life". La portada,
diseñada por Peter Blake, mostraba a los Beatles rodeados de personajes icónicos,
creando una pieza de arte pop en sí misma. Este álbum marcó un cambio de
paradigma al concebir la música como un todo cohesivo, uniendo temas a través de
interludios y logrando una obra maestra conceptual que todavía resuena en la
actualidad.
2. "The Dark Side of the Moon" - Pink Floyd:
En 1973, Pink Floyd presentó "The Dark Side of the Moon", un álbum que exploró la
complejidad de la vida y la mente humana. El disco desafió los límites
convencionales del rock al fusionar música, efectos de sonido y letras introspectivas
en una sinfonía coherente. Cada canción fluye en la siguiente, creando una
experiencia auditiva inmersiva. El álbum trataba temas como la vida, la muerte, la
locura y la búsqueda del significado, y su icónica portada prismática se convirtió en
un emblema de la era psicodélica. "The Dark Side of the Moon" sigue siendo un viaje
auditivo y emocional, una narrativa sonora que trasciende el tiempo.
3. "Thriller" - Michael Jackson:
En 1982, Michael Jackson lanzó "Thriller", un álbum que cambió las reglas del juego
en la industria musical. Con éxitos como "Billie Jean" y "Beat It", Jackson no solo
redefinió el pop, sino que también elevó los videoclips a un nuevo nivel con el
icónico video de "Thriller". La fusión de estilos, desde el pop hasta el funk y el rock,
demostró la versatilidad artística de Jackson. Cada canción era un sencillo potencial,
y el álbum rompió barreras raciales y culturales, dejando una huella imborrable en la
cultura pop.
4. "Nevermind" - Nirvana:
El año 1991 marcó un antes y un después en el mundo del rock con el lanzamiento
de "Nevermind" de Nirvana. La canción "Smells Like Teen Spirit" se convirtió en el
himno de una generación y catapultó al grunge al escenario mundial. Las letras
introspectivas de Kurt Cobain resonaron con una audiencia sedienta de autenticidad.
El álbum se destacó por su mezcla cruda y emocional, y su impacto cultural
trascendió la música, influyendo en la moda y la actitud de toda una generación.
5. "Back to Black" - Amy Winehouse:
En 2006, Amy Winehouse dejó una marca indeleble con "Back to Black". Con su voz
poderosa y emotiva, Winehouse entregó canciones que narraban su lucha con el
amor y la adicción. La profundidad de las letras y la fusión de soul, R&B y jazz
crearon un álbum atemporal. Sin embargo, la trágica historia detrás del álbum, que
reflejaba su propia lucha personal, añadió una capa de melancolía. "Back to Black" es
un testimonio del genio creativo de Winehouse y su impacto duradero en la música
y la cultura.
Cada uno de estos vinilos legendarios es un portal a momentos históricos,
emocionales y culturales. A través de estas obras maestras, nos sumergimos en la
creatividad, la pasión y la innovación de los artistas que han dejado una marca
imborrable en el tapiz musical de la humanidad.
""",
            url_imagen="https://res.cloudinary.com/disco-stu/image/upload/v1692329995/images/curiosities/5"
        )
    session.add(curiosidad_home_1)
    session.add(curiosidad_home_2)
    session.add(curiosidad_home_3)
    session.add(curiosidad_home_4)
    session.add(curiosidad_home_5)