import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { useNavigate, useLocation } from 'react-router-dom';

const Verify = () => {
  const [isVerified, setIsVerified] = useState(false);
  const webcamRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { employeeName = 'Unknown', employeeID = '' } = location.state || {};
  console.log('Verify.jsx loaded with state:', { employeeID, employeeName });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employeeID) {
      alert('Employee ID not found. Please log in again.');
      return;
    }

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      alert('Failed to capture image. Please ensure your webcam is working.');
      return;
    }

    const now = new Date();
    const inTime = now.toTimeString().split(' ')[0]; // e.g., "09:20:00"
    console.log(`Captured in-time for ${employeeID}: ${inTime}`);

    const blob = await fetch(imageSrc).then((res) => res.blob());
    const file = new File([blob], `${employeeID}.jpg`, { type: 'image/jpeg' });

    const formData = new FormData();
    formData.append('employeeID', employeeID);
    formData.append('faceImage', file);
    formData.append('inTime', inTime); // Send in-time to backend

    try {
      const response = await fetch('http://localhost:5000/api/verify', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      console.log('Backend response:', data);

      if (data.success) {
        if (data.lateTime) {
          alert(`Good morning, ${employeeName}! Attendance recorded. You are ${data.lateTime} late.`);
        } else {
          alert(`Good morning, ${employeeName}! Attendance recorded successfully`);
        }
        setIsVerified(true);
      } else if (data.message === 'Attendance already marked for today') {
        alert(`Hello, ${employeeName}! Attendance already recorded for today at ${data.inTime}`);
        setIsVerified(true);
      } else {
        alert(data.error || data.message || 'Verification failed');
      }
    } catch (err) {
      alert('An error occurred. Please try again.');
      console.error('Fetch error:', err);
    }
  };

  const handleDashboard = () => {
    console.log(`Navigating to /dashboard with state: { employeeID: ${employeeID}, employeeName: ${employeeName} }`);
    navigate('/dashboard', { state: { employeeName, employeeID } });
  };

  const handleExit = () => {
    console.log('Navigating to /login');
    navigate('/login');
  };

  const handleHome = () => {
    navigate('/'); // Redirect to home page
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <img src="/logo1.png" alt="Aditya University Logo" style={styles.logo} />
        <h1 style={styles.headerTitle}>Face Verification</h1>
      </header>
      <div style={styles.card}>
        <p style={styles.name}>Hello, {employeeName}!</p>
        {!isVerified ? (
          <form onSubmit={handleSubmit}>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={320}
              height={240}
              style={styles.webcam}
            />
            <button type="submit" style={styles.button}>
              Verify
            </button>
          </form>
        ) : (
          <div style={styles.buttonGroup}>
            <p style={styles.successMessage}>Verification Complete!</p>
            <button onClick={handleDashboard} style={styles.button}>
              User Dashboard
            </button>
            <button onClick={handleExit} style={styles.exitButton}>
              Exit
            </button>
            <button onClick={handleHome} style={styles.homeButton}>
              Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#fffaf0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: "'Arial', sans-serif",
  },
  header: {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffedd5',
    padding: '15px 30px',
    borderBottom: '2px solid #ff7300',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  logo: {
    width: '60px',
    height: 'auto',
  },
  headerTitle: {
    color: '#ff7300',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
    flexGrow: 1,
    textAlign: 'center',
  },
  card: {
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#ffffff',
    textAlign: 'center',
    width: '100%',
    maxWidth: '400px',
    marginTop: '80px', // Space for fixed header
  },
  name: {
    color: '#ff7300',
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  webcam: {
    marginBottom: '20px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    width: '100%',
    maxWidth: '320px',
  },
  button: {
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#ff7300',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s, transform 0.1s',
    width: '100%',
    marginBottom: '10px',
  },
  exitButton: {
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#d9534f',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s, transform 0.1s',
    width: '100%',
    marginBottom: '10px',
  },
  homeButton: {
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#007bff',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s, transform 0.1s',
    width: '100%',
    marginBottom: '10px',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  successMessage: {
    color: '#28a745',
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
};

// Hover and active effects
styles.button[':hover'] = { backgroundColor: '#e06600', transform: 'scale(1.02)' };
styles.button[':active'] = { transform: 'scale(0.98)' };
styles.exitButton[':hover'] = { backgroundColor: '#c9302c', transform: 'scale(1.02)' };
styles.exitButton[':active'] = { transform: 'scale(0.98)' };
styles.homeButton[':hover'] = { backgroundColor: '#0056b3', transform: 'scale(1.02)' };
styles.homeButton[':active'] = { transform: 'scale(0.98)' };

export default Verify;