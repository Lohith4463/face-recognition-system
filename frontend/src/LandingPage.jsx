import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const [error, setError] = useState("");
  const [buttonActive, setButtonActive] = useState(null); // Track which button is active
  const predefinedCoords = { latitude: 17.089555, longitude: 82.067032 };
  const navigate = useNavigate();

  const haversineDistance = (coords1, coords2) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const lat1 = coords1.latitude;
    const lon1 = coords1.longitude;
    const lat2 = coords2.latitude;
    const lon2 = coords2.longitude;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const verifyLocation = () => {
    setButtonActive("verify"); // Set Verify button as active
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const distance = haversineDistance(predefinedCoords, { latitude, longitude });
        if (distance <= 25) navigate("/main");
        else setError("Location verification failed.");
        setTimeout(() => setButtonActive(null), 300); // Reset after animation
      },
      () => {
        setError("Unable to access location.");
        setTimeout(() => setButtonActive(null), 300); // Reset after animation
      }
    );
  };

  const handleBack = () => {
    setButtonActive("back"); // Set Back button as active
    navigate(-1);
    setTimeout(() => setButtonActive(null), 300); // Reset after animation
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button
          onClick={handleBack}
          style={{
            ...styles.backButton,
            ...(buttonActive === "back" ? styles.backButtonActive : {}),
          }}
        >
          Back
        </button>
      </header>

      <div style={styles.card}>
        <img src="/logo2.png" alt="Aditya University Logo" style={styles.cardLogo} />
        <h1 style={styles.title}>Face Recognition System</h1>
        {error && <p style={styles.error}>{error}</p>}
        <button
          onClick={verifyLocation}
          style={{
            ...styles.button,
            ...(buttonActive === "verify" ? styles.buttonActive : {}),
          }}
        >
          Verify Location
        </button>
      </div>

      <footer style={styles.footer}>
        <p>Face Recognition System © 2025 | Landing Page</p>
      </footer>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #fffaf0, #ffe6cc)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "'Arial', sans-serif",
  },
  header: {
    position: "fixed",
    top: "0",
    left: "0",
    right: "0",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#ffedd5",
    padding: "15px 30px",
    borderBottom: "2px solid #ff7300",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  backButton: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#6c757d",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s, transform 0.3s, box-shadow 0.3s",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Base shadow
  },
  backButtonActive: {
    transform: "scale(0.95) translateY(2px)", // Slight press-down effect
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)", // Reduced shadow when pressed
    backgroundColor: "#5a6268", // Darker on press
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
    width: "100%",
    maxWidth: "450px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid #ff7300",
    position: "relative",
    overflow: "hidden",
  },
  cardLogo: {
    width: "200px",
    height: "auto",
    marginBottom: "30px",
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    position: "relative",
    zIndex: 1,
  },
  title: {
    color: "#ff7300",
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "25px",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  error: {
    color: "#d9534f",
    fontSize: "15px",
    textAlign: "center",
    marginBottom: "20px",
  },
  button: {
    padding: "15px",
    border: "none",
    borderRadius: "12px",
    backgroundColor: "#ff7300",
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s, transform 0.3s, box-shadow 0.3s",
    width: "100%",
    maxWidth: "300px",
    boxShadow: "0 5px 15px rgba(255, 115, 0, 0.4)", // Base shadow
  },
  buttonActive: {
    transform: "scale(0.95) translateY(2px)", // Slight press-down effect
    boxShadow: "0 3px 8px rgba(255, 115, 0, 0.5)", // Reduced shadow when pressed
    backgroundColor: "#e06600", // Darker on press
  },
  footer: {
    marginTop: "auto",
    padding: "20px",
    textAlign: "center",
    color: "#666",
    fontSize: "14px",
    position: "relative",
    bottom: "0",
  },
};

// Hover and focus effects
styles.button[":hover"] = {
  backgroundColor: "#e06600",
  transform: "scale(1.05)", // Slight grow on hover
  boxShadow: "0 8px 20px rgba(255, 115, 0, 0.6)", // Enhanced shadow on hover
};
styles.button[":active"] = styles.buttonActive; // Ensure touch devices trigger active state
styles.backButton[":hover"] = {
  backgroundColor: "#5a6268",
  transform: "scale(1.02)", // Slight grow on hover
  boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)", // Enhanced shadow on hover
};
styles.backButton[":active"] = styles.backButtonActive; // Ensure touch devices trigger active state

// Creative animation for the card (optional subtle effect, won't work inline)
styles.card[":before"] = {
  content: '""',
  position: "absolute",
  top: "-50%",
  left: "-50%",
  width: "200%",
  height: "200%",
  background: "radial-gradient(circle, rgba(255, 115, 0, 0.1) 0%, transparent 70%)",
  animation: "rotate 15s linear infinite",
  zIndex: 0,
};
styles["@keyframes rotate"] = {
  "0%": { transform: "rotate(0deg)" },
  "100%": { transform: "rotate(360deg)" },
};

export default LandingPage;