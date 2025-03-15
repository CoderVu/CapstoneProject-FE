import requests
import cv2
import numpy as np
from io import BytesIO
from PIL import Image

# API Key cho remove.bg (thay thế bằng API key của bạn)
REMOVE_BG_API_KEY = 'n5sgADBH81uiYPWAq8yjoHkt'

# Đường dẫn file ảnh sản phẩm (quần áo)
product_image_path = r'D:\REACJS\CapstoneProject\src\assets\images\female3.png'

# Đường dẫn lưu ảnh thử đồ sau khi ghép
output_image_path = r'D:\REACJS\CapstoneProject\src\ai\try_on3.png'


def remove_background(image_path):
    """Gửi ảnh lên remove.bg để xóa nền và thay nền trong suốt bằng màu trắng"""
    with open(image_path, 'rb') as file:
        response = requests.post(
            'https://api.remove.bg/v1.0/removebg',
            files={'image_file': file},
            data={'size': 'auto'},
            headers={'X-Api-Key': REMOVE_BG_API_KEY}
        )

    if response.status_code == requests.codes.ok:
        image = Image.open(BytesIO(response.content))

        # Nếu ảnh có alpha (nền trong suốt), thay thế nền trong suốt bằng màu trắng
        if image.mode == "RGBA":
            white_background = Image.new("RGB", image.size, (255, 255, 255))
            image = Image.alpha_composite(white_background.convert("RGBA"), image).convert("RGB")

        return image
    else:
        print("Error removing background:", response.status_code, response.text)
        return None


def main():
    """Xóa nền ảnh và lưu kết quả với nền trắng"""
    print("Đang xử lý xóa nền ảnh...")
    result_img = remove_background(product_image_path)

    if result_img:
        result_img.save(output_image_path)
        print(f"Ảnh sau khi xóa nền đã được lưu tại: {output_image_path}")
    else:
        print("Không thể xóa nền ảnh.")


if __name__ == "__main__":
    main()
