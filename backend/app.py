from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from dotenv import load_dotenv
import os

from models import db
from routes.auth import auth_bp
from routes.products import products_bp
from routes.orders import orders_bp
from routes.loyalty import loyalty_bp
from routes.gift_cards import gift_cards_bp
from routes.qr_order import qr_order_bp

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='static')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI', 'sqlite:///digital_cafe.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'super-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 60 * 60 * 24 * 7  # 7 days
app.config['JWT_TOKEN_LOCATION'] = ['headers']
app.config['JWT_HEADER_NAME'] = 'Authorization'
app.config['JWT_HEADER_TYPE'] = 'Bearer'

# Configure CORS properly - only apply once!
CORS(app, resources={r"/*": {"origins": "*"}}, 
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     supports_credentials=True)

# Set up route blueprints
db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(products_bp, url_prefix='/api/products')
app.register_blueprint(orders_bp, url_prefix='/api/orders')
app.register_blueprint(loyalty_bp, url_prefix='/api/loyalty')
app.register_blueprint(gift_cards_bp, url_prefix='/api/gift-cards')
app.register_blueprint(qr_order_bp, url_prefix='/api/qr-order')

@app.route('/')
def index():
    return jsonify({"message": "Welcome to Digital Cafe API"}), 200

# Serve static files directly
@app.route('/static/images/<path:filename>')
def serve_static(filename):
    return send_from_directory(os.path.join(app.static_folder, 'images'), filename)

@app.route('/api/test-cors', methods=['GET', 'OPTIONS'])
def test_cors():
    """Test endpoint for CORS headers"""
    print("Testing CORS endpoint hit")
    print("Request headers:")
    for header, value in request.headers:
        print(f"  {header}: {value}")
        
    if request.method == 'OPTIONS':
        return '', 200
        
    return jsonify({
        "message": "CORS test endpoint working",
        "headers_received": {k: v for k, v in request.headers.items()},
        "success": True
    }), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True) 