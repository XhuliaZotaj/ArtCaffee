from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Order
from datetime import datetime

loyalty_bp = Blueprint('loyalty', __name__)

@loyalty_bp.route('/points', methods=['GET'])
@jwt_required()
def get_loyalty_points():
    try:
        # Print headers for debugging
        print("Authorization header:", request.headers.get('Authorization', 'Missing'))
        
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({"error": "Invalid token", "success": False}), 401
            
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "User not found", "success": False}), 404
        
        # Get point history (last 10 transactions)
        orders = Order.query.filter_by(user_id=user_id).order_by(Order.order_date.desc()).limit(10).all()
        
        point_history = []
        for order in orders:
            # Only include orders with loyalty point activity
            if order.points_earned > 0 or order.points_used > 0:
                point_history.append({
                    "order_id": order.id,
                    "date": order.order_date.strftime('%Y-%m-%d %H:%M:%S'),
                    "points_earned": order.points_earned or 0,  # Ensure we never return None
                    "points_used": order.points_used or 0       # Ensure we never return None
                })
        
        # Ensure we have an integer for loyalty points
        loyalty_points = user.loyalty_points if user.loyalty_points is not None else 0
        
        # Debug message to help diagnose issues
        print(f"User {user_id} has {loyalty_points} loyalty points with {len(point_history)} history entries")
        
        return jsonify({
            "loyalty_points": loyalty_points,
            "point_history": point_history,
            "success": True
        }), 200
    except Exception as e:
        print(f"Error in get_loyalty_points: {str(e)}")
        # Provide more context in the error response
        error_message = str(e)
        error_type = type(e).__name__
        return jsonify({
            "error": "Internal server error", 
            "details": error_message,
            "error_type": error_type,
            "success": False
        }), 500

@loyalty_bp.route('/rewards', methods=['GET'])
@jwt_required()
def get_available_rewards():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Ensure we have an integer for loyalty points
        loyalty_points = user.loyalty_points if user.loyalty_points is not None else 0
        
        # Define rewards - in a real app, these would come from a database
        rewards = [
            {
                "id": 1,
                "name": "Free Coffee",
                "description": "Get a free coffee of your choice",
                "points_required": 50,
                "is_available": loyalty_points >= 50
            },
            {
                "id": 2,
                "name": "Free Pastry",
                "description": "Get a free pastry of your choice",
                "points_required": 75,
                "is_available": loyalty_points >= 75
            },
            {
                "id": 3,
                "name": "10% Off Next Order",
                "description": "Get 10% off your next order",
                "points_required": 30,
                "is_available": loyalty_points >= 30
            },
            {
                "id": 4,
                "name": "Free Breakfast Set",
                "description": "Get a free breakfast set",
                "points_required": 100,
                "is_available": loyalty_points >= 100
            }
        ]
        
        # Debug message to help diagnose issues
        print(f"User {user_id} requesting rewards with {loyalty_points} points available")
        
        return jsonify({
            "loyalty_points": loyalty_points,
            "available_rewards": rewards,
            "success": True
        }), 200
    except Exception as e:
        print(f"Error in get_available_rewards: {str(e)}")
        # Provide more context in the error response
        error_message = str(e)
        error_type = type(e).__name__
        return jsonify({
            "error": "Internal server error", 
            "details": error_message,
            "error_type": error_type,
            "success": False
        }), 500

@loyalty_bp.route('/rewards/<int:reward_id>/redeem', methods=['POST'])
@jwt_required()
def redeem_reward(reward_id):
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Define rewards mapping - in a real app, these would come from a database
        rewards = {
            1: {"name": "Free Coffee", "points": 50},
            2: {"name": "Free Pastry", "points": 75},
            3: {"name": "10% Off Next Order", "points": 30},
            4: {"name": "Free Breakfast Set", "points": 100}
        }
        
        if reward_id not in rewards:
            return jsonify({"error": "Reward not found"}), 404
        
        reward = rewards[reward_id]
        
        # Ensure we have an integer for loyalty points
        loyalty_points = user.loyalty_points if user.loyalty_points is not None else 0
        
        if loyalty_points < reward["points"]:
            return jsonify({"error": "Not enough loyalty points"}), 400
        
        # Generate redemption code
        redemption_code = "REWARD" + str(reward_id) + str(user_id) + str(int(datetime.now().timestamp()))[-6:]
        
        # Debug message
        print(f"User {user_id} redeeming reward {reward_id} ({reward['name']}) for {reward['points']} points")
        
        # Deduct points
        user.loyalty_points = loyalty_points - reward["points"]
        
        # Create a point history record - we'll use an order with order_id=0 to indicate a redemption
        redemption_order = Order(
            user_id=user_id,
            status='completed',
            total_amount=0,
            points_earned=0,
            points_used=reward["points"]
        )
        
        db.session.add(redemption_order)
        db.session.commit()
        
        return jsonify({
            "message": f"Successfully redeemed {reward['name']}",
            "remaining_points": user.loyalty_points,
            "redemption_code": redemption_code,
            "redemption_details": {
                "reward_name": reward["name"],
                "points_used": reward["points"],
                "date": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            },
            "success": True
        }), 200
    except Exception as e:
        print(f"Error in redeem_reward: {str(e)}")
        db.session.rollback()
        # Provide more context in the error response
        error_message = str(e)
        error_type = type(e).__name__
        return jsonify({
            "error": "Internal server error", 
            "details": error_message,
            "error_type": error_type,
            "success": False
        }), 500

# Add CORS test endpoint
@loyalty_bp.route('/cors-test', methods=['GET', 'OPTIONS'])
def cors_test():
    """Special endpoint to test CORS configuration"""
    if request.method == 'OPTIONS':
        # Just return empty response for preflight
        return '', 200
    
    # Print headers to server console for debugging
    print("Request headers:")
    for header, value in request.headers:
        print(f"  {header}: {value}")
    
    # Return headers in response for client-side debugging
    headers_dict = {h[0]: h[1] for h in request.headers}
    
    return jsonify({
        "message": "CORS test successful",
        "request_headers": headers_dict,
        "origin": request.headers.get('Origin', 'No origin header'),
        "success": True
    }), 200 