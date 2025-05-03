from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import foreign

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    first_name = db.Column(db.String(80))
    last_name = db.Column(db.String(80))
    birthday = db.Column(db.Date, nullable=True)
    loyalty_points = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    orders = db.relationship('Order', backref='customer', lazy=True)
    gift_cards_sent = db.relationship('GiftCard', foreign_keys='GiftCard.sender_id', backref='sender', lazy=True)
    gift_cards_received = db.relationship('GiftCard', foreign_keys='GiftCard.receiver_id', backref='receiver', lazy=True)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    image_url = db.Column(db.String(255), nullable=True)
    is_available = db.Column(db.Boolean, default=True)
    points_value = db.Column(db.Integer, default=0)  # Points earned per purchase
    
    # Relationships
    customizations = db.relationship('Customization', backref='product', lazy=True)
    order_items = db.relationship('OrderItem', backref='product', lazy=True)

class Customization(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    options = db.Column(db.JSON, nullable=False)  # List of possible options
    price_impact = db.Column(db.JSON, nullable=False)  # Price impact per option

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, processing, completed, cancelled
    order_date = db.Column(db.DateTime, default=datetime.utcnow)
    total_amount = db.Column(db.Float, nullable=False)
    points_earned = db.Column(db.Integer, default=0)
    points_used = db.Column(db.Integer, default=0)
    table_number = db.Column(db.Integer, db.ForeignKey('table.table_number'), nullable=True)  # For QR code table ordering
    
    # Relationships
    items = db.relationship('OrderItem', backref='order', lazy=True)

class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    customizations = db.Column(db.JSON, nullable=True)  # Selected customizations
    unit_price = db.Column(db.Float, nullable=False)
    total_price = db.Column(db.Float, nullable=False)

class GiftCard(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True, nullable=False, default=lambda: str(uuid.uuid4())[:8].upper())
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    receiver_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    receiver_email = db.Column(db.String(120), nullable=True)  # In case receiver isn't a user yet
    amount = db.Column(db.Float, nullable=False)
    message = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expiration_date = db.Column(db.Date, nullable=True)
    is_redeemed = db.Column(db.Boolean, default=False)
    redeemed_at = db.Column(db.DateTime, nullable=True)

class Table(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    table_number = db.Column(db.Integer, unique=True, nullable=False)
    qr_code_url = db.Column(db.String(255), nullable=True)  # URL to the QR code image
    is_occupied = db.Column(db.Boolean, default=False)
    
    # Relationships
    orders = db.relationship('Order', backref='table_obj', lazy=True) 