import React from "react";
import { useNavigate } from "react-router-dom";

const MainPage = () => {
  const navigate = useNavigate();

  const handleEmployeeLogin = () => {
    navigate("/login");
  };

  const handleBack = () => navigate(-1);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Welcome to the Face Recognition System</h1>
        <button onClick={handleBack} style={styles.backButton}>
          Back
        </button>
      </header>

      <main style={styles.main}>
        <div style={styles.card}>
          <div style={styles.cardContent}>
            <img
              src="/logo2.png"
              alt="Aditya University Logo"
              style={styles.cardLogo}
            />
            <div style={styles.buttonWrapper}>
              <button onClick={() => navigate("/admin")} style={styles.button}>
                Admin Registration
              </button>
              <button onClick={handleEmployeeLogin} style={styles.button}>
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
    backgroundColor: "#fffaf0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px",
    fontFamily: "'Arial', sans-serif",
    boxSizing: "border-box",
    width: "100%",
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
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
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
    transition: "background-color 0.3s, transform 0.1s",
    marginLeft: "10px",
  },
  main: {
    flex: "1 1 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: "60px", // Adjusted for fixed header
    padding: "20px 0",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "15px",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "450px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "clamp(20px, 5vw, 40px)",
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
    transition: "background-color 0.3s, transform 0.1s",
    width: "100%",
  },
  footer: {
    padding: "15px",
    textAlign: "center",
    color: "#666",
    fontSize: "clamp(12px, 2vw, 14px)",
    width: "100%",
  },
};

// Hover and focus effects
styles.button["&:hover"] = { backgroundColor: "#e06600", transform: "scale(1.02)" };
styles.button["&:active"] = { transform: "scale(0.98)" };
styles.backButton["&:hover"] = { backgroundColor: "#5a6268", transform: "scale(1.02)" };
styles.backButton["&:active"] = { transform: "scale(0.98)" };

// Media queries for responsiveness
const mediaQueries = `
  @media (max-width: 768px) {
    ${styles.header} {
      padding: 10px 15px;
    }
    ${styles.headerTitle} {
      font-size: clamp(16px, 4vw, 20px);
    }
    ${styles.backButton} {
      padding: 8px 12px;
      font-size: clamp(12px, 3vw, 14px);
    }
    ${styles.card} {
      padding: clamp(15px, 4vw, 20px);
    }
    ${styles.cardLogo} {
      margin-bottom: clamp(10px, 3vw, 15px);
    }
    ${styles.button} {
      padding: clamp(8px, 2vw, 10px);
      font-size: clamp(12px, 3vw, 14px);
    }
    ${styles.footer} {
      padding: 10px;
      font-size: clamp(10px, 2vw, 12px);
    }
  }

  @media (max-width: 480px) {
    ${styles.header} {
      flex-direction: column;
      gap: 10px;
    }
    ${styles.headerTitle} {
      font-size: clamp(14px, 4vw, 18px);
    }
    ${styles.backButton} {
      width: 100%;
      margin-left: 0;
    }
    ${styles.card} {
      max-width: 90%;
    }
    ${styles.buttonWrapper} {
      max-width: 100%;
    }
  }
`;

// Inject media queries into the document
const styleSheet = document.createElement("style");
styleSheet.textContent = mediaQueries;
document.head.appendChild(styleSheet);

export default MainPage;