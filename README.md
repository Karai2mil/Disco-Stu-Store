## DISCO STU STORE

Disco Stu Store es un entorno online en desarrollo para compra, venta y publicación de artículos de registros musicales fisicos como vinilos, casetes y cd’s. Brindamos un servicio de intercambio entre compradores y vendedores para coordinar la entrega de los paquetes a cualquier parte del mundo, facilitando el acceso a distintos artículos para personas que no tengan la posibilidad de obtenerlos localmente. Las características de la página buscan generar una comunidad de intercambio musical, con usuarios habilitados a agregar nuevos artículos y a editar los artículos existentes para una mejor experiencia.

## Requisitos del sistema y versiones recomendadas
Antes de comenzar, asegúrate de tener instalados los siguientes componentes:

- [Node.js](https://nodejs.org/) y [npm](https://www.npmjs.com/) para el Front-End, versión  16.0.0 o superior.
- [Python](https://www.python.org/) y [pip](https://pip.pypa.io/) para el Back-End, versión 3.6 o superior.

### Instrucciones de instalación
 **1.** Clona el repositorio en tu maquina local ejecutando:

    git clone https://github.com/Karai2mil/Disco-Stu-Store

**3. Activamos Back-End** 

**3.1-** Desde el directorio raiz, ingresa al directorio del backend y si no tienes un entorno virtual creado, crea uno:

    cd src/api
    python3 -m venv myenv  # Crear entorno virtual

**3.2-** Activa el entorno virtual:

    source myenv/bin/activate  # Linux/Mac
    myenv\Scripts\activate     # Windows

**3.3-** Volvemos al directorio raiz e instalamos las dependencias del backend:

    pip install -r requirements.txt

**3.4-** En el directorio raiz ejecutamos el servidor Back-End:

    python3 src/app.py

**4. Accede a la aplicacion-** Una vez que ambos servidores estén activos, puedes acceder a la aplicación en tu navegador ingresando la siguiente URL:

    http://localhost:3000

**2. Configuramos Front-End** 

**2.1-** Parate en el directorio raiz para instalar dependencias:

    npm install  # Instalar dependencias (sólo la primera vez)

**2.2- Configuracion de variables de entorno** 


1) Copia el archivo `.env.example` y renómbralo a `.env`.
2) Completa las variables en el archivo `.env` con tus propias configuraciones.
3) Guarda y usa las variables según sea necesario en el proyecto.

** Por defecto esta configurada la variable BACKEND_URL utilizada para conectar el Front-End con el Back-End.


## Contacto
Si tienes preguntas o encuentras problemas durante la instalación, no dudes en contactarme directamente a mi mail: cabrerakarai@gmail.com.

