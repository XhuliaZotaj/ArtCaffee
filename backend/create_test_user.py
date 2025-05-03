from app import app
from models import db, User
from werkzeug.security import generate_password_hash

def create_test_user():
    with app.app_context():
        # Check if user already exists
        if User.query.filter_by(email="test@example.com").first():
            print("Test user already exists")
            return
            
        # Create test user
        test_user = User(
            username="testuser",
            email="test@example.com",
            password=generate_password_hash("password"),
            first_name="Test",
            last_name="User",
            loyalty_points=100
        )
        
        db.session.add(test_user)
        db.session.commit()
        print("Test user created successfully!")
        print("Email: test@example.com")
        print("Password: password")

if __name__ == "__main__":
    create_test_user() 