import cv2
import mediapipe as mp
import numpy as np
from PIL import Image

def analyze_photo(image_path):
    mp_pose = mp.solutions.pose
    pose = mp_pose.Pose(static_image_mode=True, min_detection_confidence=0.5)
    image = cv2.imread(image_path)
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = pose.process(image_rgb)

    if not results.pose_landmarks:
        print("No pose landmarks detected.")
        return None

    landmarks = results.pose_landmarks.landmark
    height = landmarks[mp_pose.PoseLandmark.LEFT_ANKLE].y - landmarks[mp_pose.PoseLandmark.NOSE].y
    shoulder_width = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].x - landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER].x

    height_cm = height * image.shape[0]  # Convert to cm based on image height
    shoulder_width_cm = shoulder_width * image.shape[1]  # Convert to cm based on image width

    # Draw landmarks and measurements on the image
    image_height, image_width, _ = image.shape
    nose = (int(landmarks[mp_pose.PoseLandmark.NOSE].x * image_width), int(landmarks[mp_pose.PoseLandmark.NOSE].y * image_height))
    left_ankle = (int(landmarks[mp_pose.PoseLandmark.LEFT_ANKLE].x * image_width), int(landmarks[mp_pose.PoseLandmark.LEFT_ANKLE].y * image_height))
    left_shoulder = (int(landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].x * image_width), int(landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].y * image_height))
    right_shoulder = (int(landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER].x * image_width), int(landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER].y * image_height))

    # Draw height line
    cv2.line(image, nose, left_ankle, (0, 255, 0), 2)
    cv2.circle(image, nose, 5, (0, 255, 0), -1)
    cv2.circle(image, left_ankle, 5, (0, 255, 0), -1)

    # Draw shoulder width line
    cv2.line(image, left_shoulder, right_shoulder, (255, 0, 0), 2)
    cv2.circle(image, left_shoulder, 5, (255, 0, 0), -1)
    cv2.circle(image, right_shoulder, 5, (255, 0, 0), -1)

    # Save the image with landmarks and measurements
    output_image_path = image_path.replace('.jpg', '_output.jpg')
    cv2.imwrite(output_image_path, image)

    return {
        "height_cm": height_cm,
        "shoulder_width_cm": shoulder_width_cm,
        "output_image_path": output_image_path,
        "landmarks": landmarks
    }

def overlay_clothing(user_image_path, clothing_image_path, landmarks):
    user_image = cv2.imread(user_image_path)
    clothing_image = cv2.imread(clothing_image_path, cv2.IMREAD_UNCHANGED)  # Load with alpha channel

    # Resize clothing image to fit the user's body
    left_shoulder = landmarks[mp.solutions.pose.PoseLandmark.LEFT_SHOULDER]
    right_shoulder = landmarks[mp.solutions.pose.PoseLandmark.RIGHT_SHOULDER]
    left_hip = landmarks[mp.solutions.pose.PoseLandmark.LEFT_HIP]
    right_hip = landmarks[mp.solutions.pose.PoseLandmark.RIGHT_HIP]

    shoulder_width = int((right_shoulder.x - left_shoulder.x) * user_image.shape[1])
    torso_height = int((left_hip.y - left_shoulder.y) * user_image.shape[0])

    # Debug prints to check dimensions
    print(f"Shoulder Width: {shoulder_width}")
    print(f"Torso Height: {torso_height}")

    # Ensure dimensions are valid
    if shoulder_width <= 0 or torso_height <= 0:
        print("Invalid dimensions for resizing clothing image.")
        return None

    clothing_resized = cv2.resize(clothing_image, (shoulder_width, torso_height))

    # Calculate position to overlay clothing
    x_offset = int(left_shoulder.x * user_image.shape[1])
    y_offset = int(left_shoulder.y * user_image.shape[0])

    # Overlay clothing on user image
    for y in range(clothing_resized.shape[0]):
        for x in range(clothing_resized.shape[1]):
            if clothing_resized[y, x, 3] != 0:  # Check alpha channel
                user_image[y + y_offset, x + x_offset] = clothing_resized[y, x, :3]

    output_image_path = user_image_path.replace('.jpg', '_with_clothing.jpg')
    cv2.imwrite(output_image_path, user_image)

    return output_image_path

def recommend_size(height_cm, shoulder_width_cm, brand="Nike"):
    # Mock API call to Fit Analytics or Sizely API
    # Replace with actual API endpoint and parameters
    print(f"Mock API Call: height_cm={height_cm}, shoulder_width_cm={shoulder_width_cm}, brand={brand}")
    # Simulate a response
    response = {
        "recommended_size": "M"
    }
    return response.get('recommended_size')

def main():
    user_image_path = r'D:\REACJS\CapstoneProject\src\ai\try_on2.png'
    clothing_image_path = r'D:\REACJS\CapstoneProject\src\ai\try_on.png'
    measurements = analyze_photo(user_image_path)
    if measurements:
        print(f"Height: {measurements['height_cm']} cm")
        print(f"Shoulder Width: {measurements['shoulder_width_cm']} cm")
        print(f"Output Image Path: {measurements['output_image_path']}")

        recommended_size = recommend_size(
            measurements['height_cm'], measurements['shoulder_width_cm']
        )
        if recommended_size:
            print(f"Recommended Size: {recommended_size}")

        output_image_with_clothing = overlay_clothing(
            user_image_path, clothing_image_path, measurements['landmarks']
        )
        if output_image_with_clothing:
            print(f"Output Image with Clothing Path: {output_image_with_clothing}")

if __name__ == "__main__":
    main()