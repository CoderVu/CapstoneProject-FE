import cv2
import mediapipe as mp
import numpy as np
import matplotlib.pyplot as plt

# ✅ Load ảnh người và ảnh quần áo (đổi link nếu cần)
user_img = cv2.imread(r"D:\REACJS\CapstoneProject\src\ai\a_output.jpg")
cloth_img = cv2.imread(r"D:\REACJS\CapstoneProject\src\ai\try_on3.png")

# Chuyển ảnh về 3 kênh nếu có 4 kênh (RGBA)
if user_img.shape[-1] == 4:
    user_img = cv2.cvtColor(user_img, cv2.COLOR_RGBA2RGB)
if cloth_img.shape[-1] == 4:
    cloth_img = cv2.cvtColor(cloth_img, cv2.COLOR_RGBA2RGB)

# Khởi tạo Mediapipe Pose và Segmentation
mp_pose = mp.solutions.pose
pose = mp_pose.Pose()
mp_selfie_segmentation = mp.solutions.selfie_segmentation
segmentation = mp_selfie_segmentation.SelfieSegmentation(model_selection=1)

# Chuyển ảnh sang RGB và xử lý với Mediapipe
user_rgb = cv2.cvtColor(user_img, cv2.COLOR_BGR2RGB)
results_pose = pose.process(user_rgb)
results_segmentation = segmentation.process(user_rgb)

# Nếu nhận diện được cơ thể
if results_pose.pose_landmarks and results_segmentation.segmentation_mask is not None:
    lm = results_pose.pose_landmarks.landmark
    left_shoulder = int(lm[mp_pose.PoseLandmark.LEFT_SHOULDER].x * user_img.shape[1])
    right_shoulder = int(lm[mp_pose.PoseLandmark.RIGHT_SHOULDER].x * user_img.shape[1])
    top = int(lm[mp_pose.PoseLandmark.NOSE].y * user_img.shape[0])
    waist = int(lm[mp_pose.PoseLandmark.LEFT_HIP].y * user_img.shape[0])

    # Đảm bảo left_shoulder nhỏ hơn right_shoulder
    if left_shoulder > right_shoulder:
        left_shoulder, right_shoulder = right_shoulder, left_shoulder

    # Tính kích thước áo (tăng kích thước áo)
    width = max(100, right_shoulder - left_shoulder + 50)
    height = max(100, waist - top + 30)

    # In ra kích thước vai và chiều cao
    print(f"Shoulder Width: {right_shoulder - left_shoulder} pixels")
    print(f"Height: {waist - top} pixels")

    # Resize áo theo kích thước cơ thể (điều chỉnh tỷ lệ resize)
    cloth_resized = cv2.resize(cloth_img, (int(width * 1.2), int(height * 1.1)))

    # Vị trí dán áo (điều chỉnh vị trí dán áo)
    x1 = left_shoulder - 25
    x2 = left_shoulder + cloth_resized.shape[1]
    y1 = top
    y2 = top + cloth_resized.shape[0]

    # Đảm bảo vị trí áo nằm trong phạm vi ảnh người
    x1 = max(0, x1)
    y1 = max(0, y1)
    x2 = min(user_img.shape[1], x2)
    y2 = min(user_img.shape[0], y2)

    # Tạo mask cho áo
    lower_white = np.array([200, 200, 200])
    upper_white = np.array([255, 255, 255])
    mask = cv2.inRange(cloth_resized, lower_white, upper_white)
    mask_inv = cv2.bitwise_not(mask)

    # Lấy phần áo không phải nền
    cloth_fg = cv2.bitwise_and(cloth_resized, cloth_resized, mask=mask_inv)

    # Lấy mask segmentation
    segmentation_mask = np.where(results_segmentation.segmentation_mask > 0.5, 255, 0).astype(np.uint8)
    segmentation_mask_rgb = cv2.cvtColor(segmentation_mask, cv2.COLOR_GRAY2RGB)

    # Lấy phần thân người
    user_body = cv2.bitwise_and(user_img, segmentation_mask_rgb)

    # Resize mask to match the region in user_body
    mask_resized = cv2.resize(mask, (x2 - x1, y2 - y1))
    mask_inv_resized = cv2.resize(mask_inv, (x2 - x1, y2 - y1))

    # Lấy phần nền của người
    user_bg = user_img[y1:y2, x1:x2]
    user_bg_masked = cv2.bitwise_and(user_bg, user_bg, mask=mask_resized)

    # Resize cloth_fg to match user_bg_masked
    cloth_fg_resized = cv2.resize(cloth_fg, (user_bg_masked.shape[1], user_bg_masked.shape[0]))

    # Kết hợp áo và nền người
    result = cv2.add(cloth_fg_resized, user_bg_masked)

    # Thay thế vùng áo trên ảnh người
    user_img[y1:y2, x1:x2] = result

# Hiển thị ảnh kết quả
plt.imshow(cv2.cvtColor(user_img, cv2.COLOR_BGR2RGB))
plt.axis("off")
plt.show()