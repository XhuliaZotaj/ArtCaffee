from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Order

loyalty_bp = Blueprint('loyalty', __name__)

@loyalty_bp.route('/points', methods=['GET'])
@jwt_required()
def get_loyalty_points():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Get point history (last 10 transactions)
    orders = Order.query.filter_by(user_id=user_id).order_by(Order.order_date.desc()).limit(10).all()
    
    point_history = []
    for order in orders:
        if order.points_earned > 0 or order.points_used > 0:
            point_history.append({
                "order_id": order.id,
                "date": order.order_date.strftime('%Y-%m-%d %H:%M:%S'),
                "points_earned": order.points_earned,
                "points_used": order.points_used
            })
    
    return jsonify({
        "loyalty_points": user.loyalty_points,
        "point_history": point_history
    }), 200

@loyalty_bp.route('/rewards', methods=['GET'])
@jwt_required()
def get_available_rewards():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Define rewards - in a real app, these would come from a database
    rewards = [
        {
            "id": 1,
            "name": "Free Coffee",
            "description": "Get a free coffee of your choice",
            "points_required": 100,
            "is_available": user.loyalty_points >= 100
        },
        {
            "id": 2,
            "name": "Free Pastry",
            "description": "Get a free pastry of your choice",
            "points_required": 150,
            "is_available": user.loyalty_points >= 150
        },
        {
            "id": 3,
            "name": "10% Off Next Order",
            "description": "Get 10% off your next order",
            "points_required": 200,
            "is_available": user.loyalty_points >= 200
        },
        {
            "id": 4,
            "name": "Free Breakfast Set",
            "description": "Get a free breakfast set",
            "points_required": 300,
            "is_available": user.loyalty_points >= 300
        }
    ]
    
    return jsonify({
        "loyalty_points": user.loyalty_points,
        "available_rewards": rewards
    }), 200

@loyalty_bp.route('/rewards/<int:reward_id>/redeem', methods=['POST'])
@jwt_required()
def redeem_reward(reward_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Define rewards mapping - in a real app, these would come from a database
    rewards = {
        1: {"name": "Free Coffee", "points": 100},
        2: {"name": "Free Pastry", "points": 150},
        3: {"name": "10% Off Next Order", "points": 200},
        4: {"name": "Free Breakfast Set", "points": 300}
    }
    
    if reward_id not in rewards:
        return jsonify({"error": "Reward not found"}), 404
    
    reward = rewards[reward_id]
    
    if user.loyalty_points < reward["points"]:
        return jsonify({"error": "Not enough loyalty points"}), 400
    
    # Deduct points
    user.loyalty_points -= reward["points"]
    db.session.commit()
    
    # In a real app, you would create a record of the redemption and generate a code
    
    return jsonify({
        "message": f"Successfully redeemed {reward['name']}",
        "remaining_points": user.loyalty_points,
        "redemption_code": "REWARD" + str(reward_id) + str(user_id) + "XYZ"  # Simple example code
    }), 200 