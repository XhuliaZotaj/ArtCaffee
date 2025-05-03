from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Table, Order
import qrcode
from io import BytesIO
import os

qr_order_bp = Blueprint('qr_order', __name__)

@qr_order_bp.route('/tables', methods=['GET'])
@jwt_required()  # Should add admin check in production
def get_tables():
    tables = Table.query.all()
    
    result = []
    for table in tables:
        result.append({
            "id": table.id,
            "table_number": table.table_number,
            "qr_code_url": table.qr_code_url,
            "is_occupied": table.is_occupied
        })
    
    return jsonify({"tables": result}), 200

@qr_order_bp.route('/tables', methods=['POST'])
@jwt_required()  # Should add admin check in production
def create_table():
    data = request.get_json()
    
    if not data.get('table_number'):
        return jsonify({"error": "Table number is required"}), 400
    
    # Check if table already exists
    if Table.query.filter_by(table_number=data['table_number']).first():
        return jsonify({"error": "Table already exists"}), 400
    
    new_table = Table(
        table_number=data['table_number'],
        is_occupied=data.get('is_occupied', False)
    )
    
    db.session.add(new_table)
    db.session.commit()
    
    # Generate QR code for the table
    qr_code_url = f"/api/qr-order/tables/{new_table.id}/qr"
    new_table.qr_code_url = qr_code_url
    db.session.commit()
    
    return jsonify({
        "message": "Table created successfully",
        "table": {
            "id": new_table.id,
            "table_number": new_table.table_number,
            "qr_code_url": new_table.qr_code_url
        }
    }), 201

@qr_order_bp.route('/tables/<int:table_id>/qr', methods=['GET'])
def get_table_qr(table_id):
    table = Table.query.get(table_id)
    
    if not table:
        return jsonify({"error": "Table not found"}), 404
    
    # Generate QR code with the frontend URL
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    qr_data = f"{frontend_url}/table/{table.table_number}"
    
    img = qrcode.make(qr_data)
    img_io = BytesIO()
    img.save(img_io, 'PNG')
    img_io.seek(0)
    
    return send_file(img_io, mimetype='image/png')

@qr_order_bp.route('/tables/<int:table_id>/status', methods=['PUT'])
@jwt_required()  # Should add admin check in production
def update_table_status(table_id):
    table = Table.query.get(table_id)
    
    if not table:
        return jsonify({"error": "Table not found"}), 404
    
    data = request.get_json()
    
    if 'is_occupied' not in data:
        return jsonify({"error": "is_occupied status is required"}), 400
    
    table.is_occupied = data['is_occupied']
    db.session.commit()
    
    return jsonify({
        "message": "Table status updated successfully",
        "table": {
            "id": table.id,
            "table_number": table.table_number,
            "is_occupied": table.is_occupied
        }
    }), 200

@qr_order_bp.route('/tables/<int:table_id>/orders', methods=['GET'])
@jwt_required()  # Should add admin check in production
def get_table_orders(table_id):
    table = Table.query.get(table_id)
    
    if not table:
        return jsonify({"error": "Table not found"}), 404
    
    # Get active orders for the table
    orders = Order.query.filter_by(table_number=table.table_number).filter(
        Order.status.in_(['pending', 'processing'])
    ).all()
    
    result = []
    for order in orders:
        result.append({
            "id": order.id,
            "user_id": order.user_id,
            "status": order.status,
            "total_amount": order.total_amount,
            "order_date": order.order_date.strftime('%Y-%m-%d %H:%M:%S')
        })
    
    return jsonify({"orders": result}), 200

@qr_order_bp.route('/validate/<int:table_number>', methods=['GET'])
def validate_table(table_number):
    table = Table.query.filter_by(table_number=table_number).first()
    
    if not table:
        return jsonify({"error": "Invalid table"}), 404
    
    return jsonify({
        "table_number": table.table_number,
        "is_valid": True
    }), 200 