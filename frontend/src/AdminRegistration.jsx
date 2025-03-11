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
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // Start camera on mount when cameraActive changes
  useEffect(() => {
    if (cameraActive && videoRef.current) {
      startCamera();
    } else if (!cameraActive) {
      stopCamera(); // Ensure camera stops when deactivated
    }
    return () => stopCamera(); // Cleanup on unmount
  }, [cameraActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Failed to access camera. Please allow camera permissions or check your device.');
      setCameraActive(false); // Reset camera state on error
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
      alert(`Failed to register employee: ${err.message || 'Network or server issue'}`);
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
      alert(`Failed to verify OTP: ${err.message || 'Network or server issue'}`);
    }
  };

  const handleBack = () => {
    navigate('/admin'); // Redirect to admin page
  };

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
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
    },
    logo: {
      maxWidth: 'clamp(50px, 5vw, 60px)',
      height: 'auto',
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
      transition: 'background-color 0.3s, transform 0.1s',
    },
    form: {
      backgroundColor: '#ffffff',
      padding: 'clamp(15px, 3vw, 30px)',
      borderRadius: 'clamp(8px, 2vw, 12px)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      width: '100%',
      maxWidth: 'clamp(300px, 80%, 400px)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'clamp(10px, 2vw, 15px)',
      marginTop: 'clamp(60px, 10vh, 80px)', // Space for fixed header
    },
    label: {
      color: '#ff7300',
      fontSize: 'clamp(14px, 2vw, 16px)',
      fontWeight: 'bold',
      marginBottom: 'clamp(3px, 1vw, 5px)',
    },
    input: {
      width: '100%',
      padding: 'clamp(8px, 1.5vw, 10px)',
      borderRadius: 'clamp(6px, 1.5vw, 8px)',
      border: '1px solid #ddd',
      fontSize: 'clamp(14px, 2vw, 16px)',
      transition: 'border-color 0.3s, box-shadow 0.3s',
      boxSizing: 'border-box',
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
      transition: 'background-color 0.3s, transform 0.1s',
      width: '100%', // Full width for touch-friendliness
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
      border: '1px solid #ddd',
    },
    capturedImage: {
      width: '100%',
      maxWidth: 'clamp(250px, 60vw, 300px)',
      borderRadius: 'clamp(6px, 1.5vw, 8px)',
      border: '1px solid #ddd',
    },
    footer: {
      marginTop: 'auto',
      padding: 'clamp(10px, 2vw, 20px)',
      textAlign: 'center',
      color: '#666',
      fontSize: 'clamp(12px, 2vw, 14px)',
      width: '100%',
    },
  };

  // Media queries for responsiveness
  const mediaQueries = `
    @media (max-width: 768px) {
      ${styles.header} {
        padding: clamp(8px, 2vw, 10px) clamp(10px, 2vw, 15px);
      }
      ${styles.headerTitle} {
        font-size: clamp(16px, 4vw, 20px);
      }
      ${styles.backButton} {
        padding: clamp(6px, 1.2vw, 8px) clamp(12px, 1.8vw, 15px);
        font-size: clamp(12px, 2vw, 14px);
      }
      ${styles.form} {
        padding: clamp(10px, 2vw, 15px);
      }
      ${styles.video}, ${styles.capturedImage} {
        max-width: clamp(200px, 50vw, 250px);
      }
    }

    @media (max-width: 480px) {
      ${styles.header} {
        flex-direction: column;
        gap: clamp(5px, 1vw, 10px);
      }
      ${styles.headerTitle} {
        font-size: clamp(14px, 4vw, 18px);
      }
      ${styles.backButton} {
        width: 100%;
        margin: 0;
      }
      ${styles.form} {
        max-width: 90%;
      }
      ${styles.video}, ${styles.capturedImage} {
        max-width: clamp(150px, 40vw, 200px);
      }
    }
  `;

  // Inject media queries into the document
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = mediaQueries;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet); // Cleanup on unmount
  }, [mediaQueries]);

  // Hover and focus effects
  styles.input[':focus'] = { borderColor: '#ff7300', boxShadow: '0 0 5px rgba(255, 115, 0, 0.3)' };
  styles.button[':hover'] = { backgroundColor: '#e06600', transform: 'scale(1.02)' };
  styles.button[':active'] = { transform: 'scale(0.98)' };
  styles.backButton[':hover'] = { backgroundColor: '#5a6268', transform: 'scale(1.02)' };
  styles.backButton[':active'] = { transform: 'scale(0.98)' };

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
          />
          <label style={styles.label}>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <label style={styles.label}>Name:</label>
          <input
            type="text"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            style={styles.input}
            required
          />
          <label style={styles.label}>Department:</label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            style={styles.input}
            required
          />
          <label style={styles.label}>Capture Face Image:</label>
          {!capturedImage && !cameraActive && (
            <button onClick={() => setCameraActive(true)} style={styles.button}>Start Camera</button>
          )}
          {cameraActive && (
            <div style={styles.cameraContainer}>
              <video ref={videoRef} autoPlay style={styles.video} />
              <button onClick={captureImage} style={styles.button}>Capture Image</button>
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
          {capturedImage && <button onClick={handleRegister} style={styles.button}>Register</button>}
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
          />
          <label style={styles.label}>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button}>Verify OTP</button>
        </form>
      )}

      <footer style={styles.footer}>
        <p>Face Recognition System © 2025 | Admin Registration</p>
      </footer>
    </div>
  );
};

export default AdminRegistration;