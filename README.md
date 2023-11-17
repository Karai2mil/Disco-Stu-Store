## DISCO STU STORE

Disco Stu Store es un entorno online en desarrollo para compra, venta y publicación de artículos de registros musicales fisicos como vinilos, casetes y cd’s. Brindamos un servicio de intercambio entre compradores y vendedores para coordinar la entrega de los paquetes a cualquier parte del mundo, facilitando el acceso a distintos artículos para personas que no tengan la posibilidad de obtenerlos localmente. Las características de la página buscan generar una comunidad de intercambio musical, con usuarios habilitados a agregar nuevos artículos y a editar los artículos existentes para una mejor experiencia.

### Instrucciones de instalación
 **1.** Clona el repositorio en tu maquina local ejecutando:

    git clone https://github.com/Karai2mil/Disco-Stu-Store

**2. Activamos Front-End -** Parate en el directorio raiz para instalar y activar el Front-End:

    npm install    # Instalar dependencias (sólo la primera vez)
    npm run start  # Iniciar el servidor frontend

**3. Activamos Back-End -** Desde el directorio raiz, ingresa al directorio del backend y si no tienes un entorno virtual creado, crea uno:

    cd src/api
    python3 -m venv myenv  # Crear entorno virtual

**3.1-** Instalamos las dependencias del backend:

    pip install -r requirements.txt

**3.2-** Activa el entorno virtual:

    source myenv/bin/activate  # Linux/Mac
    myenv\Scripts\activate     # Windows

**3.3-** En el directorio raiz ejecutamos el servidor Back-End:

    python3 src/app.py

**4. Accede a la aplicacion-** Una vez que ambos servidores estén activos, puedes acceder a la aplicación en tu navegador ingresando la siguiente URL:

    http://localhost:3000



