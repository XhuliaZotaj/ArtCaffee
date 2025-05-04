from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Order, OrderItem, Product, User
from datetime import datetime

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/', methods=['POST'])
@jwt_required()
def create_order():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate items
    if not data.get('items') or len(data['items']) == 0:
        return jsonify({"error": "Order must contain at least one item"}), 400
    
    # Calculate total amount and validate items
    total_amount = 0
    order_items = []
    points_earned = 0
    
    for item_data in data['items']:
        product = Product.query.get(item_data['product_id'])
        
        if not product or not product.is_available:
            return jsonify({"error": f"Product with id {item_data['product_id']} not available"}), 400
        
        quantity = item_data.get('quantity', 1)
        unit_price = product.price
        
        # Apply customizations if any
        customizations = item_data.get('customizations', {})
        for customization_id, option in customizations.items():
            # Here you would look up the customization and adjust price
            # For simplicity, we'll just use the provided data
            pass
        
        item_total = unit_price * quantity
        total_amount += item_total
        
        # Calculate loyalty points for this item based on the product's points_value
        if product.points_value > 0:
            item_points = product.points_value * quantity
            points_earned += item_points
        
        order_items.append({
            'product_id': product.id,
            'quantity': quantity,
            'customizations': customizations,
            'unit_price': unit_price,
            'total_price': item_total
        })
    
    # Apply loyalty points if requested
    points_used = 0
    user = User.query.get(user_id)
    
    if data.get('use_points', False) and user.loyalty_points > 0:
        # Simple conversion: 10 points = $1 off
        points_to_use = min(user.loyalty_points, int(total_amount * 10))
        discount = points_to_use / 10
        
        if discount > 0:
            total_amount -= discount
            points_used = points_to_use
            user.loyalty_points -= points_used
    
    # Create order
    new_order = Order(
        user_id=user_id,
        status='pending',
        total_amount=total_amount,
        points_earned=points_earned,
        points_used=points_used,
        table_number=data.get('table_number')
    )
    
    db.session.add(new_order)
    db.session.flush()  # Get the order ID without committing
    
    # Create order items
    for item in order_items:
        new_item = OrderItem(
            order_id=new_order.id,
            product_id=item['product_id'],
            quantity=item['quantity'],
            customizations=item['customizations'],
            unit_price=item['unit_price'],
            total_price=item['total_price']
        )
        db.session.add(new_item)
    
    # Add loyalty points
    if points_earned > 0:
        user.loyalty_points += points_earned
        
    # Log loyalty points activity
    print(f"User {user_id} earned {points_earned} points and used {points_used} points. New balance: {user.loyalty_points}")
    
    db.session.commit()
    
    return jsonify({
        "message": "Order created successfully",
        "order": {
            "id": new_order.id,
            "status": new_order.status,
            "total_amount": new_order.total_amount,
            "points_earned": new_order.points_earned,
            "points_used": new_order.points_used,
            "order_date": new_order.order_date.strftime('%Y-%m-%d %H:%M:%S')
        }
    }), 201

@orders_bp.route('/', methods=['GET'])
@jwt_required()
def get_user_orders():
    user_id = get_jwt_identity()
    
    orders = Order.query.filter_by(user_id=user_id).order_by(Order.order_date.desc()).all()
    
    result = []
    for order in orders:
        order_items = []
        for item in order.items:
            product = Product.query.get(item.product_id)
            order_items.append({
                "product_name": product.name if product else "Unknown",
                "quantity": item.quantity,
                "customizations": item.customizations,
                "unit_price": item.unit_price,
                "total_price": item.total_price
            })
        
        result.append({
            "id": order.id,
            "status": order.status,
            "total_amount": order.total_amount,
            "points_earned": order.points_earned,
            "points_used": order.points_used,
            "order_date": order.order_date.strftime('%Y-%m-%d %H:%M:%S'),
            "items": order_items
        })
    
    return jsonify({"orders": result}), 200

@orders_bp.route('/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    user_id = get_jwt_identity()
    
    order = Order.query.filter_by(id=order_id, user_id=user_id).first()
    
    if not order:
        return jsonify({"error": "Order not found"}), 404
    
    order_items = []
    for item in order.items:
        product = Product.query.get(item.product_id)
        order_items.append({
            "product_name": product.name if product else "Unknown",
            "product_id": item.product_id,
            "quantity": item.quantity,
            "customizations": item.customizations,
            "unit_price": item.unit_price,
            "total_price": item.total_price
        })
    
    result = {
        "id": order.id,
        "status": order.status,
        "total_amount": order.total_amount,
        "points_earned": order.points_earned,
        "points_used": order.points_used,
        "order_date": order.order_date.strftime('%Y-%m-%d %H:%M:%S'),
        "table_number": order.table_number,
        "items": order_items
    }
    
    return jsonify({"order": result}), 200

# Admin routes for order management
@orders_bp.route('/admin/all', methods=['GET'])
@jwt_required()  # Should add admin check in production
def get_all_orders():
    status = request.args.get('status')
    
    query = Order.query
    
    if status:
        query = query.filter_by(status=status)
    
    orders = query.order_by(Order.order_date.desc()).all()
    
    result = []
    for order in orders:
        result.append({
            "id": order.id,
            "user_id": order.user_id,
            "status": order.status,
            "total_amount": order.total_amount,
            "order_date": order.order_date.strftime('%Y-%m-%d %H:%M:%S'),
            "table_number": order.table_number
        })
    
    return jsonify({"orders": result}), 200

@orders_bp.route('/<int:order_id>/status', methods=['PUT'])
@jwt_required()  # Should add admin check in production
def update_order_status(order_id):
    order = Order.query.get(order_id)
    
    if not order:
        return jsonify({"error": "Order not found"}), 404
    
    data = request.get_json()
    
    if 'status' not in data:
        return jsonify({"error": "Status is required"}), 400
    
    valid_statuses = ['pending', 'processing', 'completed', 'cancelled']
    if data['status'] not in valid_statuses:
        return jsonify({"error": f"Status must be one of: {', '.join(valid_statuses)}"}), 400
    
    order.status = data['status']
    db.session.commit()
    
    return jsonify({
        "message": "Order status updated successfully",
        "order": {
            "id": order.id,
            "status": order.status
        }
    }), 200 