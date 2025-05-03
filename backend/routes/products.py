from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Product, Customization

products_bp = Blueprint('products', __name__)

@products_bp.route('/', methods=['GET'])
def get_products():
    category = request.args.get('category')
    
    query = Product.query
    
    if category:
        query = query.filter_by(category=category)
    
    products = query.filter_by(is_available=True).all()
    
    result = []
    for product in products:
        result.append({
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "price": product.price,
            "category": product.category,
            "image_url": product.image_url,
            "points_value": product.points_value
        })
    
    return jsonify({"products": result}), 200

@products_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = Product.query.get(product_id)
    
    if not product:
        return jsonify({"error": "Product not found"}), 404
    
    # Get customization options for the product
    customizations = Customization.query.filter_by(product_id=product.id).all()
    customization_options = []
    
    for customization in customizations:
        customization_options.append({
            "id": customization.id,
            "name": customization.name,
            "options": customization.options,
            "price_impact": customization.price_impact
        })
    
    result = {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "category": product.category,
        "image_url": product.image_url,
        "points_value": product.points_value,
        "customizations": customization_options
    }
    
    return jsonify({"product": result}), 200

# Admin routes for product management
@products_bp.route('/', methods=['POST'])
@jwt_required()  # Should add admin check in production
def create_product():
    data = request.get_json()
    
    new_product = Product(
        name=data['name'],
        description=data.get('description', ''),
        price=data['price'],
        category=data['category'],
        image_url=data.get('image_url'),
        is_available=data.get('is_available', True),
        points_value=data.get('points_value', 0)
    )
    
    db.session.add(new_product)
    db.session.commit()
    
    # Add customizations if provided
    if 'customizations' in data:
        for customization_data in data['customizations']:
            customization = Customization(
                product_id=new_product.id,
                name=customization_data['name'],
                options=customization_data['options'],
                price_impact=customization_data.get('price_impact', {})
            )
            db.session.add(customization)
        
        db.session.commit()
    
    return jsonify({
        "message": "Product created successfully",
        "product": {
            "id": new_product.id,
            "name": new_product.name,
            "price": new_product.price,
            "category": new_product.category
        }
    }), 201

@products_bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required()  # Should add admin check in production
def update_product(product_id):
    product = Product.query.get(product_id)
    
    if not product:
        return jsonify({"error": "Product not found"}), 404
    
    data = request.get_json()
    
    # Update product data
    product.name = data.get('name', product.name)
    product.description = data.get('description', product.description)
    product.price = data.get('price', product.price)
    product.category = data.get('category', product.category)
    product.image_url = data.get('image_url', product.image_url)
    product.is_available = data.get('is_available', product.is_available)
    product.points_value = data.get('points_value', product.points_value)
    
    db.session.commit()
    
    return jsonify({
        "message": "Product updated successfully",
        "product": {
            "id": product.id,
            "name": product.name,
            "price": product.price,
            "category": product.category,
            "is_available": product.is_available
        }
    }), 200

@products_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()  # Should add admin check in production
def delete_product(product_id):
    product = Product.query.get(product_id)
    
    if not product:
        return jsonify({"error": "Product not found"}), 404
    
    # Instead of deleting, mark as unavailable
    product.is_available = False
    db.session.commit()
    
    return jsonify({"message": "Product deleted successfully"}), 200 