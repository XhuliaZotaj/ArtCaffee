from app import app
from models import db, Product, Customization, Table
from werkzeug.security import generate_password_hash
from flask_migrate import Migrate, upgrade

# Sample data insertion script
def seed_database():
    with app.app_context():
        # Make sure database is initialized and migrated before adding data
        migrate = Migrate(app, db)
        
        # Create or update database tables
        db.create_all()
        
        # Remove existing data
        Customization.query.delete()
        Product.query.delete()
        Table.query.delete()
        db.session.commit()
        
        # Add tables
        tables = [
            Table(table_number=1, qr_code_url="/api/qr-order/tables/1/qr"),
            Table(table_number=2, qr_code_url="/api/qr-order/tables/2/qr"),
            Table(table_number=3, qr_code_url="/api/qr-order/tables/3/qr"),
            Table(table_number=4, qr_code_url="/api/qr-order/tables/4/qr"),
        ]
        
        for table in tables:
            db.session.add(table)
        db.session.commit()
        
        # Add coffee products with static image URLs
        coffee_products = [
            {
                "name": "Espresso",
                "description": "A concentrated coffee beverage brewed by forcing hot water under pressure through finely ground coffee beans.",
                "price": 2.99,
                "category": "coffee",
                "image_url": "/static/images/espresso.jpg",
                "points_value": 3,
                "customizations": [
                    {
                        "name": "Size",
                        "options": ["Single", "Double"],
                        "price_impact": {"Single": 0, "Double": 1.00}
                    },
                    {
                        "name": "Add Extra Shot",
                        "options": ["No", "Yes"],
                        "price_impact": {"No": 0, "Yes": 0.75}
                    }
                ]
            },
            {
                "name": "Cappuccino",
                "description": "An espresso-based coffee drink that is prepared with steamed milk foam.",
                "price": 3.99,
                "category": "coffee",
                "image_url": "/static/images/cappuccino.jpg",
                "points_value": 4,
                "customizations": [
                    {
                        "name": "Size",
                        "options": ["Small", "Medium", "Large"],
                        "price_impact": {"Small": 0, "Medium": 0.50, "Large": 1.00}
                    },
                    {
                        "name": "Milk Type",
                        "options": ["Regular", "Almond", "Oat", "Soy"],
                        "price_impact": {"Regular": 0, "Almond": 0.75, "Oat": 0.75, "Soy": 0.50}
                    }
                ]
            },
            {
                "name": "Latte",
                "description": "A coffee drink made with espresso and steamed milk.",
                "price": 4.50,
                "category": "coffee",
                "image_url": "/static/images/latte.jpg",
                "points_value": 5,
                "customizations": [
                    {
                        "name": "Size",
                        "options": ["Small", "Medium", "Large"],
                        "price_impact": {"Small": 0, "Medium": 0.50, "Large": 1.00}
                    },
                    {
                        "name": "Milk Type",
                        "options": ["Regular", "Almond", "Oat", "Soy"],
                        "price_impact": {"Regular": 0, "Almond": 0.75, "Oat": 0.75, "Soy": 0.50}
                    },
                    {
                        "name": "Flavor Syrup",
                        "options": ["None", "Vanilla", "Caramel", "Hazelnut"],
                        "price_impact": {"None": 0, "Vanilla": 0.50, "Caramel": 0.50, "Hazelnut": 0.50}
                    }
                ]
            }
        ]
        
        # Add tea products
        tea_products = [
            {
                "name": "Green Tea",
                "description": "A light, refreshing tea with subtle flavors.",
                "price": 2.50,
                "category": "tea",
                "image_url": "/static/images/green_tea.jpg",
                "points_value": 3,
                "customizations": [
                    {
                        "name": "Size",
                        "options": ["Small", "Medium", "Large"],
                        "price_impact": {"Small": 0, "Medium": 0.50, "Large": 1.00}
                    },
                    {
                        "name": "Add Honey",
                        "options": ["No", "Yes"],
                        "price_impact": {"No": 0, "Yes": 0.25}
                    }
                ]
            },
            {
                "name": "Chai Latte",
                "description": "A tea latte with spiced tea concentrate and steamed milk.",
                "price": 4.25,
                "category": "tea",
                "image_url": "/static/images/chai_latte.jpg",
                "points_value": 4,
                "customizations": [
                    {
                        "name": "Size",
                        "options": ["Small", "Medium", "Large"],
                        "price_impact": {"Small": 0, "Medium": 0.50, "Large": 1.00}
                    },
                    {
                        "name": "Milk Type",
                        "options": ["Regular", "Almond", "Oat", "Soy"],
                        "price_impact": {"Regular": 0, "Almond": 0.75, "Oat": 0.75, "Soy": 0.50}
                    }
                ]
            }
        ]
        
        # Add food products
        food_products = [
            {
                "name": "Croissant",
                "description": "Buttery, flaky French pastry.",
                "price": 2.50,
                "category": "food",
                "image_url": "/static/images/croissant.jpg",
                "points_value": 3,
                "customizations": []
            },
            {
                "name": "Blueberry Muffin",
                "description": "Sweet muffin loaded with juicy blueberries.",
                "price": 3.00,
                "category": "food",
                "image_url": "/static/images/blueberry_muffin.jpg",
                "points_value": 3,
                "customizations": []
            },
            {
                "name": "Avocado Toast",
                "description": "Toasted artisan bread topped with fresh avocado.",
                "price": 5.99,
                "category": "food",
                "image_url": "/static/images/avocado_toast.jpg",
                "points_value": 6,
                "customizations": [
                    {
                        "name": "Add Egg",
                        "options": ["No", "Yes"],
                        "price_impact": {"No": 0, "Yes": 1.50}
                    }
                ]
            }
        ]
        
        # Add dessert products
        dessert_products = [
            {
                "name": "Chocolate Cake",
                "description": "Rich, moist chocolate cake with frosting.",
                "price": 4.50,
                "category": "dessert",
                "image_url": "/static/images/chocolate_cake.jpg",
                "points_value": 5,
                "customizations": []
            },
            {
                "name": "Cheesecake",
                "description": "Creamy, smooth classic cheesecake.",
                "price": 4.99,
                "category": "dessert",
                "image_url": "/static/images/cheesecake.jpg",
                "points_value": 5,
                "customizations": [
                    {
                        "name": "Topping",
                        "options": ["None", "Strawberry", "Caramel", "Chocolate"],
                        "price_impact": {"None": 0, "Strawberry": 0.50, "Caramel": 0.50, "Chocolate": 0.50}
                    }
                ]
            }
        ]
        
        # Combine all products
        all_products = coffee_products + tea_products + food_products + dessert_products
        
        # Add products and their customizations
        for product_data in all_products:
            customizations_data = product_data.pop("customizations")
            
            product = Product(
                name=product_data["name"],
                description=product_data["description"],
                price=product_data["price"],
                category=product_data["category"],
                image_url=product_data["image_url"],
                points_value=product_data["points_value"],
                is_available=True
            )
            
            db.session.add(product)
            db.session.commit()  # Commit to generate ID for product
            
            # Add customizations
            for customization_data in customizations_data:
                customization = Customization(
                    product_id=product.id,
                    name=customization_data["name"],
                    options=customization_data["options"],
                    price_impact=customization_data["price_impact"]
                )
                db.session.add(customization)
            
        db.session.commit()
        print("Sample data added successfully!")

if __name__ == "__main__":
    seed_database() 