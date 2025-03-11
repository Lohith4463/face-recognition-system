import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { employeeName, employeeID } = location.state || { employeeName: 'Unknown', employeeID: '' };
  console.log('Home.jsx loaded with state:', { employeeID, employeeName });

  const handleAttendance = () => {
    console.log(`Navigating to /verify with state: { employeeID: ${employeeID}, employeeName: ${employeeName} }`);
    navigate('/verify', { state: { employeeName, employeeID } });
  };

  const handleDashboard = () => {
    console.log(`Navigating to /dashboard with state: { employeeID: ${employeeID}, employeeName: ${employeeName} }`);
    navigate('/dashboard', { state: { employeeName, employeeID } });
  };

  const handleLogout = () => {
    navigate('/login'); // Redirect to login page
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Welcome, {employeeName}!</h1>
        <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
      </header>
      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <img src="/logo2.png" alt="Aditya University Logo" style={styles.cardLogo} />
        </div>
        <div style={styles.buttonGroup}>
          <button onClick={handleAttendance} style={styles.button}>
            Attendance
          </button>
          <button onClick={handleDashboard} style={styles.button}>
            Dashboard
          </button>
        </div>
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
  logoutButton: {
    padding: 'clamp(8px, 1.5vw, 10px) clamp(15px, 2vw, 20px)', // Responsive padding
    border: 'none',
    borderRadius: 'clamp(6px, 1.5vw, 8px)', // Responsive border radius
    backgroundColor: '#d9534f',
    color: '#ffffff',
    fontSize: 'clamp(12px, 2vw, 16px)', // Responsive font size
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s, transform 0.1s',
  },
  card: {
    padding: 'clamp(15px, 3vw, 30px)', // Responsive padding
    borderRadius: 'clamp(8px, 2vw, 12px)', // Responsive border radius
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', // Center content horizontally
    gap: 'clamp(10px, 2vw, 20px)', // Responsive gap
    width: '100%',
    maxWidth: 'clamp(300px, 80%, 400px)', // Responsive max width
    marginTop: 'clamp(60px, 10vh, 80px)', // Responsive margin for fixed header
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center', // Center the image horizontally
    width: '100%', // Ensure container takes full card width
  },
  cardLogo: {
    maxWidth: 'clamp(250px, 60vw, 400px)', // Responsive logo size
    height: 'auto', // Maintain aspect ratio
    display: 'block', // Ensure proper centering within logoContainer
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(10px, 2vw, 15px)', // Responsive gap
    width: '100%',
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
};

// Hover and active effects
styles.button[':hover'] = { backgroundColor: '#e06600', transform: 'scale(1.02)' };
styles.button[':active'] = { transform: 'scale(0.98)' };
styles.logoutButton[':hover'] = { backgroundColor: '#c9302c', transform: 'scale(1.02)' };
styles.logoutButton[':active'] = { transform: 'scale(0.98)' };

// Media queries for responsiveness
const mediaQueries = `
  @media (max-width: 768px) {
    ${styles.header} {
      padding: clamp(8px, 2vw, 10px) clamp(10px, 2vw, 15px);
    }
    ${styles.headerTitle} {
      font-size: clamp(16px, 4vw, 20px);
    }
    ${styles.logoutButton} {
      padding: clamp(6px, 1.2vw, 8px) clamp(12px, 1.8vw, 15px);
      font-size: clamp(12px, 2vw, 14px);
    }
    ${styles.card} {
      padding: clamp(10px, 2vw, 15px);
    }
    ${styles.cardLogo} {
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
    ${styles.logoutButton} {
      width: 100%;
      margin: 0;
    }
    ${styles.card} {
      max-width: 90%;
    }
    ${styles.cardLogo} {
      max-width: clamp(150px, 40vw, 200px);
    }
  }
`;

// Inject media queries into the document
const styleSheet = document.createElement('style');
styleSheet.textContent = mediaQueries;
document.head.appendChild(styleSheet);

export default Home;