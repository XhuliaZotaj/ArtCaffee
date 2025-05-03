from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, GiftCard, User
from datetime import datetime, timedelta
import uuid

gift_cards_bp = Blueprint('gift_cards', __name__)

@gift_cards_bp.route('/', methods=['POST'])
@jwt_required()
def create_gift_card():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate amount
    if not data.get('amount') or float(data['amount']) <= 0:
        return jsonify({"error": "Gift card amount must be greater than 0"}), 400
    
    # Validate receiver
    receiver_email = data.get('receiver_email')
    if not receiver_email:
        return jsonify({"error": "Receiver email is required"}), 400
    
    # Check if receiver is a registered user
    receiver = User.query.filter_by(email=receiver_email).first()
    receiver_id = receiver.id if receiver else None
    
    # Create gift card
    new_gift_card = GiftCard(
        sender_id=user_id,
        receiver_id=receiver_id,
        receiver_email=receiver_email,
        amount=float(data['amount']),
        message=data.get('message', ''),
        expiration_date=datetime.utcnow() + timedelta(days=365)  # 1 year expiration
    )
    
    db.session.add(new_gift_card)
    db.session.commit()
    
    return jsonify({
        "message": "Gift card created successfully",
        "gift_card": {
            "id": new_gift_card.id,
            "code": new_gift_card.code,
            "amount": new_gift_card.amount,
            "receiver_email": new_gift_card.receiver_email,
            "expiration_date": new_gift_card.expiration_date.strftime('%Y-%m-%d')
        }
    }), 201

@gift_cards_bp.route('/', methods=['GET'])
@jwt_required()
def get_user_gift_cards():
    user_id = get_jwt_identity()
    
    # Get gift cards sent by the user
    sent_gift_cards = GiftCard.query.filter_by(sender_id=user_id).all()
    
    # Get gift cards received by the user
    received_gift_cards = GiftCard.query.filter_by(receiver_id=user_id).all()
    
    sent_result = []
    for gift_card in sent_gift_cards:
        sent_result.append({
            "id": gift_card.id,
            "code": gift_card.code,
            "receiver_email": gift_card.receiver_email,
            "amount": gift_card.amount,
            "message": gift_card.message,
            "created_at": gift_card.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            "expiration_date": gift_card.expiration_date.strftime('%Y-%m-%d'),
            "is_redeemed": gift_card.is_redeemed
        })
    
    received_result = []
    for gift_card in received_gift_cards:
        sender = User.query.get(gift_card.sender_id)
        received_result.append({
            "id": gift_card.id,
            "code": gift_card.code,
            "sender_name": f"{sender.first_name} {sender.last_name}" if sender else "Unknown",
            "sender_email": sender.email if sender else "Unknown",
            "amount": gift_card.amount,
            "message": gift_card.message,
            "created_at": gift_card.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            "expiration_date": gift_card.expiration_date.strftime('%Y-%m-%d'),
            "is_redeemed": gift_card.is_redeemed
        })
    
    return jsonify({
        "sent_gift_cards": sent_result,
        "received_gift_cards": received_result
    }), 200

@gift_cards_bp.route('/redeem', methods=['POST'])
@jwt_required()
def redeem_gift_card():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data.get('code'):
        return jsonify({"error": "Gift card code is required"}), 400
    
    gift_card = GiftCard.query.filter_by(code=data['code']).first()
    
    if not gift_card:
        return jsonify({"error": "Gift card not found"}), 404
    
    if gift_card.is_redeemed:
        return jsonify({"error": "Gift card has already been redeemed"}), 400
    
    if gift_card.expiration_date < datetime.utcnow().date():
        return jsonify({"error": "Gift card has expired"}), 400
    
    # Mark gift card as redeemed
    gift_card.is_redeemed = True
    gift_card.redeemed_at = datetime.utcnow()
    
    # Associate gift card with the user if not already
    if not gift_card.receiver_id:
        gift_card.receiver_id = user_id
    
    db.session.commit()
    
    return jsonify({
        "message": "Gift card redeemed successfully",
        "gift_card": {
            "id": gift_card.id,
            "amount": gift_card.amount,
            "redeemed_at": gift_card.redeemed_at.strftime('%Y-%m-%d %H:%M:%S')
        }
    }), 200 