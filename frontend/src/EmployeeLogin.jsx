import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EmployeeLogin = () => {
  const [employeeID, setEmployeeID] = useState('');
  const [password, setPassword] = useState('');
  const [forgotPassword, setForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Login attempt:', { employeeID, password });
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ employeeID, password })
      });
      const data = await response.json();
      console.log('Login response:', data);
      if (data.success) {
        alert(data.message);
        console.log('Navigating to /home with state:', { employeeID, employeeName: data.employeeName });
        navigate('/home', { state: { employeeID, employeeName: data.employeeName } });
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Error logging in:', err);
      alert('Failed to connect to server. Please check if backend is running.');
    }
  };

  const handleForgotPassword = () => {
    setForgotPassword(true);
    setOtpSent(false);
    setEmail('');
    setOtp('');
    setNewPassword('');
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    console.log('Sending OTP for email:', email);
    try {
      const response = await fetch('http://localhost:5000/api/send-forgot-password-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email })
      });
      const data = await response.json();
      console.log('Send OTP response:', data);
      if (data.success) {
        setOtpSent(true);
        alert('OTP sent to your email');
      } else {
        alert(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Error sending OTP:', err);
      alert('Failed to send OTP. Check server or network.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    console.log('Resetting password:', { email, otp, newPassword });
    try {
      const response = await fetch('http://localhost:5000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, otp, password: newPassword })
      });
      const data = await response.json();
      console.log('Reset password response:', data);
      if (data.success) {
        alert('Password reset successfully');
        setForgotPassword(false);
        setEmail('');
        setOtp('');
        setNewPassword('');
      } else {
        alert(data.error || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Error resetting password:', err);
      alert('Failed to reset password. Check server or network.');
    }
  };

  const handleBack = () => {
    navigate('/'); // Redirect to main page
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <img src="/logo1.png" alt="Aditya University Logo" style={styles.logo} />
        <h1 style={styles.headerTitle}>Employee Login</h1>
      </header>

      {!forgotPassword ? (
        <form onSubmit={handleLogin} style={styles.form}>
          <label style={styles.label}>Employee ID:</label>
          <input
            type="text"
            value={employeeID}
            onChange={(e) => setEmployeeID(e.target.value)}
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
          <button type="submit" style={styles.button}>Login</button>
          <p style={styles.forgotLink} onClick={handleForgotPassword}>
            Forgot Password?
          </p>
          <button type="button" onClick={handleBack} style={styles.cancelButton}>Back</button>
        </form>
      ) : (
        <div style={styles.form}>
          {!otpSent ? (
            <form onSubmit={handleSendOtp}>
              <label style={styles.label}>Enter Registered Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
              <button type="submit" style={styles.button}>Send OTP</button>
              <button type="button" onClick={() => setForgotPassword(false)} style={styles.cancelButton}>Cancel</button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <label style={styles.label}>OTP:</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={styles.input}
                required
              />
              <label style={styles.label}>New Password:</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={styles.input}
                required
              />
              <button type="submit" style={styles.button}>Reset Password</button>
              <button type="button" onClick={() => setForgotPassword(false)} style={styles.cancelButton}>Cancel</button>
            </form>
          )}
        </div>
      )}

      <footer style={styles.footer}>
        <p>Face Recognition System © 2025 | Employee Login</p>
      </footer>
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
    padding: 'clamp(10px, 2vw, 20px)', // Responsive padding
    fontFamily: "'Arial', sans-serif",
    boxSizing: 'border-box',
    width: '100%',
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
    padding: 'clamp(10px, 2vw, 15px) clamp(15px, 3vw, 30px)', // Responsive padding
    borderBottom: '2px solid #ff7300',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
  },
  logo: {
    maxWidth: 'clamp(50px, 5vw, 60px)', // Responsive logo size
    height: 'auto',
  },
  headerTitle: {
    color: '#ff7300',
    fontSize: 'clamp(18px, 4vw, 24px)', // Responsive font size
    fontWeight: 'bold',
    margin: 0,
    flexGrow: 1,
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  form: {
    backgroundColor: '#ffffff',
    padding: 'clamp(15px, 3vw, 30px)', // Responsive padding
    borderRadius: 'clamp(8px, 2vw, 12px)', // Responsive border radius
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: 'clamp(300px, 80%, 400px)', // Responsive max width
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(10px, 2vw, 15px)', // Responsive gap
    marginTop: 'clamp(60px, 10vh, 80px)', // Responsive margin for fixed header
  },
  label: {
    color: '#ff7300',
    fontSize: 'clamp(14px, 2vw, 16px)', // Responsive font size
    fontWeight: 'bold',
    marginBottom: 'clamp(3px, 1vw, 5px)', // Responsive margin
  },
  input: {
    width: '100%',
    padding: 'clamp(8px, 1.5vw, 10px)', // Responsive padding
    borderRadius: 'clamp(6px, 1.5vw, 8px)', // Responsive border radius
    border: '1px solid #ddd',
    fontSize: 'clamp(14px, 2vw, 16px)', // Responsive font size
    transition: 'border-color 0.3s, box-shadow 0.3s',
    boxSizing: 'border-box',
  },
  button: {
    padding: 'clamp(10px, 2vw, 12px)', // Responsive padding
    border: 'none',
    borderRadius: 'clamp(6px, 1.5vw, 8px)', // Responsive border radius
    backgroundColor: '#ff7300',
    color: '#ffffff',
    fontSize: 'clamp(14px, 2vw, 16px)', // Responsive font size
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s, transform 0.1s',
    width: '100%', // Full width for touch-friendliness
  },
  cancelButton: {
    padding: 'clamp(10px, 2vw, 12px)', // Responsive padding
    border: 'none',
    borderRadius: 'clamp(6px, 1.5vw, 8px)', // Responsive border radius
    backgroundColor: '#d9534f',
    color: '#ffffff',
    fontSize: 'clamp(14px, 2vw, 16px)', // Responsive font size
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s, transform 0.1s',
    width: '100%', // Full width for touch-friendliness
  },
  forgotLink: {
    color: '#ff7300',
    fontSize: 'clamp(12px, 2vw, 14px)', // Responsive font size
    textAlign: 'center',
    cursor: 'pointer',
    textDecoration: 'underline',
    transition: 'color 0.3s',
  },
  footer: {
    marginTop: 'auto',
    padding: 'clamp(10px, 2vw, 20px)', // Responsive padding
    textAlign: 'center',
    color: '#666',
    fontSize: 'clamp(12px, 2vw, 14px)', // Responsive font size
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
    ${styles.form} {
      padding: clamp(10px, 2vw, 15px);
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
    ${styles.form} {
      max-width: 90%;
    }
  }
`;

// Inject media queries into the document (using useEffect would require importing it)
const styleSheet = document.createElement('style');
styleSheet.textContent = mediaQueries;
document.head.appendChild(styleSheet);

// Hover and focus effects
styles.input[':focus'] = { borderColor: '#ff7300', boxShadow: '0 0 5px rgba(255, 115, 0, 0.3)' };
styles.button[':hover'] = { backgroundColor: '#e06600', transform: 'scale(1.02)' };
styles.button[':active'] = { transform: 'scale(0.98)' };
styles.cancelButton[':hover'] = { backgroundColor: '#c9302c', transform: 'scale(1.02)' };
styles.cancelButton[':active'] = { transform: 'scale(0.98)' };
styles.forgotLink[':hover'] = { color: '#e06600' };

export default EmployeeLogin;