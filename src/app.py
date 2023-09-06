"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta
from api.utils import APIException, generate_sitemap
from api.models import db
from api.routes import api
from api.endpoints.approvals_api import approvals_api
from api.endpoints.article_api import article_api
from api.endpoints.artist_api import artist_api
from api.endpoints.cart_api import cart_api
from api.endpoints.collection_api import collection_api
from api.endpoints.favorite_api import favorite_api
from api.endpoints.inbox_admin_api import inbox_admin_api
from api.endpoints.inbox_user_api import inbox_user_api
from api.endpoints.offer_api import offer_api
from api.endpoints.order_api import order_api
from api.endpoints.payment_api import payment_api
from api.endpoints.searchbar_api import searchbar_api
from api.endpoints.track_api import track_api
from api.endpoints.user_api import user_api
from api.endpoints.utils import utils_api
from api.endpoints.home_api import home_api

from api.admin import setup_admin
from api.commands import setup_commands

from flask_mail import Mail
from dotenv import load_dotenv
load_dotenv()

# from models import Person

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../public/')
app = Flask(__name__)

app.url_map.strict_slashes = False

app.config["JWT_SECRET_KEY"] = "disco-stu-store"


app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(
    hours=1)  # Tiempo de expiración del access token: 1 hora
# Tiempo de expiración del refresh token: 30 días
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
jwt = JWTManager(app)

# Configure email settings
app.config.update(
    MAIL_SERVER=os.getenv('MAIL_SERVER'),
    MAIL_PORT=int(os.getenv('MAIL_PORT')),
    MAIL_USE_SSL=os.getenv('MAIL_USE_SSL') == 'True',
    MAIL_USERNAME=os.getenv('MAIL_USERNAME'),
    MAIL_PASSWORD=os.getenv('MAIL_PASSWORD')
)

# Initialize Mail object
mail = Mail(app)

# database configuration
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
MIGRATE = Migrate(app, db, compare_type=True)


# Allow CORS requests to this API
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# add the admin
setup_admin(app)

# add the admin
setup_commands(app)

# Add all endpoints form the API with a "api" prefix
app.register_blueprint(api, url_prefix='/api')
app.register_blueprint(approvals_api, url_prefix='/api/approvals')
app.register_blueprint(article_api, url_prefix='/api/articles')
app.register_blueprint(artist_api, url_prefix='/api/artists')
app.register_blueprint(cart_api, url_prefix='/api/cart')
app.register_blueprint(collection_api, url_prefix='/api/collections')
app.register_blueprint(favorite_api, url_prefix='/api/favorites')
app.register_blueprint(inbox_admin_api, url_prefix='/api/inbox_admin')
app.register_blueprint(inbox_user_api, url_prefix='/api/inbox_user')
app.register_blueprint(offer_api, url_prefix='/api/offers')
app.register_blueprint(order_api, url_prefix='/api/orders')
app.register_blueprint(payment_api, url_prefix='/api/payment')
app.register_blueprint(searchbar_api, url_prefix='/api/searchbar')
app.register_blueprint(track_api, url_prefix='/api/tracks')
app.register_blueprint(user_api, url_prefix='/api/users')
app.register_blueprint(utils_api, url_prefix='/api/utils')
app.register_blueprint(home_api, url_prefix='/api/home')

# Handle/serialize errors like a JSON object


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# generate sitemap with all your endpoints


@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

# any other endpoint will try to serve it like a static file


@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # avoid cache memory
    return response


# # this only runs if `$ python src/main.py` is executed
if __name__ == '__main__':
        app.run(debug=True, host='0.0.0.0', port=5000)
# this only runs if `$ python src/app.py` is executed
# if __name__ == "__main__":
#     PORT = int(os.environ.get("PORT", 3000))
#     app.run(host="0.0.0.0", port=PORT, debug=False)