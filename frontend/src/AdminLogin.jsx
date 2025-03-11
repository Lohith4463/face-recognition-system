import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [loginID, setLoginID] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (loginID === "admin" && password === "admin123") {
      setMessage("Default admin login successful");
      setIsLoggedIn(true);
      return;
    }
    try {
      const formData = new FormData();
      formData.append("employeeID", loginID);
      formData.append("password", password);
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      setMessage(result.message || result.error);
      if (result.success) {
        setIsLoggedIn(true);
      }
    } catch (error) {
      setMessage("Login failed.");
    }
  };

  const handleEmployeeRegistration = () => navigate("/admin-registration");
  const handleAdminDashboard = () => navigate("/admin-dashboard");
  const handleBack = () => navigate(-1);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Admin Login</h1>
        <button onClick={handleBack} style={styles.backButton}>Back</button>
      </header>

      <div style={styles.card}>
        <img src="/logo1.png" alt="Aditya University Logo" style={styles.cardLogo} />
        {!isLoggedIn ? (
          <div style={styles.form}>
            <label style={styles.label}>Login ID:</label>
            <input
              type="text"
              placeholder="Enter Login ID"
              value={loginID}
              onChange={(e) => setLoginID(e.target.value)}
              style={styles.input}
            />
            <label style={styles.label}>Password:</label>
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
            <button onClick={handleLogin} style={styles.button}>Login</button>
            {message && <p style={styles.message}>{message}</p>}
          </div>
        ) : (
          <div style={styles.buttonGroup}>
            <button onClick={handleEmployeeRegistration} style={styles.button}>
              Employee Registration
            </button>
            <button onClick={handleAdminDashboard} style={styles.button}>
              Admin Dashboard
            </button>
          </div>
        )}
      </div>

      <footer style={styles.footer}>
        <p>Face Recognition System © 2025 | Admin Login</p>
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
  headerTitle: {
    color: '#ff7300',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
    flexGrow: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#6c757d',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s, transform 0.1s',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '80px', // Space for fixed header
  },
  cardLogo: {
    width: '300px', // Adjusted size to fit nicely above the form
    height: '200px',
    marginBottom: '20px', // Space between logo and Login ID input
    display: 'block', // Ensures proper centering
    marginLeft: 'auto',
    marginRight: 'auto', // Centers the logo horizontally
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  label: {
    color: '#ff7300',
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '16px',
    transition: 'border-color 0.3s, box-shadow 0.3s',
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
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    width: '100%',
  },
  message: {
    color: '#d9534f',
    fontSize: '14px',
    textAlign: 'center',
    marginTop: '10px',
  },
  footer: {
    marginTop: 'auto',
    padding: '20px',
    textAlign: 'center',
    color: '#666',
    fontSize: '14px',
  },
};

// Hover and focus effects
styles.input[':focus'] = { borderColor: '#ff7300', boxShadow: '0 0 5px rgba(255, 115, 0, 0.3)' };
styles.button[':hover'] = { backgroundColor: '#e06600', transform: 'scale(1.02)' };
styles.button[':active'] = { transform: 'scale(0.98)' };
styles.backButton[':hover'] = { backgroundColor: '#5a6268', transform: 'scale(1.02)' };
styles.backButton[':active'] = { transform: 'scale(0.98)' };

export default AdminLogin;