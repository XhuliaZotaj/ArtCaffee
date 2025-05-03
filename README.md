# Digital Café App

A modern coffee shop application that enhances the customer experience through digital features.

## Features

- 🎁 **Send a Gift Card**: Send digital gift cards to friends/family with personalized messages
- ☕ **Custom Coffee Orders**: Customize your coffee or choose from other café products
- 🎯 **Loyalty Program**: Earn points with every purchase and redeem them for free items
- 📱 **Scan & Order at the Table**: Scan a QR code at your table to order directly from your seat

## Tech Stack

### Backend

- Python with Flask
- Flask-SQLAlchemy for ORM
- JWT Authentication
- QR Code Generation
- RESTful API Design

### Frontend

- React with TypeScript
- Material UI for components and styling
- React Router for navigation
- Formik for form management
- Axios for API calls
- Context API for state management

## Project Structure

```
digital-cafe-app/
├── backend/                # Flask backend
│   ├── app.py              # Main application file
│   ├── models.py           # Database models
│   ├── requirements.txt    # Python dependencies
│   └── routes/             # API endpoints
│       ├── auth.py         # Authentication routes
│       ├── products.py     # Product management
│       ├── orders.py       # Order processing
│       ├── loyalty.py      # Loyalty program
│       ├── gift_cards.py   # Gift card management
│       └── qr_order.py     # Table QR ordering
│
└── frontend/              # React TypeScript frontend
    ├── public/            # Static files
    ├── src/               # Source code
    │   ├── components/    # Reusable components
    │   ├── contexts/      # Context providers
    │   ├── pages/         # Page components
    │   ├── hooks/         # Custom hooks
    │   ├── types/         # TypeScript types
    │   ├── utils/         # Utility functions
    │   ├── App.tsx        # Main App component
    │   └── index.tsx      # Entry point
    ├── package.json       # Node dependencies
    └── tsconfig.json      # TypeScript configuration
```

## Getting Started

### Backend Setup

1. Navigate to the backend directory:

   ```
   cd digital-cafe-app/backend
   ```

2. Create a virtual environment:

   ```
   python -m venv venv
   ```

3. Activate the virtual environment:

   - Windows: `venv\Scripts\activate`
   - MacOS/Linux: `source venv/bin/activate`

4. Install dependencies:

   ```
   pip install -r requirements.txt
   ```

5. The `.env` file should already be created with the following variables:

   ```
   FLASK_APP=app.py
   FLASK_ENV=development
   DATABASE_URI=sqlite:///digital_cafe.db
   JWT_SECRET_KEY=super-secret-key-change-in-production
   FRONTEND_URL=http://localhost:3000
   ```

6. Initialize the database and run the server:

   ```
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   flask run
   ```

   The backend server will start on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:

   ```
   cd digital-cafe-app/frontend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the development server:

   ```
   npm start
   ```

4. Access the application at http://localhost:3000

## Sample Data

For testing purposes, you might want to add some sample data to the database. Here's a simple example of how to do it:

```python
# Run this from the Python console after activating the virtual environment
from app import app
from models import db, User, Product, Customization, Table
from werkzeug.security import generate_password_hash
from datetime import datetime

# Create the database tables
with app.app_context():
    # Add a test user
    test_user = User(
        username="testuser",
        email="test@example.com",
        password=generate_password_hash("password"),
        first_name="Test",
        last_name="User",
        loyalty_points=100
    )
    db.session.add(test_user)

    # Add some products
    products = [
        Product(name="Espresso", description="Strong coffee", price=2.99, category="coffee", points_value=3),
        Product(name="Cappuccino", description="Espresso with steamed milk", price=3.99, category="coffee", points_value=4),
        Product(name="Latte", description="Espresso with lots of milk", price=4.50, category="coffee", points_value=5),
        Product(name="Croissant", description="Buttery pastry", price=2.50, category="food", points_value=3),
        Product(name="Muffin", description="Blueberry muffin", price=3.00, category="food", points_value=3),
    ]
    for product in products:
        db.session.add(product)

    # Add customizations for coffee
    customizations = [
        Customization(
            product_id=1,  # Espresso
            name="Size",
            options=["Small", "Medium", "Large"],
            price_impact={"Small": 0, "Medium": 0.50, "Large": 1.00}
        ),
        Customization(
            product_id=2,  # Cappuccino
            name="Milk Type",
            options=["Regular", "Almond", "Oat", "Soy"],
            price_impact={"Regular": 0, "Almond": 0.75, "Oat": 0.75, "Soy": 0.50}
        ),
        Customization(
            product_id=2,  # Cappuccino
            name="Strength",
            options=["Regular", "Extra Shot", "Decaf"],
            price_impact={"Regular": 0, "Extra Shot": 1.00, "Decaf": 0}
        ),
    ]
    for customization in customizations:
        db.session.add(customization)

    # Add some tables
    tables = [
        Table(table_number=1, qr_code_url="/api/qr-order/tables/1/qr"),
        Table(table_number=2, qr_code_url="/api/qr-order/tables/2/qr"),
        Table(table_number=3, qr_code_url="/api/qr-order/tables/3/qr"),
    ]
    for table in tables:
        db.session.add(table)

    db.session.commit()
    print("Sample data added successfully!")
```

## API Documentation

The backend exposes the following API endpoints:

- **Authentication**

  - POST `/api/auth/register`: Register a new user
  - POST `/api/auth/login`: Login a user
  - GET `/api/auth/profile`: Get user profile

- **Products**

  - GET `/api/products`: Get all products
  - GET `/api/products/:id`: Get a specific product
  - POST `/api/products`: Create a product (admin)
  - PUT `/api/products/:id`: Update a product (admin)
  - DELETE `/api/products/:id`: Delete a product (admin)

- **Orders**

  - GET `/api/orders`: Get user orders
  - GET `/api/orders/:id`: Get a specific order
  - POST `/api/orders`: Create an order
  - PUT `/api/orders/:id/status`: Update order status (admin)

- **Loyalty**

  - GET `/api/loyalty/points`: Get user loyalty points
  - GET `/api/loyalty/rewards`: Get available rewards
  - POST `/api/loyalty/rewards/:id/redeem`: Redeem a reward

- **Gift Cards**

  - GET `/api/gift-cards`: Get user gift cards
  - POST `/api/gift-cards`: Create a gift card
  - POST `/api/gift-cards/redeem`: Redeem a gift card

- **Table QR Ordering**
  - GET `/api/qr-order/tables`: Get all tables (admin)
  - POST `/api/qr-order/tables`: Create a table (admin)
  - GET `/api/qr-order/tables/:id/qr`: Get table QR code
  - PUT `/api/qr-order/tables/:id/status`: Update table status (admin)
  - GET `/api/qr-order/validate/:tableNumber`: Validate a table

## License

MIT License
