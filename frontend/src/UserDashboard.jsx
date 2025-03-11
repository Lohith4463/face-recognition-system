import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const UserDashboard = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { employeeName = 'Unknown', employeeID = '' } = location.state || {};

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!employeeID) {
        console.error('No employeeID provided, redirecting to /login');
        navigate('/login');
        return;
      }

      console.log(`Fetching attendance for employeeID: ${employeeID}`);
      try {
        let url = `http://localhost:5000/api/attendance_records?employeeID=${employeeID}`;
        if (selectedDate) url += `&date=${selectedDate}`;
        else if (selectedMonth) url += `&month=${selectedMonth}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        console.log('Backend response:', data);

        if (data.success) {
          setAttendanceRecords(data.attendance_records || []);
        } else {
          throw new Error(data.error || 'Failed to fetch attendance records');
        }
      } catch (err) {
        console.error('Error fetching attendance:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [employeeID, navigate, selectedDate, selectedMonth]);

  const handleLogout = () => {
    console.log('Logging out, clearing state, navigating to /login');
    localStorage.removeItem('employeeID');
    navigate('/login', { replace: true });
  };

  // Calculate Heatmap and Streaks
  const getHeatmapData = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = selectedMonth ? new Date(selectedMonth).getMonth() : today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const heatmap = Array(daysInMonth).fill(0);

    attendanceRecords.forEach((record) => {
      const recordDate = new Date(record.date);
      if (recordDate.getMonth() === month && recordDate.getFullYear() === year && record.status === 'present') {
        const day = recordDate.getDate() - 1; // 0-based index
        heatmap[day] = 1; // 1 for present
      }
    });

    return heatmap;
  };

  const getStreaks = () => {
    const sortedRecords = attendanceRecords
      .filter((rec) => rec.status === 'present')
      .map((rec) => new Date(rec.date))
      .sort((a, b) => a - b);

    let currentStreak = 0;
    let longestStreak = 0;
    let prevDate = null;

    sortedRecords.forEach((date) => {
      if (prevDate) {
        const diffDays = Math.round((date - prevDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentStreak++;
        } else if (diffDays > 1) {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      longestStreak = Math.max(longestStreak, currentStreak);
      prevDate = date;
    });

    const today = new Date();
    const lastPresent = sortedRecords[sortedRecords.length - 1];
    const isTodayPresent = attendanceRecords.some(
      (rec) => rec.date === today.toISOString().split('T')[0] && rec.status === 'present'
    );
    if (lastPresent && !isTodayPresent) {
      const diffToToday = Math.round((today - lastPresent) / (1000 * 60 * 60 * 24));
      if (diffToToday > 1) currentStreak = 0;
    }

    return { currentStreak, longestStreak };
  };

  const heatmapData = getHeatmapData();
  const { currentStreak, longestStreak } = getStreaks();

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: 'clamp(10px, 2vw, 20px)', // Responsive padding
      fontFamily: "'Segoe UI', Arial, sans-serif",
      maxWidth: 'clamp(300px, 90%, 1200px)', // Responsive max width
      margin: '0 auto',
      boxSizing: 'border-box',
      width: '100%',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#ff7300',
      padding: 'clamp(10px, 2vw, 15px) clamp(15px, 3vw, 30px)', // Responsive padding
      borderRadius: 'clamp(8px, 2vw, 12px)', // Responsive border radius
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      marginBottom: 'clamp(10px, 2vw, 20px)',
    },
    logo: { maxWidth: 'clamp(60px, 5vw, 80px)', height: 'auto' }, // Responsive logo size
    title: {
      color: '#ffffff',
      fontSize: 'clamp(18px, 4vw, 28px)', // Responsive font size
      fontWeight: '600',
      margin: 0,
    },
    logoutButton: {
      padding: 'clamp(8px, 1.5vw, 10px) clamp(15px, 2vw, 20px)', // Responsive padding
      border: 'none',
      borderRadius: 'clamp(6px, 1.5vw, 8px)', // Responsive border radius
      backgroundColor: '#d9534f',
      color: '#ffffff',
      fontSize: 'clamp(12px, 2vw, 16px)', // Responsive font size
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    },
    infoCard: {
      backgroundColor: '#ffffff',
      padding: 'clamp(15px, 2vw, 20px)', // Responsive padding
      borderRadius: 'clamp(8px, 2vw, 12px)', // Responsive border radius
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      margin: 'clamp(10px, 2vw, 20px) 0',
      textAlign: 'center',
    },
    infoTitle: {
      color: '#ff7300',
      fontSize: 'clamp(16px, 2.5vw, 20px)', // Responsive font size
      fontWeight: '600',
      marginBottom: 'clamp(5px, 1vw, 10px)', // Responsive margin
    },
    infoText: {
      color: '#333',
      fontSize: 'clamp(14px, 2vw, 16px)', // Responsive font size
      margin: 'clamp(3px, 0.5vw, 5px) 0', // Responsive margin
    },
    filterContainer: {
      backgroundColor: '#ffffff',
      padding: 'clamp(10px, 2vw, 15px)', // Responsive padding
      borderRadius: 'clamp(8px, 2vw, 12px)', // Responsive border radius
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      margin: 'clamp(10px, 2vw, 20px) 0',
      display: 'flex',
      alignItems: 'center',
      gap: 'clamp(10px, 2vw, 20px)', // Responsive gap
      flexWrap: 'wrap',
    },
    filterLabel: {
      color: '#ff7300',
      fontSize: 'clamp(14px, 2vw, 16px)', // Responsive font size
      fontWeight: '600',
    },
    filterInput: {
      padding: 'clamp(6px, 1.5vw, 8px)', // Responsive padding
      borderRadius: 'clamp(6px, 1.5vw, 8px)', // Responsive border radius
      border: '1px solid #ddd',
      fontSize: 'clamp(12px, 2vw, 16px)', // Responsive font size
      width: 'clamp(150px, 25vw, 180px)', // Responsive width
    },
    tableContainer: {
      backgroundColor: '#ffffff',
      padding: 'clamp(15px, 2vw, 20px)', // Responsive padding
      borderRadius: 'clamp(8px, 2vw, 12px)', // Responsive border radius
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      margin: 'clamp(10px, 2vw, 20px) 0',
      overflowX: 'auto',
    },
    statsWrapper: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 'clamp(10px, 2vw, 20px)', // Responsive gap
      margin: 'clamp(10px, 2vw, 20px) 0',
      flexWrap: 'wrap',
    },
    heatmapContainer: {
      backgroundColor: '#ffffff',
      padding: 'clamp(10px, 2vw, 15px)', // Responsive padding
      borderRadius: 'clamp(8px, 2vw, 12px)', // Responsive border radius
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      flex: '1',
      minWidth: 'clamp(250px, 40vw, 300px)', // Responsive min width
    },
    streaksContainer: {
      backgroundColor: '#ffffff',
      padding: 'clamp(10px, 2vw, 15px)', // Responsive padding
      borderRadius: 'clamp(8px, 2vw, 12px)', // Responsive border radius
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      flex: '1',
      minWidth: 'clamp(250px, 40vw, 300px)', // Responsive min width
      textAlign: 'center',
    },
    sectionTitle: {
      color: '#ff7300',
      fontSize: 'clamp(14px, 2.5vw, 18px)', // Responsive font size
      fontWeight: '600',
      marginBottom: 'clamp(10px, 2vw, 15px)', // Responsive margin
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: {
      backgroundColor: '#ff7300',
      color: '#ffffff',
      padding: 'clamp(8px, 1.5vw, 12px)', // Responsive padding
      textAlign: 'left',
      fontWeight: '600',
      fontSize: 'clamp(12px, 2vw, 16px)', // Responsive font size
      borderBottom: '2px solid #e65c00',
    },
    td: {
      padding: 'clamp(8px, 1.5vw, 12px)', // Responsive padding
      borderBottom: '1px solid #ddd',
      color: '#333',
      fontSize: 'clamp(12px, 2vw, 15px)', // Responsive font size
    },
    tr: { transition: 'background-color 0.3s' },
    error: { color: '#d9534f', fontSize: 'clamp(14px, 2vw, 16px)', textAlign: 'center', padding: 'clamp(8px, 1.5vw, 10px)' },
    loading: { color: '#ff7300', fontSize: 'clamp(14px, 2vw, 16px)', textAlign: 'center', padding: 'clamp(8px, 1.5vw, 10px)' },
    noData: { color: '#d9534f', fontSize: 'clamp(14px, 2vw, 16px)', textAlign: 'center', padding: 'clamp(8px, 1.5vw, 10px)' },
    heatmapGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)', // 7 days per week
      gap: 'clamp(2px, 0.5vw, 3px)', // Responsive gap
      maxWidth: 'clamp(200px, 40vw, 280px)', // Responsive width
      margin: '0 auto',
    },
    heatmapDay: {
      width: 'clamp(15px, 3vw, 20px)', // Responsive size
      height: 'clamp(15px, 3vw, 20px)', // Responsive size
      borderRadius: 'clamp(3px, 0.8vw, 4px)', // Responsive border radius
      cursor: 'pointer',
      border: '1px solid #e9ecef',
      transition: 'all 0.2s ease',
    },
    streakItem: {
      margin: 'clamp(8px, 1.5vw, 10px) 0', // Responsive margin
    },
    streakLabel: {
      color: '#555',
      fontSize: 'clamp(12px, 2vw, 14px)', // Responsive font size
      fontWeight: '500',
    },
    streakValue: {
      fontSize: 'clamp(16px, 2.5vw, 20px)', // Responsive font size
      fontWeight: '700',
      color: '#28a745',
      backgroundColor: '#e9f7ef',
      padding: 'clamp(4px, 1vw, 5px) clamp(8px, 1.5vw, 10px)', // Responsive padding
      borderRadius: 'clamp(4px, 1vw, 6px)', // Responsive border radius
      display: 'inline-block',
      marginTop: 'clamp(4px, 0.8vw, 5px)', // Responsive margin
    },
    footer: {
      marginTop: 'clamp(20px, 3vw, 30px)', // Responsive margin
      textAlign: 'center',
      color: '#666',
      fontSize: 'clamp(12px, 2vw, 14px)', // Responsive font size
      padding: 'clamp(8px, 1.5vw, 10px)', // Responsive padding
    },
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <img src="/logo1.png" alt="Logo" style={styles.logo} />
        <h1 style={styles.title}>Welcome, {employeeName}!</h1>
        <button
          style={styles.logoutButton}
          onClick={handleLogout}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#c9302c')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#d9534f')}
        >
          Logout
        </button>
      </header>

      <div style={styles.infoCard}>
        <h3 style={styles.infoTitle}>Your Details</h3>
        <p style={styles.infoText}>Employee ID: {employeeID}</p>
        <p style={styles.infoText}>Name: {employeeName}</p>
      </div>

      {error && <p style={styles.error}>Error: {error}</p>}

      <div style={styles.filterContainer}>
        <label style={styles.filterLabel}>Filter by Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setSelectedMonth('');
          }}
          style={styles.filterInput}
        />
        <label style={styles.filterLabel}>Filter by Month:</label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => {
            setSelectedMonth(e.target.value);
            setSelectedDate('');
          }}
          style={styles.filterInput}
        />
      </div>

      {/* Side-by-Side Heatmap and Streaks */}
      <div style={styles.statsWrapper}>
        {/* Heatmap */}
        <div style={styles.heatmapContainer}>
          <h2 style={styles.sectionTitle}>
            Heatmap ({selectedMonth || new Date().toLocaleString('default', { month: 'long', year: 'numeric' })})
          </h2>
          {loading ? (
            <p style={styles.loading}>Loading...</p>
          ) : heatmapData.length === 0 ? (
            <p style={styles.noData}>No data</p>
          ) : (
            <div style={styles.heatmapGrid}>
              {heatmapData.map((value, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.heatmapDay,
                    backgroundColor: value === 1 ? '#28a745' : '#f1f3f5',
                    transform: value === 1 ? 'scale(1.05)' : 'scale(1)',
                  }}
                  title={`${index + 1}: ${value === 1 ? 'Present' : 'Absent'}`}
                  onMouseOver={(e) => (e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)')}
                  onMouseOut={(e) => (e.currentTarget.style.boxShadow = 'none')}
                />
              ))}
            </div>
          )}
        </div>

        {/* Streaks */}
        <div style={styles.streaksContainer}>
          <h2 style={styles.sectionTitle}>Streaks</h2>
          {loading ? (
            <p style={styles.loading}>Loading...</p>
          ) : (
            <div>
              <div style={styles.streakItem}>
                <p style={styles.streakLabel}>Current Streak</p>
                <p style={styles.streakValue}>{currentStreak} days</p>
              </div>
              <div style={styles.streakItem}>
                <p style={styles.streakLabel}>Longest Streak</p>
                <p style={styles.streakValue}>{longestStreak} days</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Attendance Table */}
      <div style={styles.tableContainer}>
        <h2 style={styles.sectionTitle}>Your Attendance History</h2>
        {loading ? (
          <p style={styles.loading}>Loading attendance...</p>
        ) : attendanceRecords.length === 0 ? (
          <p style={styles.noData}>No attendance records found.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>In Time</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Late Time</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map((record, index) => (
                <tr
                  key={index}
                  style={styles.tr}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '')}
                >
                  <td style={styles.td}>{record.date}</td>
                  <td style={styles.td}>{record.inTime || 'N/A'}</td>
                  <td style={styles.td}>{record.status}</td>
                  <td style={styles.td}>{record.lateTime || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <footer style={styles.footer}>
        <p>Face Recognition System © 2025 | User Dashboard</p>
      </footer>
    </div>
  );
};

export default UserDashboard;