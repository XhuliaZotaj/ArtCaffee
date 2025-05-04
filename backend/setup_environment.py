import subprocess
import sys
import os

def create_venv():
    """Create a virtual environment"""
    print("Creating virtual environment...")
    subprocess.check_call([sys.executable, "-m", "venv", "venv"])
    print("Virtual environment created successfully.")

def install_dependencies():
    """Install dependencies from requirements.txt"""
    print("Installing dependencies...")
    # Get the path to the virtual environment Python interpreter
    if os.name == 'nt':  # Windows
        python_path = os.path.join("venv", "Scripts", "python.exe")
        pip_path = os.path.join("venv", "Scripts", "pip.exe")
    else:  # Unix/Linux/Mac
        python_path = os.path.join("venv", "bin", "python")
        pip_path = os.path.join("venv", "bin", "pip")
    
    # Upgrade pip correctly
    subprocess.check_call([python_path, "-m", "pip", "install", "--upgrade", "pip"])
    # Install dependencies
    subprocess.check_call([python_path, "-m", "pip", "install", "-r", "requirements.txt"])
    print("Dependencies installed successfully.")

def download_images():
    """Download product images"""
    print("Downloading product images...")
    if os.name == 'nt':  # Windows
        python_path = os.path.join("venv", "Scripts", "python.exe")
    else:  # Unix/Linux/Mac
        python_path = os.path.join("venv", "bin", "python")
    subprocess.check_call([python_path, "create_dummy_images.py"])
    print("Product images downloaded successfully.")

def seed_database():
    """Seed the database with sample data"""
    print("Seeding database...")
    try:
        if os.name == 'nt':  # Windows
            python_path = os.path.join("venv", "Scripts", "python.exe")
        else:  # Unix/Linux/Mac
            python_path = os.path.join("venv", "bin", "python")
        subprocess.check_call([python_path, "seed_data.py"])
        print("Database seeded successfully.")
    except subprocess.CalledProcessError:
        print("Error seeding database. Please run 'python seed_data.py' manually after setup.")

def main():
    """Main function to setup the environment"""
    print("Setting up the environment for Digital Cafe...")
    
    # Check if virtual environment exists
    if not os.path.exists("venv"):
        create_venv()
    
    # Install dependencies
    install_dependencies()
    
    # Download images
    download_images()
    
    # Seed database
    seed_database()
    
    print("\nSetup completed successfully! To run the app:")
    if os.name == 'nt':  # Windows
        print("1. venv\\Scripts\\activate")
        print("2. flask run")
    else:  # Unix/Linux/Mac
        print("1. source venv/bin/activate")
        print("2. flask run")

if __name__ == "__main__":
    main() 