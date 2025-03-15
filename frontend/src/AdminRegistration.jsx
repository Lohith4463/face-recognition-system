import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminRegistration = () => {
  const [employeeID, setEmployeeID] = useState('');
  const [email, setEmail] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [department, setDepartment] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [formVisible, setFormVisible] = useState(false); // For form animation
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // Trigger form animation and camera handling
  useEffect(() => {
    setFormVisible(true);
    if (cameraActive && videoRef.current) {
      startCamera();
    } else if (!cameraActive) {
      stopCamera();
    }
    return () => stopCamera();
  }, [cameraActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Failed to access camera. Please allow camera permissions.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current && videoRef.current.videoWidth > 0) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const imageData = canvasRef.current.toDataURL('image/jpeg');
      setCapturedImage(imageData);
      stopCamera();
      setCameraActive(false);
    } else {
      alert('Camera stream not ready. Please try again.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!capturedImage) {
      alert('Please capture an image before registering.');
      return;
    }

    const formData = new FormData();
    formData.append('employeeID', employeeID);
    formData.append('email', email);
    formData.append('employeeName', employeeName);
    formData.append('department', department);

    try {
      const response = await fetch(capturedImage)
        .then((res) => res.blob())
        .then((blob) => {
          formData.append('faceImage', blob, `${employeeID}.jpg`);
          return fetch('http://localhost:5000/api/register', {
            method: 'POST',
            body: formData,
          });
        });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      if (data.success) {
        setOtpSent(true);
        alert('OTP sent to employee email');
      } else {
        alert(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Error registering employee:', err);
      alert(`Failed to register employee: ${err.message || 'Network issue'}`);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('employeeID', employeeID);
    formData.append('otp', otp);
    formData.append('password', password);

    try {
      const response = await fetch('http://localhost:5000/api/verify-otp', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      if (data.success) {
        alert('Employee registered successfully');
        navigate('/admin-dashboard');
      } else {
        alert(data.error || 'OTP verification failed');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      alert(`Failed to verify OTP: ${err.message || 'Network issue'}`);
    }
  };

  const handleBack = () => navigate('/admin');

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#fffaf0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'clamp(10px, 2vw, 20px)',
      fontFamily: "'Arial', sans-serif",
      boxSizing: 'border-box',
      width: '100%',
      transition: 'background-color 0.5s ease',
    },
    header: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#ffedd5',
      padding: 'clamp(10px, 2vw, 15px) clamp(15px, 3vw, 30px)',
      borderBottom: '2px solid #ff7300',
      boxShadow: '0 4px 12px rgba(255, 115, 0, 0.3)', // Orange glow
      zIndex: 1000,
    },
    logo: {
      maxWidth: 'clamp(50px, 5vw, 60px)',
      height: 'auto',
      transition: 'transform 0.3s ease',
    },
    headerTitle: {
      color: '#ff7300',
      fontSize: 'clamp(18px, 4vw, 24px)',
      fontWeight: 'bold',
      margin: 0,
      flexGrow: 1,
      textAlign: 'center',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      textShadow: '1px 1px 3px rgba(255, 115, 0, 0.4)',
      transition: 'transform 0.3s ease',
    },
    backButton: {
      padding: 'clamp(8px, 1.5vw, 10px) clamp(15px, 2vw, 20px)',
      border: 'none',
      borderRadius: 'clamp(6px, 1.5vw, 8px)',
      backgroundColor: '#6c757d',
      color: '#ffffff',
      fontSize: 'clamp(12px, 2vw, 16px)',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 0.3s, transform 0.3s, box-shadow 0.3s',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    },
    form: {
      backgroundColor: '#ffffff',
      padding: 'clamp(15px, 3vw, 30px)',
      borderRadius: 'clamp(8px, 2vw, 12px)',
      boxShadow: '0 6px 15px rgba(255, 115, 0, 0.3)', // Orange glow
      width: '100%',
      maxWidth: 'clamp(300px, 80%, 400px)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'clamp(10px, 2vw, 15px)',
      marginTop: 'clamp(60px, 10vh, 80px)',
      transform: formVisible ? 'translateY(0) rotate(0deg)' : 'translateY(30px) rotate(2deg)',
      opacity: formVisible ? 1 : 0,
      transition: 'transform 0.5s ease-out, opacity 0.5s ease-out, box-shadow 0.3s ease',
    },
    label: {
      color: '#ff7300',
      fontSize: 'clamp(14px, 2vw, 16px)',
      fontWeight: 'bold',
      marginBottom: 'clamp(3px, 1vw, 5px)',
      transition: 'transform 0.3s ease, color 0.3s ease',
    },
    input: {
      width: '100%',
      padding: 'clamp(8px, 1.5vw, 10px)',
      borderRadius: 'clamp(6px, 1.5vw, 8px)',
      border: '1px solid #ddd',
      fontSize: 'clamp(14px, 2vw, 16px)',
      transition: 'border-color 0.3s, box-shadow 0.3s, transform 0.3s',
      boxSizing: 'border-box',
      backgroundColor: '#fffaf0', // Light orange tint
    },
    button: {
      padding: 'clamp(10px, 2vw, 12px)',
      border: 'none',
      borderRadius: 'clamp(6px, 1.5vw, 8px)',
      backgroundColor: '#ff7300',
      color: '#ffffff',
      fontSize: 'clamp(14px, 2vw, 16px)',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 0.3s, transform 0.3s, box-shadow 0.3s',
      width: '100%',
      boxShadow: '0 4px 10px rgba(255, 115, 0, 0.4)',
    },
    cameraContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 'clamp(8px, 1.5vw, 10px)',
    },
    video: {
      width: '100%',
      maxWidth: 'clamp(250px, 60vw, 300px)',
      borderRadius: 'clamp(6px, 1.5vw, 8px)',
      border: '2px solid #ff7300', // Orange frame
      boxShadow: '0 4px 12px rgba(255, 115, 0, 0.3)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    },
    capturedImage: {
      width: '100%',
      maxWidth: 'clamp(250px, 60vw, 300px)',
      borderRadius: 'clamp(6px, 1.5vw, 8px)',
      border: '2px solid #ff7300',
      boxShadow: '0 4px 12px rgba(255, 115, 0, 0.3)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    },
    footer: {
      marginTop: 'auto',
      padding: 'clamp(10px, 2vw, 20px)',
      textAlign: 'center',
      color: '#666',
      fontSize: 'clamp(12px, 2vw, 14px)',
      width: '100%',
      transition: 'color 0.3s ease',
    },
  };

  // Hover and focus effects
  styles.input[":focus"] = {
    borderColor: '#ff7300',
    boxShadow: '0 0 8px rgba(255, 115, 0, 0.5)',
    transform: 'scale(1.02)', // Subtle lift
    outline: 'none',
  };
  styles.input[":hover"] = {
    transform: 'scale(1.02)',
    boxShadow: '0 0 5px rgba(255, 115, 0, 0.4)',
  };
  styles.button[":hover"] = {
    backgroundColor: '#e06600', // Slightly darker orange
    transform: 'scale(1.05) rotate(3deg)', // Wobble effect
    boxShadow: '0 6px 15px rgba(255, 115, 0, 0.6)', // Glowing orange shadow
  };
  styles.button[":active"] = {
    transform: 'scale(0.95) rotate(0deg)',
    backgroundColor: '#cc5c00', // Darker orange on press
    boxShadow: '0 2px 6px rgba(255, 115, 0, 0.5)',
  };
  styles.backButton[":hover"] = {
    backgroundColor: '#5a6268',
    transform: 'scale(1.05) rotate(-2deg)', // Opposite wobble
    boxShadow: '0 6px 12px rgba(90, 98, 104, 0.5)',
  };
  styles.backButton[":active"] = {
    transform: 'scale(0.95) rotate(0deg)',
    backgroundColor: '#495057',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
  };
  styles.logo[":hover"] = {
    transform: 'scale(1.1) rotate(10deg)', // Playful spin
  };
  styles.headerTitle[":hover"] = {
    transform: 'scale(1.05)', // Slight pop
  };
  styles.label[":hover"] = {
    transform: 'translateX(5px)', // Slide effect
    color: '#e06600', // Darker orange
  };
  styles.video[":hover"] = {
    transform: 'scale(1.03)',
    boxShadow: '0 6px 15px rgba(255, 115, 0, 0.5)', // Enhanced glow
  };
  styles.capturedImage[":hover"] = {
    transform: 'scale(1.03) rotate(2deg)', // Wobble on captured image
    boxShadow: '0 6px 15px rgba(255, 115, 0, 0.5)',
  };
  styles.form[":hover"] = {
    boxShadow: '0 10px 20px rgba(255, 115, 0, 0.5)', // Bigger glow on hover
  };
  styles.footer[":hover"] = {
    color: '#ff7300', // Orange text on hover
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <img src="/logo1.png" alt="Aditya University Logo" style={styles.logo} />
        <h1 style={styles.headerTitle}>Admin Employee Registration</h1>
        <button onClick={handleBack} style={styles.backButton}>Back</button>
      </header>

      {!otpSent ? (
        <div style={styles.form}>
          <label style={styles.label}>Employee ID:</label>
          <input
            type="text"
            value={employeeID}
            onChange={(e) => setEmployeeID(e.target.value)}
            style={styles.input}
            required
            placeholder="Enter Employee ID"
          />
          <label style={styles.label}>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
            placeholder="Enter Email"
          />
          <label style={styles.label}>Name:</label>
          <input
            type="text"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            style={styles.input}
            required
            placeholder="Enter Name"
          />
          <label style={styles.label}>Department:</label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            style={styles.input}
            required
            placeholder="Enter Department"
          />
          <label style={styles.label}>Capture Face Image:</label>
          {!capturedImage && !cameraActive && (
            <button onClick={() => setCameraActive(true)} style={styles.button}>
              Start Camera
            </button>
          )}
          {cameraActive && (
            <div style={styles.cameraContainer}>
              <video ref={videoRef} autoPlay style={styles.video} />
              <button onClick={captureImage} style={styles.button}>
                Capture Image
              </button>
            </div>
          )}
          {capturedImage && (
            <div style={styles.cameraContainer}>
              <img src={capturedImage} alt="Captured" style={styles.capturedImage} />
              <button
                onClick={() => {
                  setCapturedImage(null);
                  setCameraActive(true);
                }}
                style={styles.button}
              >
                Retake
              </button>
            </div>
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          {capturedImage && (
            <button onClick={handleRegister} style={styles.button}>
              Register
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleVerifyOtp} style={styles.form}>
          <label style={styles.label}>OTP:</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={styles.input}
            required
            placeholder="Enter OTP"
          />
          <label style={styles.label}>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
            placeholder="Set Password"
          />
          <button type="submit" style={styles.button}>
            Verify OTP
          </button>
        </form>
      )}

      <footer style={styles.footer}>
        <p>Face Recognition System © 2025 | Admin Registration</p>
      </footer>
    </div>
  );
};

export default AdminRegistration;