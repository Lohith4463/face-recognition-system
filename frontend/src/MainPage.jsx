import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MainPage.css"; // Import CSS for animations

const MainPage = () => {
  const [buttonActive, setButtonActive] = useState(null); // Track active button
  const navigate = useNavigate();

  const handleEmployeeLogin = () => {
    setButtonActive("employee");
    navigate("/login");
    setTimeout(() => setButtonActive(null), 300);
  };

  const handleAdminLogin = () => {
    setButtonActive("admin");
    navigate("/admin");
    setTimeout(() => setButtonActive(null), 300);
  };

  const handleBack = () => {
    setButtonActive("back");
    navigate(-1);
    setTimeout(() => setButtonActive(null), 300);
  };

  // Card entrance animation trigger
  useEffect(() => {
    const card = document.querySelector(".dynamic-card");
    if (card) {
      card.classList.add("animate-in");
    }
  }, []);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Welcome to the Face Recognition System</h1>
        <button
          onClick={handleBack}
          style={{
            ...styles.backButton,
            ...(buttonActive === "back" ? styles.buttonActive : {}),
          }}
        >
          Back
        </button>
      </header>

      <main style={styles.main}>
        <div style={styles.card} className="dynamic-card">
          <div style={styles.cardContent}>
            <img
              src="/logo2.png"
              alt="Aditya University Logo"
              style={styles.cardLogo}
            />
            <div style={styles.buttonWrapper}>
              <button
                onClick={handleAdminLogin}
                style={{
                  ...styles.button,
                  ...(buttonActive === "admin" ? styles.buttonActive : {}),
                }}
              >
                Admin Registration
              </button>
              <button
                onClick={handleEmployeeLogin}
                style={{
                  ...styles.button,
                  ...(buttonActive === "employee" ? styles.buttonActive : {}),
                }}
              >
                Employee Login
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer style={styles.footer}>
        <p>Face Recognition System © 2025 | Main Page</p>
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
    justifyContent: "space-between",
    padding: "20px",
    fontFamily: "'Arial', sans-serif",
    boxSizing: "border-box",
    width: "100%",
    position: "relative",
    overflow: "hidden",
    transition: "background 1s ease",
  },
  header: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffedd5",
    padding: "15px 20px",
    borderBottom: "2px solid #ff7300",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
    width: "100%",
    zIndex: 1000,
  },
  headerTitle: {
    color: "#ff7300",
    fontSize: "clamp(18px, 4vw, 24px)",
    fontWeight: "bold",
    margin: 0,
    flexGrow: 1,
    textAlign: "center",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    textShadow: "1px 1px 3px rgba(255, 115, 0, 0.3)",
  },
  backButton: {
    padding: "10px 15px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#6c757d",
    color: "#ffffff",
    fontSize: "clamp(14px, 3vw, 16px)",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s, transform 0.3s, box-shadow 0.3s",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    marginLeft: "10px",
  },
  main: {
    flex: "1 1 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: "60px",
    padding: "20px 0",
    position: "relative",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "15px",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1), 0 0 20px rgba(255, 115, 0, 0.2)",
    width: "100%",
    maxWidth: "450px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "clamp(20px, 5vw, 40px)",
    transition: "transform 0.5s ease, box-shadow 0.3s ease",
  },
  cardContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
  cardLogo: {
    width: "clamp(120px, 30vw, 180px)",
    height: "auto",
    marginBottom: "clamp(15px, 4vw, 30px)",
    display: "block",
    transition: "transform 0.3s ease",
  },
  buttonWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "clamp(10px, 3vw, 20px)",
    width: "100%",
    maxWidth: "300px",
  },
  button: {
    padding: "clamp(10px, 2.5vw, 14px)",
    border: "none",
    borderRadius: "10px",
    backgroundColor: "#ff7300",
    color: "#ffffff",
    fontSize: "clamp(14px, 3vw, 16px)",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s, transform 0.3s, box-shadow 0.3s",
    width: "100%",
    boxShadow: "0 4px 10px rgba(255, 115, 0, 0.4)",
  },
  buttonActive: {
    transform: "scale(0.95) translateY(2px)",
    boxShadow: "0 2px 6px rgba(255, 69, 0, 0.5)",
    backgroundColor: "#ff4500",
  },
  footer: {
    padding: "15px",
    textAlign: "center",
    color: "#666",
    fontSize: "clamp(12px, 2vw, 14px)",
    width: "100%",
    textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
  },
};

// Hover and active effects
styles.button["&:hover"] = {
  backgroundColor: "#007bff", // Blue on hover for main buttons
  transform: "scale(1.05)",
  boxShadow: "0 6px 15px rgba(0, 123, 255, 0.6)", // Blue shadow
};
styles.button["&:active"] = styles.buttonActive;
styles.backButton["&:hover"] = {
  backgroundColor: "#007bff", // Blue on hover for Back button
  transform: "scale(1.05)",
  boxShadow: "0 6px 12px rgba(0, 123, 255, 0.6)", // Blue shadow
};
styles.backButton["&:active"] = {
  transform: "scale(0.95) translateY(2px)",
  boxShadow: "0 2px 6px rgba(73, 80, 87, 0.5)",
  backgroundColor: "#343a40", // Keep dark gray on touch
};
styles.card["&:hover"] = {
  transform: "translateY(-5px)",
  boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15), 0 0 30px rgba(255, 115, 0, 0.3)",
};
styles.cardLogo["&:hover"] = {
  transform: "scale(1.1)",
};

export default MainPage;