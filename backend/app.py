import os
from datetime import datetime
from dotenv import load_dotenv
import pymongo
import certifi
from PIL import Image
import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify
from flask_cors import CORS
import io
import base64
import traceback
import smtplib
import random
import json
from email.mime.text import MIMEText
from deepface import DeepFace
import dlib
import cv2
from scipy.spatial import distance as dist
from imutils import face_utils
import re

# Load environment variables
load_dotenv()
print(f"Loaded EMAIL_SENDER: {os.getenv('EMAIL_SENDER')}")
print(f"Loaded EMAIL_PASSWORD: {os.getenv('EMAIL_PASSWORD')}")

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Directory for storing images
IMAGE_DIR = 'images'
os.makedirs(IMAGE_DIR, exist_ok=True)

# Load dlib face detector and predictor
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")

# MongoDB connection setup
MONGO_URI = os.getenv('MONGO_URI')
client = None
employees_collection = None
attendance_collection = None

# Email configuration
EMAIL_SENDER = os.getenv('EMAIL_SENDER')
EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD')
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

# Temporary OTP storage
otp_storage = {}

# Config file path for In Time threshold
CONFIG_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'config.json')

# Utility to read config
def read_config():
    if not os.path.exists(CONFIG_PATH):
        with open(CONFIG_PATH, 'w') as f:
            json.dump({"inTimeThreshold": "09:30"}, f, indent=2)
    with open(CONFIG_PATH, 'r') as f:
        return json.load(f)

# Utility to write config
def write_config(config):
    with open(CONFIG_PATH, 'w') as f:
        json.dump(config, f, indent=2)

# MongoDB connection
print("Attempting to connect to MongoDB Atlas")
try:
    client = pymongo.MongoClient(MONGO_URI, tls=True, tlsCAFile=certifi.where())
    client.admin.command('ping')
    db = client['frs_db']
    employees_collection = db['employees']
    attendance_collection = db['attendance']
    print("Connected to MongoDB successfully")
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")
    traceback.print_exc()

def send_email(to_email, subject, body):
    """Send an email using SMTP with detailed debugging."""
    if not EMAIL_SENDER or not EMAIL_PASSWORD:
        raise ValueError("EMAIL_SENDER or EMAIL_PASSWORD not set in .env")
    
    try:
        msg = MIMEText(body)
        msg['Subject'] = subject
        msg['From'] = EMAIL_SENDER
        msg['To'] = to_email

        print(f"Sending email to {to_email} from {EMAIL_SENDER}")
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.set_debuglevel(1)
            server.starttls()
            server.login(EMAIL_SENDER, EMAIL_PASSWORD)
            server.send_message(msg)
        print(f"Email sent successfully to {to_email}")
    except smtplib.SMTPAuthenticationError as e:
        print(f"SMTP Authentication Error: {e}")
        traceback.print_exc()
        raise Exception("Failed to authenticate with SMTP server.")
    except Exception as e:
        print(f"Failed to send email: {e}")
        traceback.print_exc()
        raise

def generate_otp():
    """Generate a 6-digit OTP."""
    return str(random.randint(100000, 999999))

def calculate_eye_distance(image):
    """Calculate the distance between eyes for face proximity check."""
    try:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        rects = detector(gray, 1)
        if len(rects) == 0:
            return None
        shape = predictor(gray, rects[0])
        shape = face_utils.shape_to_np(shape)
        left_eye = shape[36:42]
        right_eye = shape[42:48]
        left_eye_center = left_eye.mean(axis=0)
        right_eye_center = right_eye.mean(axis=0)
        return dist.euclidean(left_eye_center, right_eye_center)
    except Exception as e:
        print(f"Error calculating eye distance: {e}")
        return None

@app.route('/api/register', methods=['POST'])
def register():
    """Register a new employee with email, name, department, and send OTP."""
    if employees_collection is None:
        return jsonify({"success": False, "error": "Database connection not established"}), 500

    try:
        employeeID = request.form.get('employeeID')
        email = request.form.get('email')
        employeeName = request.form.get('employeeName')
        department = request.form.get('department')
        face_image = request.files.get('faceImage')

        print(f"Received registration data: employeeID={employeeID}, email={email}, employeeName={employeeName}, department={department}")

        if not all([employeeID, email, employeeName, department, face_image]):
            return jsonify({"success": False, "error": "Missing required fields: employeeID, email, employeeName, department, faceImage"}), 400

        if employees_collection.find_one({"employee_id": employeeID}):
            print(f"Employee ID {employeeID} already exists")
            return jsonify({"success": False, "error": "Employee ID already exists"}), 400

        if employees_collection.find_one({"email": email}):
            print(f"Email {email} already registered")
            return jsonify({"success": False, "error": "Email already registered"}), 400

        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            return jsonify({"success": False, "error": "Invalid email format"}), 400

        image = Image.open(face_image)
        frame = np.array(image)
        image_path = os.path.join(IMAGE_DIR, f"{employeeID}.jpg")
        image.save(image_path)
        image_bytes = io.BytesIO()
        image.save(image_bytes, format='JPEG')
        image_base64 = base64.b64encode(image_bytes.getvalue()).decode('utf-8')

        otp = generate_otp()
        otp_storage[employeeID] = {
            "otp": otp,
            "email": email,
            "employeeName": employeeName,
            "department": department,
            "face_image": image_base64
        }
        send_email(
            email,
            "Verify Your Email - Face Recognition System",
            f"Your OTP for registration is: {otp}. Please use this to set your password."
        )

        print(f"OTP sent to {email} for employeeID={employeeID}")
        return jsonify({"success": True, "message": "OTP sent to email for verification"}), 200
    except Exception as e:
        print(f"Error in registration: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    """Verify OTP and set password, storing employee details including department."""
    if employees_collection is None:
        return jsonify({"success": False, "error": "Database connection not established"}), 500

    try:
        employeeID = request.form.get('employeeID')
        otp = request.form.get('otp')
        password = request.form.get('password')

        print(f"Received OTP verification: employeeID={employeeID}, otp={otp}")

        if not all([employeeID, otp, password]):
            return jsonify({"success": False, "error": "Missing required fields: employeeID, otp, password"}), 400

        if employeeID not in otp_storage or otp_storage[employeeID]["otp"] != otp:
            print(f"Invalid OTP for employeeID={employeeID}")
            return jsonify({"success": False, "error": "Invalid OTP"}), 401

        employee_data = {
            "employee_id": employeeID,
            "email": otp_storage[employeeID]["email"],
            "employee_name": otp_storage[employeeID]["employeeName"],
            "department": otp_storage[employeeID]["department"],
            "password": password,
            "face_image": otp_storage[employeeID]["face_image"],
            "created_at": datetime.now()
        }
        employees_collection.insert_one(employee_data)
        del otp_storage[employeeID]

        print(f"Employee {employeeID} registered successfully")
        return jsonify({"success": True, "message": "User registered successfully"}), 201
    except Exception as e:
        print(f"Error in OTP verification: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/send-update-otp', methods=['POST'])
def send_update_otp():
    """Send OTP to employee email for updating details."""
    if employees_collection is None:
        return jsonify({"success": False, "error": "Database connection not established"}), 500

    try:
        employeeID = request.form.get('employeeID')
        email = request.form.get('email')

        if not all([employeeID, email]):
            return jsonify({"success": False, "error": "Missing required fields: employeeID, email"}), 400

        employee = employees_collection.find_one({"employee_id": employeeID, "email": email})
        if not employee:
            return jsonify({"success": False, "error": "Employee not found or email mismatch"}), 404

        otp = generate_otp()
        otp_storage[employeeID] = {"otp": otp, "email": email, "update_mode": True}
        send_email(
            email,
            "Update Your Details - Face Recognition System",
            f"Your OTP for updating your details is: {otp}. Please use this to proceed."
        )

        print(f"Update OTP sent to {email} for employeeID={employeeID}")
        return jsonify({"success": True, "message": "OTP sent to email for update verification"}), 200
    except Exception as e:
        print(f"Error sending update OTP: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/update-employee', methods=['POST'])
def update_employee():
    """Update employee details after OTP verification."""
    if employees_collection is None:
        return jsonify({"success": False, "error": "Database connection not established"}), 500

    try:
        employeeID = request.form.get('employeeID')
        otp = request.form.get('otp')
        employeeName = request.form.get('employeeName')
        email = request.form.get('email')
        department = request.form.get('department')
        face_image = request.files.get('faceImage')

        if not all([employeeID, otp, employeeName, email, department]):
            return jsonify({"success": False, "error": "Missing required fields"}), 400

        if employeeID not in otp_storage or otp_storage[employeeID]["otp"] != otp or not otp_storage[employeeID].get("update_mode"):
            print(f"Invalid OTP for employeeID={employeeID}")
            return jsonify({"success": False, "error": "Invalid OTP or not in update mode"}), 401

        update_data = {
            "employee_name": employeeName,
            "email": email,
            "department": department
        }
        if face_image:
            image = Image.open(face_image)
            image_path = os.path.join(IMAGE_DIR, f"{employeeID}.jpg")
            image.save(image_path)
            image_bytes = io.BytesIO()
            image.save(image_bytes, format='JPEG')
            image_base64 = base64.b64encode(image_bytes.getvalue()).decode('utf-8')
            update_data["face_image"] = image_base64

        employees_collection.update_one({"employee_id": employeeID}, {"$set": update_data})
        del otp_storage[employeeID]

        print(f"Employee {employeeID} updated successfully")
        return jsonify({"success": True, "message": "Employee details updated successfully"}), 200
    except Exception as e:
        print(f"Error updating employee: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    """Authenticate an employee and return their name."""
    if employees_collection is None:
        return jsonify({"success": False, "error": "Database connection not established"}), 500

    try:
        employeeID = request.form.get('employeeID')
        password = request.form.get('password')

        print(f"Received login data: employeeID={employeeID}")

        if not all([employeeID, password]):
            return jsonify({"success": False, "error": "Missing required fields: employeeID, password"}), 400

        employee = employees_collection.find_one({"employee_id": employeeID})
        if employee and employee['password'] == password:
            employee_name = employee.get('employee_name', 'Unknown')
            print(f"Login successful for {employeeID}, name: {employee_name}")
            return jsonify({
                "success": True,
                "message": f"Login successful. Welcome, {employee_name}!",
                "employeeName": employee_name
            }), 200
        print(f"Invalid credentials for {employeeID}")
        return jsonify({"success": False, "error": "Invalid credentials"}), 401
    except Exception as e:
        print(f"Error in login: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/send-forgot-password-otp', methods=['POST'])
def send_forgot_password_otp():
    """Send OTP to employee's email for password reset."""
    if employees_collection is None:
        return jsonify({"success": False, "error": "Database connection not established"}), 500

    try:
        email = request.form.get('email')
        if not email:
            return jsonify({"success": False, "error": "Missing email"}), 400

        employee = employees_collection.find_one({"email": email})
        if not employee:
            return jsonify({"success": False, "error": "Email not registered"}), 404

        otp = generate_otp()
        otp_storage[employee['employee_id']] = {"otp": otp, "email": email, "forgot_password": True}
        send_email(
            email,
            "Reset Your Password - Face Recognition System",
            f"Your OTP to reset your password is: {otp}. Please use this to set a new password."
        )

        print(f"Forgot password OTP sent to {email} for employeeID={employee['employee_id']}")
        return jsonify({"success": True, "message": "OTP sent to email for password reset"}), 200
    except Exception as e:
        print(f"Error sending forgot password OTP: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    """Verify OTP and reset employee password."""
    if employees_collection is None:
        return jsonify({"success": False, "error": "Database connection not established"}), 500

    try:
        email = request.form.get('email')
        otp = request.form.get('otp')
        new_password = request.form.get('password')

        if not all([email, otp, new_password]):
            return jsonify({"success": False, "error": "Missing required fields: email, otp, password"}), 400

        employee = employees_collection.find_one({"email": email})
        if not employee:
            return jsonify({"success": False, "error": "Email not registered"}), 404

        employee_id = employee['employee_id']
        if employee_id not in otp_storage or otp_storage[employee_id]["otp"] != otp or not otp_storage[employee_id].get("forgot_password"):
            print(f"Invalid OTP for employeeID={employee_id}")
            return jsonify({"success": False, "error": "Invalid OTP"}), 401

        employees_collection.update_one({"employee_id": employee_id}, {"$set": {"password": new_password}})
        del otp_storage[employee_id]

        print(f"Password reset successfully for employeeID={employee_id}")
        return jsonify({"success": True, "message": "Password reset successfully"}), 200
    except Exception as e:
        print(f"Error resetting password: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/in-time', methods=['GET'])
def get_in_time():
    """Get the current In Time threshold."""
    try:
        config = read_config()
        return jsonify({"success": True, "inTimeThreshold": config["inTimeThreshold"]})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/update-in-time', methods=['POST'])
def update_in_time():
    """Update the In Time threshold."""
    try:
        data = request.get_json()
        in_time_threshold = data.get('inTimeThreshold')
        if not in_time_threshold or not isinstance(in_time_threshold, str) or not re.match(r'^\d{2}:\d{2}$', in_time_threshold):
            return jsonify({"success": False, "error": "Invalid time format. Use HH:MM (e.g., 09:30)"}), 400
        config = read_config()
        config["inTimeThreshold"] = in_time_threshold
        write_config(config)
        return jsonify({"success": True, "message": f"In Time updated to {in_time_threshold} successfully"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/verify', methods=['POST'])
def verify():
    """Verify employee face and mark attendance with in-time and late-time calculation based on In Time threshold."""
    if employees_collection is None or attendance_collection is None:
        return jsonify({"success": False, "error": "Database connection not established"}), 500

    try:
        face_image = request.files.get('faceImage')
        employeeID = request.form.get('employeeID')
        in_time_str = request.form.get('inTime')  # e.g., "09:20:00"

        if not face_image or not employeeID or not in_time_str:
            return jsonify({"success": False, "error": "Missing required fields: faceImage, employeeID, inTime"}), 400

        captured_image = Image.open(face_image)
        captured_image = np.array(captured_image)
        eye_distance = calculate_eye_distance(captured_image)
        if eye_distance is None or eye_distance < 10:
            print(f"Face too far or not detected for {employeeID} (eye distance: {eye_distance})")
            return jsonify({"success": False, "error": "Face is too far from the camera or not detected"}), 400

        employee = employees_collection.find_one({"employee_id": employeeID})
        if not employee:
            return jsonify({"success": False, "error": f"No reference image found for employee ID {employeeID}"}), 404

        reference_image_base64 = employee['face_image']
        reference_image_bytes = io.BytesIO(base64.b64decode(reference_image_base64))
        reference_image = Image.open(reference_image_bytes)
        reference_image = np.array(reference_image)

        verification_result = DeepFace.verify(
            img1_path=captured_image,
            img2_path=reference_image,
            model_name='Facenet',
            enforce_detection=False
        )
        similarity_score = (1 - verification_result["distance"]) * 100
        print(f"Verification result for {employeeID}: {similarity_score:.2f}%")

        if verification_result["verified"] and similarity_score >= 70:
            today = datetime.now().strftime("%Y-%m-%d")
            existing_record = attendance_collection.find_one({"employee_id": employeeID, "date": today})
            if existing_record:
                return jsonify({
                    "success": False,
                    "message": "Attendance already marked for today",
                    "inTime": existing_record.get("in_time", existing_record.get("time", "N/A"))
                }), 200

            # Parse in-time and calculate late time based on inTimeThreshold
            in_time = datetime.strptime(in_time_str, "%H:%M:%S").time()
            config = read_config()
            in_time_threshold = datetime.strptime(config["inTimeThreshold"], "%H:%M").time()
            late_time = None
            if in_time > in_time_threshold:
                in_datetime = datetime.combine(datetime.today(), in_time)
                threshold_datetime = datetime.combine(datetime.today(), in_time_threshold)
                late_delta = in_datetime - threshold_datetime
                hours, remainder = divmod(late_delta.seconds, 3600)
                minutes = remainder // 60
                late_time = f"{hours} hr {minutes} min" if hours > 0 else f"{minutes} min"

            # Store attendance record
            attendance_record = {
                "employee_id": employeeID,
                "date": today,
                "in_time": in_time_str,
                "status": "present",
                "timestamp": datetime.now(),
                "late_time": late_time if late_time else None
            }
            attendance_collection.insert_one(attendance_record)

            # Send email notification
            send_email(
                employee['email'],
                "Attendance Recorded - Face Recognition System",
                f"Your attendance has been recorded on {today} at {in_time_str}." +
                (f" You were {late_time} late." if late_time else "")
            )

            response = {
                "success": True,
                "message": "Attendance recorded successfully",
                "inTime": in_time_str
            }
            if late_time:
                response["lateTime"] = late_time
            return jsonify(response), 200
        else:
            return jsonify({
                "success": False,
                "message": "Verification failed - face not recognized or similarity too low",
                "similarity_score": similarity_score
            }), 401
    except Exception as e:
        print(f"Error in verification: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/cnn_process', methods=['POST'])
def cnn_process():
    """Alternative face verification endpoint with in-time and late-time based on In Time threshold."""
    if employees_collection is None or attendance_collection is None:
        return jsonify({"success": False, "error": "Database connection not established"}), 500

    try:
        employeeID = request.form.get('employeeID')
        password = request.form.get('password')
        face_image = request.files.get('faceImage')
        in_time_str = request.form.get('inTime', datetime.now().strftime("%H:%M:%S"))

        print(f"Received CNN process data: employeeID={employeeID}")

        if not all([employeeID, password, face_image]):
            return jsonify({"error": "Missing required fields"}), 400

        employee = employees_collection.find_one({"employee_id": employeeID, "password": password})
        if not employee:
            image_path = os.path.join(IMAGE_DIR, f"{employeeID}.jpg")
            if os.path.exists(image_path):
                reference_image = Image.open(image_path)
                reference_image = np.array(reference_image)
            else:
                return jsonify({"error": f"No reference image found for employee ID {employeeID}"}), 404
        else:
            reference_image_base64 = employee['face_image']
            reference_image = Image.open(io.BytesIO(base64.b64decode(reference_image_base64)))
            reference_image = np.array(reference_image)

        captured_image = Image.open(face_image)
        captured_image = np.array(captured_image)

        verification_result = DeepFace.verify(img1_path=captured_image, img2_path=reference_image, model_name='Facenet', enforce_detection=True)
        similarity_score = (1 - verification_result["distance"]) * 100
        print(f"CNN process result for {employeeID}: {similarity_score:.2f}%")

        if verification_result["verified"] and similarity_score >= 80:
            today = datetime.now().strftime("%Y-%m-%d")
            in_time = datetime.strptime(in_time_str, "%H:%M:%S").time()
            config = read_config()
            in_time_threshold = datetime.strptime(config["inTimeThreshold"], "%H:%M").time()
            late_time = None
            if in_time > in_time_threshold:
                in_datetime = datetime.combine(datetime.today(), in_time)
                threshold_datetime = datetime.combine(datetime.today(), in_time_threshold)
                late_delta = in_datetime - threshold_datetime
                hours, remainder = divmod(late_delta.seconds, 3600)
                minutes = remainder // 60
                late_time = f"{hours} hr {minutes} min" if hours > 0 else f"{minutes} min"

            attendance_collection.insert_one({
                "employee_id": employeeID,
                "date": today,
                "in_time": in_time_str,
                "timestamp": datetime.now(),
                "status": "present",
                "late_time": late_time
            })
            send_email(
                employee['email'],
                "Attendance Recorded - Face Recognition System",
                f"Your attendance has been recorded on {today} at {in_time_str}." +
                (f" You were {late_time} late." if late_time else "")
            )
            response = {"message": "Verification successful", "success": True, "inTime": in_time_str}
            if late_time:
                response["lateTime"] = late_time
            return jsonify(response), 200
        else:
            return jsonify({"message": "Verification failed", "success": False}), 401
    except Exception as e:
        print(f"Error in CNN process: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/mark_absent', methods=['POST'])
def mark_absent():
    """Mark an employee as absent for today if no attendance before 12 PM."""
    if attendance_collection is None or employees_collection is None:
        return jsonify({"success": False, "error": "Database connection not established"}), 500

    try:
        employeeID = request.form.get('employeeID')
        if not employeeID:
            return jsonify({"success": False, "error": "Missing employeeID"}), 400

        today = datetime.now().strftime("%Y-%m-%d")
        existing_record = attendance_collection.find_one({"employee_id": employeeID, "date": today})
        
        if existing_record:
            print(f"Employee {employeeID} already has attendance record for {today}")
            return jsonify({"success": False, "message": "Attendance already marked today"}), 400

        now = datetime.now()
        if now.hour >= 14:  # After 12 PM
            attendance_collection.insert_one({
                "employee_id": employeeID,
                "date": today,
                "in_time": "Absent",
                "timestamp": now,
                "status": "absent",
                "late_time": None
            })
            print(f"Marked {employeeID} as absent for {today}")
            return jsonify({"success": True, "message": "Marked as absent"}), 200
        
        print(f"Too early to mark absent for {employeeID} (before 12 PM)")
        return jsonify({"success": False, "message": "Too early to mark absent"}), 200
    except Exception as e:
        print(f"Error marking absent: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/attendance_records', methods=['GET'])
def get_attendance_records():
    """Retrieve attendance records with in_time and late_time, handling legacy 'time' field."""
    if attendance_collection is None:
        return jsonify({"success": False, "error": "Database connection not established"}), 500

    try:
        employeeID = request.args.get('employeeID')
        date = request.args.get('date')  # Format: YYYY-MM-DD
        month = request.args.get('month')  # Format: YYYY-MM

        if not employeeID:
            return jsonify({"success": False, "error": "Missing required fields"}), 400

        query = {"employee_id": employeeID}
        if date:
            query["date"] = date
        elif month:
            query["date"] = {"$regex": f"^{month}"}

        records = attendance_collection.find(query).sort([("date", -1), ("timestamp", -1)])
        attendance_records = [
            {
                "date": r["date"],
                "inTime": r.get("in_time", r.get("time", "N/A")),  # Fallback to 'time' if 'in_time' missing
                "status": r.get("status", "present"),
                "lateTime": r.get("late_time", None)
            }
            for r in records
        ]
        print(f"Fetched {len(attendance_records)} records for {employeeID} with filter: {query}")
        return jsonify({"success": True, "attendance_records": attendance_records})
    except Exception as e:
        print(f"Error fetching attendance records: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/employee-history', methods=['GET'])
def get_employee_history():
    """Retrieve an employee's attendance history."""
    if attendance_collection is None:
        return jsonify({"success": False, "error": "Database connection not established"}), 500

    try:
        employeeID = request.args.get('employeeID')
        if not employeeID:
            return jsonify({"success": False, "error": "Missing employeeID"}), 400

        # Check if employee exists
        employee = employees_collection.find_one({"employee_id": employeeID})
        if not employee:
            return jsonify({"success": False, "error": "Employee not found"}), 404

        # Fetch all attendance records for the employee
        records = attendance_collection.find({"employee_id": employeeID}).sort("date", -1)
        history = [
            {
                "date": record["date"],
                "status": record.get("status", "present"),
                "inTime": record.get("in_time", record.get("time", "N/A")),  # Fallback to 'time' if 'in_time' missing
                "lateTime": record.get("late_time", None)
            }
            for record in records
        ]

        print(f"Fetched {len(history)} history records for employeeID={employeeID}")
        return jsonify({"success": True, "history": history}), 200
    except Exception as e:
        print(f"Error fetching employee history: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/employees', methods=['GET'])
def get_employees():
    """Fetch all employees with attendance status, handling legacy 'time' field."""
    if employees_collection is None or attendance_collection is None:
        return jsonify({"success": False, "error": "Database connection not established"}), 500

    try:
        date = request.args.get('date')
        month = request.args.get('month')

        employees = employees_collection.find({}, {"_id": 0, "employee_id": 1, "employee_name": 1, "email": 1, "department": 1})
        employee_list = list(employees)

        for emp in employee_list:
            query = {"employee_id": emp["employee_id"]}
            if date:
                query["date"] = date
            elif month:
                query["date"] = {"$regex": f"^{month}"}
            else:
                query["date"] = datetime.now().strftime("%Y-%m-%d")

            attendance = attendance_collection.find_one(query)
            emp["status"] = attendance.get("status", "present") if attendance else "not_marked"
            emp["inTime"] = attendance.get("in_time", attendance.get("time", "N/A")) if attendance else "N/A"  # Fallback to 'time'
            emp["lateTime"] = attendance.get("late_time", None) if attendance else None
            emp["date"] = attendance["date"] if attendance else (date or month or query["date"])

        print(f"Fetched {len(employee_list)} employees with filter: {query}")
        return jsonify({"success": True, "employees": employee_list}), 200
    except Exception as e:
        print(f"Error fetching employees: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/attendance', methods=['POST'])
def calculate_attendance():
    """Calculate attendance percentage."""
    if attendance_collection is None:
        return jsonify({"success": False, "error": "Database connection not established"}), 500

    try:
        data = request.get_json()
        employeeID = data.get('employeeID')
        if not employeeID:
            return jsonify({"success": False, "error": "Missing required fields"}), 400

        total_days = len(attendance_collection.distinct("date"))
        present_days = len(attendance_collection.distinct("date", {"employee_id": employeeID, "status": "present"}))
        attendance_percentage = 0 if total_days == 0 else (present_days / total_days) * 100
        print(f"Attendance calculated for {employeeID}: {attendance_percentage}%")
        return jsonify({"success": True, "attendance_percentage": attendance_percentage}), 200
    except Exception as e:
        print(f"Error calculating attendance: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/routes')
def list_routes():
    """List all available routes."""
    import urllib
    output = []
    for rule in app.url_map.iter_rules():
        methods = ','.join(rule.methods)
        line = urllib.parse.unquote(f"{rule.endpoint}: {methods} {rule}")
        output.append(line)
    return "<br>".join(output)

@app.route('/')
def index():
    """Welcome endpoint."""
    return "Welcome to the Face Recognition System API"

#if __name__ == '__main__':
 #   port = int(os.getenv('PORT', 5000))
  #  app.run(host='0.0.0.0', port=port, debug=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
