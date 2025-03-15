import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [loginID, setLoginID] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cardVisible, setCardVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false); // For container hover effect
  const navigate = useNavigate();

  // Trigger card entrance animation on mount
  useEffect(() => {
    setCardVisible(true);
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    setMessage("");
    if (loginID === "admin" && password === "admin123") {
      setTimeout(() => {
        setMessage("Default admin login successful");
        setIsLoggedIn(true);
        setIsLoading(false);
      }, 1000);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmployeeRegistration = () => navigate("/admin-registration");
  const handleAdminDashboard = () => navigate("/admin-dashboard");
  const handleBack = () => navigate(-1);

  return (
    <div
      style={{
        ...styles.container,
        background: isHovered
          ? "linear-gradient(135deg, #ffe6cc, #fffaf0)"
          : "linear-gradient(135deg, #fffaf0, #ffe6cc)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Admin Login</h1>
        <button
          onClick={handleBack}
          style={{
            ...styles.backButton,
            ...(isLoading ? styles.buttonDisabled : {}),
          }}
          disabled={isLoading}
        >
          Back
        </button>
      </header>

      <div
        style={{
          ...styles.card,
          transform: cardVisible
            ? "translateY(0) rotate(0deg) scale(1)"
            : "translateY(20px) rotate(2deg) scale(0.95)",
          opacity: cardVisible ? 1 : 0,
          transition: "transform 0.5s ease-out, opacity 0.5s ease-out",
        }}
      >
        <img src="/logo1.png" alt="Aditya University Logo" style={styles.cardLogo} />
        {!isLoggedIn ? (
          <div style={styles.form}>
            <label style={styles.label}>Login ID:</label>
            <input
              type="text"
              placeholder="Enter Login ID"
              value={loginID}
              onChange={(e) => setLoginID(e.target.value)}
              style={{
                ...styles.input,
                ...(loginID ? styles.inputFilled : {}),
              }}
              disabled={isLoading}
            />
            <label style={styles.label}>Password:</label>
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                ...styles.input,
                ...(password ? styles.inputFilled : {}),
              }}
              disabled={isLoading}
            />
            <button
              onClick={handleLogin}
              style={{
                ...styles.button,
                ...(isLoading ? styles.buttonLoading : {}),
              }}
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
            {message && (
              <p
                style={{
                  ...styles.message,
                  color: message.includes("successful") ? "#28a745" : "#d9534f",
                  transform: message ? "scale(1) translateY(0)" : "scale(0.9) translateY(5px)",
                  transition: "transform 0.3s ease, color 0.3s ease",
                }}
              >
                {message}
              </p>
            )}
          </div>
        ) : (
          <div style={styles.buttonGroup}>
            <button
              onClick={handleEmployeeRegistration}
              style={{
                ...styles.button,
                ...styles.employeeButton,
              }}
            >
              Employee Registration
            </button>
            <button
              onClick={handleAdminDashboard}
              style={{
                ...styles.button,
                ...styles.dashboardButton,
              }}
            >
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
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "'Arial', sans-serif",
    transition: "background 0.5s ease",
  },
  header: {
    position: "fixed",
    top: "0",
    left: "0",
    right: "0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffedd5",
    padding: "15px 30px",
    borderBottom: "2px solid #ff7300",
    boxShadow: "0 4px 12px rgba(255, 115, 0, 0.3)", // Enhanced shadow
    zIndex: 1000,
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  headerTitle: {
    color: "#ff7300",
    fontSize: "24px",
    fontWeight: "bold",
    margin: 0,
    flexGrow: 1,
    textAlign: "center",
    textShadow: "1px 1px 4px rgba(255, 115, 0, 0.5)",
    transition: "transform 0.3s ease, color 0.3s ease",
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
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 6px 15px rgba(0, 0, 0, 0.1), 0 0 25px rgba(255, 115, 0, 0.3)",
    width: "100%",
    maxWidth: "400px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "80px",
    transition: "box-shadow 0.3s ease, transform 0.3s ease",
  },
  cardLogo: {
    width: "300px",
    height: "200px",
    marginBottom: "20px",
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    transition: "transform 0.4s ease",
  },
  form: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  label: {
    color: "#ff7300",
    fontSize: "16px",
    fontWeight: "bold",
    marginBottom: "5px",
    transition: "transform 0.3s ease, color 0.3s ease",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "2px solid #ddd", // Thicker border
    fontSize: "16px",
    transition: "border-color 0.3s, box-shadow 0.3s, transform 0.3s",
    backgroundColor: "#fffaf0", // Light orange tint
  },
  inputFilled: {
    borderColor: "#ff7300",
    boxShadow: "0 0 8px rgba(255, 115, 0, 0.4)",
  },
  button: {
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#ff7300",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s, transform 0.3s, box-shadow 0.3s",
    width: "100%",
    boxShadow: "0 4px 12px rgba(255, 115, 0, 0.5)",
  },
  buttonLoading: {
    backgroundColor: "#e06600",
    cursor: "not-allowed",
    transform: "scale(1)",
    boxShadow: "0 2px 6px rgba(255, 115, 0, 0.5)",
  },
  buttonDisabled: {
    backgroundColor: "#5a6268",
    cursor: "not-allowed",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
  },
  employeeButton: {
    transition: "background-color 0.3s, transform 0.3s, box-shadow 0.3s",
  },
  dashboardButton: {
    transition: "background-color 0.3s, transform 0.3s, box-shadow 0.3s",
  },
  buttonGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    width: "100%",
  },
  message: {
    fontSize: "14px",
    textAlign: "center",
    marginTop: "10px",
    transition: "transform 0.3s ease, color 0.3s ease",
  },
  footer: {
    marginTop: "auto",
    padding: "20px",
    textAlign: "center",
    color: "#666",
    fontSize: "14px",
    textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
    transition: "color 0.3s ease, transform 0.3s ease",
  },
};

// Hover and focus effects
styles.input[":focus"] = {
  borderColor: "#ff7300",
  boxShadow: "0 0 10px rgba(255, 115, 0, 0.6)",
  transform: "scale(1.03)", // Slight lift
  outline: "none",
};
styles.input[":hover"] = {
  transform: "scale(1.03)",
  borderColor: "#ff7300",
  boxShadow: "0 0 5px rgba(255, 115, 0, 0.4)",
};
styles.button[":hover"] = {
  backgroundColor: "#e06600", // Darker orange
  transform: "scale(1.05) rotate(2deg)", // Wobble
  boxShadow: "0 6px 18px rgba(255, 115, 0, 0.7)",
};
styles.button[":active"] = {
  transform: "scale(0.95) rotate(0deg)",
  backgroundColor: "#cc5c00", // Even darker orange
  boxShadow: "0 2px 6px rgba(255, 115, 0, 0.5)",
};
styles.backButton[":hover"] = {
  backgroundColor: "#5a6268",
  transform: "scale(1.05) rotate(-2deg)", // Opposite wobble
  boxShadow: "0 6px 15px rgba(90, 98, 104, 0.6)",
};
styles.backButton[":active"] = {
  transform: "scale(0.95) rotate(0deg)",
  backgroundColor: "#495057",
  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
};
styles.card[":hover"] = {
  boxShadow: "0 12px 25px rgba(0, 0, 0, 0.15), 0 0 35px rgba(255, 115, 0, 0.4)",
  transform: "translateY(-5px)", // Lift effect
};
styles.cardLogo[":hover"] = {
  transform: "scale(1.1) rotate(5deg)", // Playful spin
};
styles.header[":hover"] = {
  transform: "translateY(-2px)", // Slight lift
  boxShadow: "0 6px 15px rgba(255, 115, 0, 0.4)",
};
styles.headerTitle[":hover"] = {
  transform: "scale(1.05)", // Pop effect
  color: "#e06600", // Darker orange
};
styles.label[":hover"] = {
  transform: "translateX(5px)", // Slide effect
  color: "#e06600",
};
styles.employeeButton[":hover"] = {
  backgroundColor: "#ff7300", // Back to orange for consistency
  transform: "scale(1.05) rotate(3deg)", // More pronounced wobble
  boxShadow: "0 6px 18px rgba(255, 115, 0, 0.7)",
};
styles.employeeButton[":active"] = {
  transform: "scale(0.95) rotate(0deg)",
  backgroundColor: "#cc5c00",
  boxShadow: "0 2px 6px rgba(255, 115, 0, 0.5)",
};
styles.dashboardButton[":hover"] = {
  backgroundColor: "#ff7300", // Back to orange
  transform: "scale(1.05) rotate(-3deg)", // Opposite wobble
  boxShadow: "0 6px 18px rgba(255, 115, 0, 0.7)",
};
styles.dashboardButton[":active"] = {
  transform: "scale(0.95) rotate(0deg)",
  backgroundColor: "#cc5c00",
  boxShadow: "0 2px 6px rgba(255, 115, 0, 0.5)",
};
styles.footer[":hover"] = {
  color: "#ff7300", // Orange text
  transform: "translateY(-2px)", // Lift
};

export default AdminLogin;