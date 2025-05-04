import os
import requests
from PIL import Image
from io import BytesIO

# Create static/images directory if it doesn't exist
images_dir = 'static/images'
os.makedirs(images_dir, exist_ok=True)

# Dictionary mapping products to stable image URLs
image_urls = {
    'espresso.jpg': 'https://i.pinimg.com/736x/f5/b2/06/f5b206a24f87c58f1c3af87ce2f8c0a2.jpg',
    'cappuccino.jpg': 'https://i.pinimg.com/736x/0a/2e/a5/0a2ea56614352399d164038ec22168fd.jpg',
    'latte.jpg': 'https://i.pinimg.com/736x/1d/70/19/1d70193626ab481f037d9602970872ba.jpg', 
    'green_tea.jpg': 'https://i.pinimg.com/736x/b4/74/e7/b474e7a6eeda43ac5dbb4b7c389eddf6.jpg',
    'chai_latte.jpg': 'https://i.pinimg.com/736x/54/15/3a/54153a12b79f27f83c6dc1b42279e6c8.jpg',
    'croissant.jpg': 'https://i.pinimg.com/736x/1b/74/c4/1b74c479c2a1b5941cdbb9d860b82047.jpg',
    'blueberry_muffin.jpg': 'https://i.pinimg.com/736x/e6/3d/75/e63d75a1e436a22c411d3aa809805871.jpg',
    'avocado_toast.jpg': 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    'chocolate_cake.jpg': 'https://i.pinimg.com/736x/ab/7a/26/ab7a265c329704306279d0d23a233ec6.jpg',
    'cheesecake.jpg': 'https://images.unsplash.com/photo-1567171466295-4afa63d45416?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    'coffee.jpg': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    'tea.jpg': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    'food.jpg': 'https://images.unsplash.com/photo-1513442542250-854d436a73f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    'dessert.jpg': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    'default.jpg': 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400'
}

def download_and_save_image(filename, url):
    try:
        # Download image from URL
        response = requests.get(url, timeout=10)
        response.raise_for_status()  # Raise exception for 4XX/5XX status
        
        # Open the image using PIL
        img = Image.open(BytesIO(response.content))
        
        # Save the image
        output_path = os.path.join(images_dir, filename)
        img.save(output_path)
        print(f"Downloaded and saved {output_path}")
        return True
    except Exception as e:
        print(f"Error downloading {filename} from {url}: {e}")
        return False

# Download all the images
success_count = 0
for filename, url in image_urls.items():
    if download_and_save_image(filename, url):
        success_count += 1

print(f"Downloaded {success_count} of {len(image_urls)} images successfully!") 