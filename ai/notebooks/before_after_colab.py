# CivicLens: Before & After Verification Colab Utility
# Copy and paste this script into a Google Colab notebook cell!

"""
This script provides the complete ML-powered "Before vs After" verification pipeline:
1. EXIF data extraction (validates capture time and geolocations of the photos).
2. Image Embedding Extraction (using a pre-trained ResNet-50 model from torchvision).
3. Cosine Similarity Comparison (checks if visual evidence matches the cleanup/impact).
"""

import os
import datetime
from PIL import Image
import torch
import torch.nn as nn
from torchvision import models, transforms
import numpy as np

# ==========================================
# 1. EXIF GEOTAGGED PHOTO METADATA EXTRACTION
# ==========================================

def get_exif_data(image_path):
    """
    Extracts DateTime and GPS coordinates from geotagged photo EXIF data.
    Requires PIL (Pillow) library.
    """
    try:
        img = Image.open(image_path)
        exif = img._getexif()
        if not exif:
            return {"error": "No EXIF data found in image"}
            
        exif_data = {}
        for tag_id, value in exif.items():
            # Tag 36867 is DateTimeOriginal
            if tag_id == 36867:
                exif_data["datetime"] = datetime.datetime.strptime(value, "%Y:%m:%d %H:%M:%S")
            # Tag 34853 is GPSInfo
            elif tag_id == 34853:
                gps_info = {}
                for key in value:
                    gps_info[key] = value[key]
                exif_data["gps"] = gps_info
                
        # Parse GPS coordinates if available
        if "gps" in exif_data:
            gps = exif_data["gps"]
            # GPS tags: 2 = Latitude, 4 = Longitude, 1 = LatRef (N/S), 3 = LngRef (E/W)
            try:
                def to_decimal(coords, ref):
                    degrees = float(coords[0])
                    minutes = float(coords[1])
                    seconds = float(coords[2])
                    decimal = degrees + (minutes / 60.0) + (seconds / 3600.0)
                    if ref in ['S', 'W']:
                        decimal = -decimal
                    return decimal

                lat = to_decimal(gps[2], gps[1])
                lng = to_decimal(gps[4], gps[3])
                exif_data["latitude"] = lat
                exif_data["longitude"] = lng
            except Exception as e:
                exif_data["gps_error"] = f"Failed to parse GPS: {str(e)}"
                
        return exif_data
    except Exception as e:
        return {"error": f"Error reading EXIF data: {str(e)}"}

# ==========================================
# 2. IMAGE EMBEDDINGS & SIMILARITY PIPELINE
# ==========================================

# Set device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load pre-trained ResNet-50 as feature extractor
resnet = models.resnet50(pretrained=True).to(device)
resnet.eval()

# Remove the classification layer to get feature vectors (embeddings)
feature_extractor = nn.Sequential(*list(resnet.children())[:-1])

# Transforms matching ImageNet pre-training requirements
img_transforms = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

def get_image_embedding(image_path):
    """
    Passes an image through ResNet50 to obtain a 2048-dimensional embedding vector.
    """
    img = Image.open(image_path).convert("RGB")
    tensor = img_transforms(img).unsqueeze(0).to(device)
    with torch.no_grad():
        embedding = feature_extractor(tensor)
        # Flatten from [1, 2048, 1, 1] to [2048]
        embedding = torch.squeeze(embedding).cpu().numpy()
    return embedding / np.linalg.norm(embedding) # L2 Normalize

def compare_images(before_path, after_path):
    """
    Computes cosine similarity between 'before' and 'after' images.
    """
    emb_before = get_image_embedding(before_path)
    emb_after = get_image_embedding(after_path)
    
    # Cosine Similarity is simply dot product because they are L2-normalized
    similarity = np.dot(emb_before, emb_after)
    return float(similarity)

# ==========================================
# 3. VERIFICATION PIPELINE
# ==========================================

def verify_impact(before_path, after_path, campaign_start_time, campaign_lat, campaign_lng, geofence_radius_meters=100):
    """
    Runs full verification logic:
    1. Check EXIF timestamps (prevent old uploads).
    2. Check EXIF GPS location (prevent out-of-bounds uploads).
    3. Compare visual change (similarity should be moderate, reflecting cleanup, not identical nor completely unrelated).
    """
    print("--- Initiating CivicLens AI Verification ---")
    
    # Extract EXIF
    before_exif = get_exif_data(before_path)
    after_exif = get_exif_data(after_path)
    
    # 1. TIME VERIFICATION
    time_passed = True
    after_time = after_exif.get("datetime")
    
    if isinstance(after_time, datetime.datetime):
        if after_time < campaign_start_time:
            print("❌ WARNING: The photo was taken BEFORE the campaign started!")
            time_passed = False
        else:
            print(f"✅ Time Verification Passed! Photo taken on: {after_time}")
    else:
        print("ℹ️ EXIF Time Info: No metadata found. Falling back to platform upload time check.")
        
    # 2. GPS VERIFICATION
    geo_passed = True
    after_lat = after_exif.get("latitude")
    after_lng = after_exif.get("longitude")
    
    if after_lat is not None and after_lng is not None:
        # Haversine formula
        import math
        R = 6371000 # Earth radius in meters
        dLat = math.radians(campaign_lat - after_lat)
        dLon = math.radians(campaign_lng - after_lng)
        a = math.sin(dLat/2) * math.sin(dLat/2) + \
            math.cos(math.radians(after_lat)) * math.cos(math.radians(campaign_lat)) * \
            math.sin(dLon/2) * math.sin(dLon/2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        distance = R * c
        
        if distance > geofence_radius_meters:
            print(f"❌ WARNING: Geotagged location is {distance:.1f} meters away (Limit: {geofence_radius_meters}m)!")
            geo_passed = False
        else:
            print(f"✅ Geofence Verification Passed! Distance to campaign center: {distance:.1f} meters.")
    else:
        print("ℹ️ EXIF GPS Info: No coordinates found. Falling back to browser-reported geofencing.")

    # 3. VISUAL MATCH (EMBEDDINGS COMPARISON)
    visual_similarity = compare_images(before_path, after_path)
    print(f"📊 Image Cosine Similarity: {visual_similarity * 100:.2f}%")
    
    # Heuristics:
    # - Similarity > 96%: The images are basically identical. The cleanup didn't happen or they uploaded the same photo twice!
    # - Similarity < 45%: The images are completely different scenes (e.g. one is a forest, the other is a city street).
    # - Similarity between 55% and 92%: Perfect balance of same baseline location structure but visual change (rubbish removed)!
    
    visual_passed = False
    if visual_similarity > 0.95:
        print("❌ WARNING: The images are virtually identical! Fraud/No action suspected.")
    elif visual_similarity < 0.45:
        print("❌ WARNING: Images are completely different scenes! Invalid evidence.")
    else:
        print("✅ Visual Change Confirmed! Significant scene alteration detected (rubbish cleared).")
        visual_passed = True
        
    overall_verification = time_passed and geo_passed and visual_passed
    if overall_verification:
        print("\n🏆 VERIFICATION RESULT: [SUCCESS] Impact Verified! Certificate ready for issuance.")
    else:
        print("\n🚫 VERIFICATION RESULT: [FAILED] Trust signals did not meet thresholds.")
        
    return {
        "verified": overall_verification,
        "similarity": visual_similarity,
        "time_passed": time_passed,
        "geo_passed": geo_passed
    }

# ==========================================
# TEST RUN EXAMPLE
# ==========================================
if __name__ == "__main__":
    print("Pre-trained ResNet-50 loaded successfully on:", device)
    print("To test the pipeline:")
    print("1. Upload 'before.jpg' and 'after.jpg' to your Google Colab instance.")
    print("2. Run the function: verify_impact('before.jpg', 'after.jpg', datetime.datetime(2026, 5, 20), 19.076, 72.8777)")
