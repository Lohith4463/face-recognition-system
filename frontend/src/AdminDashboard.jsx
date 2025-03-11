import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [updatingEmployee, setUpdatingEmployee] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [updateData, setUpdateData] = useState({ employeeName: '', email: '', department: '', faceImage: null });
  const [showEmployeeList, setShowEmployeeList] = useState(false);
  
  // State for In Time threshold
  const [inTimeThreshold, setInTimeThreshold] = useState('09:30'); // Initial default
  const [isUpdatingInTime, setIsUpdatingInTime] = useState(false);

  const navigate = useNavigate();

  // Fetch the current In Time threshold from the backend
  const fetchInTimeThreshold = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/in-time', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      if (data.success) {
        setInTimeThreshold(data.inTimeThreshold);
      } else {
        throw new Error(data.error || 'Failed to fetch In Time threshold');
      }
    } catch (err) {
      console.error('Error fetching In Time threshold:', err);
      setError(err.message || 'Network or server issue');
    }
  };

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    try {
      let url = 'http://localhost:5000/api/employees';
      if (selectedDate) url += `?date=${selectedDate}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      console.log('Employees fetched:', data);

      if (data.success) {
        setEmployees(data.employees || []);
        const now = new Date();
        if (!selectedDate && now.getHours() >= 12) {
          for (const emp of data.employees) {
            if (emp.status === 'not_marked') {
              await fetch('http://localhost:5000/api/mark_absent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ employeeID: emp.employee_id }),
              });
            }
          }
          const updatedResponse = await fetch('http://localhost:5000/api/employees', {
            headers: { 'Content-Type': 'application/json' },
          });
          const updatedData = await updatedResponse.json();
          if (updatedData.success) setEmployees(updatedData.employees || []);
        }
      } else {
        throw new Error(data.error || 'Failed to fetch employees');
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(err.message || 'Network or server issue');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // Fetch In Time threshold and employees on mount
  useEffect(() => {
    fetchInTimeThreshold();
    fetchEmployees();
  }, [fetchEmployees]);

  // Update In Time threshold
  const handleUpdateInTime = async () => {
    try {
      setIsUpdatingInTime(true);
      const response = await fetch('http://localhost:5000/api/update-in-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inTimeThreshold }),
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      if (data.success) {
        alert(data.message); // Pop-up confirmation
        fetchEmployees(); // Refresh employee list to reflect updated lateTime
      } else {
        throw new Error(data.error || 'Failed to update In Time');
      }
    } catch (err) {
      console.error('Error updating In Time:', err);
      alert(`Failed to update In Time: ${err.message}`);
    } finally {
      setIsUpdatingInTime(false);
    }
  };

  const handleLogout = () => {
    console.log('Admin logging out, navigating to /login');
    localStorage.removeItem('isAdmin');
    navigate('/login', { replace: true });
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleUpdateClick = (emp) => {
    setUpdatingEmployee(emp);
    setUpdateData({ employeeName: emp.employee_name, email: emp.email, department: emp.department || '', faceImage: null });
    setOtpSent(false);
    setOtp('');
  };

  const handleSendOtp = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/send-update-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ employeeID: updatingEmployee.employee_id, email: updatingEmployee.email }),
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      if (data.success) {
        setOtpSent(true);
        alert('OTP sent to employee email');
      } else {
        throw new Error(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Error sending OTP:', err);
      alert(`Failed to send OTP: ${err.message}`);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('employeeID', updatingEmployee.employee_id);
    formData.append('otp', otp);
    formData.append('employeeName', updateData.employeeName);
    formData.append('email', updateData.email);
    formData.append('department', updateData.department);
    if (updateData.faceImage) formData.append('faceImage', updateData.faceImage);

    try {
      const response = await fetch('http://localhost:5000/api/update-employee', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      if (data.success) {
        alert('Employee updated successfully');
        setEmployees(
          employees.map((emp) =>
            emp.employee_id === updatingEmployee.employee_id
              ? { ...emp, employee_name: updateData.employeeName, email: updateData.email, department: updateData.department }
              : emp
          )
        );
        setUpdatingEmployee(null);
        setOtpSent(false);
        setOtp('');
      } else {
        throw new Error(data.error || 'Failed to update employee');
      }
    } catch (err) {
      console.error('Error updating employee:', err);
      alert(`Failed to update employee: ${err.message}`);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const presentCount = employees.filter((emp) => emp.status === 'present' && emp.inTime !== 'N/A').length;
  const absentCount = employees.filter((emp) => emp.status === 'absent').length;

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: 'clamp(10px, 2vw, 20px)',
      fontFamily: "'Segoe UI', Arial, sans-serif",
      width: '100%',
      margin: '0 auto',
      boxSizing: 'border-box',
    },
    header: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#ff7300',
      padding: 'clamp(10px, 2vw, 15px) clamp(15px, 3vw, 30px)',
      borderRadius: '0 0 clamp(6px, 1.5vw, 12px) clamp(6px, 1.5vw, 12px)',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
    },
    logo: { maxWidth: 'clamp(60px, 5vw, 80px)', height: 'auto' },
    title: { 
      color: '#ffffff', 
      fontSize: 'clamp(18px, 3vw, 28px)', 
      fontWeight: '600', 
      margin: 0,
      flexGrow: 1,
      textAlign: 'center',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    buttonGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: 'clamp(5px, 1vw, 10px)',
    },
    logoutButton: {
      padding: 'clamp(8px, 1.5vw, 10px) clamp(15px, 2vw, 20px)',
      border: 'none',
      borderRadius: '8px',
      backgroundColor: '#d9534f',
      color: '#ffffff',
      fontSize: 'clamp(12px, 2vw, 16px)',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    },
    backButton: {
      padding: 'clamp(8px, 1.5vw, 10px) clamp(15px, 2vw, 20px)',
      border: 'none',
      borderRadius: '8px',
      backgroundColor: '#6c757d',
      color: '#ffffff',
      fontSize: 'clamp(12px, 2vw, 16px)',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    },
    employeeListButton: {
      padding: 'clamp(8px, 1.5vw, 10px) clamp(15px, 2vw, 20px)',
      border: 'none',
      borderRadius: '8px',
      backgroundColor: '#007bff',
      color: '#ffffff',
      fontSize: 'clamp(12px, 2vw, 16px)',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    },
    statsContainer: {
      display: 'flex',
      justifyContent: 'space-around',
      margin: 'clamp(20px, 3vw, 30px) 0',
      flexWrap: 'wrap',
      gap: 'clamp(10px, 2vw, 20px)',
      marginTop: '80px', // Space for fixed header
    },
    statCard: {
      backgroundColor: '#ffffff',
      padding: 'clamp(15px, 2vw, 20px)',
      borderRadius: 'clamp(6px, 1.5vw, 12px)',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
      width: 'clamp(180px, 25%, 28%)',
      textAlign: 'center',
      minWidth: '150px',
    },
    statTitle: { 
      color: '#ff7300', 
      fontSize: 'clamp(16px, 2vw, 20px)', 
      fontWeight: '600', 
      marginBottom: 'clamp(5px, 1vw, 10px)' 
    },
    statValue: { 
      color: '#333', 
      fontSize: 'clamp(24px, 3vw, 36px)', 
      fontWeight: '700' 
    },
    inTimeContainer: {
      backgroundColor: '#ffffff',
      padding: 'clamp(10px, 2vw, 15px)',
      borderRadius: 'clamp(6px, 1.5vw, 12px)',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
      margin: 'clamp(15px, 2vw, 20px) 0',
      display: 'flex',
      alignItems: 'center',
      gap: 'clamp(10px, 2vw, 20px)',
      flexWrap: 'wrap',
    },
    filterContainer: {
      backgroundColor: '#ffffff',
      padding: 'clamp(10px, 2vw, 15px)',
      borderRadius: 'clamp(6px, 1.5vw, 12px)',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
      margin: 'clamp(15px, 2vw, 20px) 0',
      display: 'flex',
      alignItems: 'center',
      gap: 'clamp(10px, 2vw, 20px)',
      flexWrap: 'wrap',
    },
    label: { 
      color: '#ff7300', 
      fontSize: 'clamp(14px, 2vw, 16px)', 
      fontWeight: '600' 
    },
    input: {
      padding: 'clamp(6px, 1.5vw, 8px)',
      borderRadius: 'clamp(6px, 1.5vw, 8px)',
      border: '1px solid #ddd',
      fontSize: 'clamp(14px, 2vw, 16px)',
      width: 'clamp(150px, 20vw, 180px)',
      boxSizing: 'border-box',
    },
    updateButton: {
      padding: 'clamp(8px, 1.5vw, 10px) clamp(15px, 2vw, 20px)',
      border: 'none',
      borderRadius: '8px',
      backgroundColor: '#28a745',
      color: '#ffffff',
      fontSize: 'clamp(12px, 2vw, 16px)',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    },
    tableContainer: {
      backgroundColor: '#ffffff',
      padding: 'clamp(15px, 2vw, 20px)',
      borderRadius: 'clamp(6px, 1.5vw, 12px)',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
      marginBottom: 'clamp(15px, 2vw, 20px)',
      overflowX: 'auto',
    },
    employeeListContainer: {
      backgroundColor: '#ffffff',
      padding: 'clamp(15px, 2vw, 20px)',
      borderRadius: 'clamp(6px, 1.5vw, 12px)',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
      marginBottom: 'clamp(15px, 2vw, 20px)',
      overflowX: 'auto',
    },
    sectionTitle: {
      color: '#ff7300',
      fontSize: 'clamp(18px, 2.5vw, 24px)',
      fontWeight: '600',
      marginBottom: 'clamp(15px, 2vw, 20px)',
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: {
      backgroundColor: '#ff7300',
      color: '#ffffff',
      padding: 'clamp(8px, 1.5vw, 12px)',
      textAlign: 'left',
      fontWeight: '600',
      fontSize: 'clamp(12px, 1.8vw, 16px)',
      borderBottom: '2px solid #e65c00',
    },
    td: { 
      padding: 'clamp(8px, 1.5vw, 12px)', 
      borderBottom: '1px solid #ddd', 
      color: '#333', 
      fontSize: 'clamp(12px, 1.8vw, 15px)' 
    },
    tr: { transition: 'background-color 0.3s' },
    error: { 
      color: '#d9534f', 
      fontSize: 'clamp(14px, 2vw, 18px)', 
      textAlign: 'center', 
      padding: 'clamp(15px, 2vw, 20px)' 
    },
    loading: { 
      color: '#ff7300', 
      fontSize: 'clamp(14px, 2vw, 18px)', 
      textAlign: 'center', 
      padding: 'clamp(15px, 2vw, 20px)' 
    },
    noData: { 
      color: '#d9534f', 
      fontSize: 'clamp(14px, 2vw, 18px)', 
      textAlign: 'center', 
      padding: 'clamp(15px, 2vw, 20px)' 
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: '#ffffff',
      padding: 'clamp(15px, 2vw, 20px)',
      borderRadius: 'clamp(6px, 1.5vw, 12px)',
      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      width: 'clamp(300px, 80%, 400px)',
      maxWidth: '90vw',
      maxHeight: '90vh',
      overflowY: 'auto',
    },
    formLabel: {
      color: '#ff7300',
      fontSize: 'clamp(12px, 1.8vw, 16px)',
      fontWeight: '600',
      marginBottom: 'clamp(5px, 1vw, 10px)',
      display: 'block',
    },
    formInput: {
      width: '100%',
      padding: 'clamp(6px, 1.5vw, 8px)',
      marginBottom: 'clamp(5px, 1vw, 10px)',
      borderRadius: 'clamp(6px, 1.5vw, 8px)',
      border: '1px solid #ddd',
      fontSize: 'clamp(12px, 1.8vw, 16px)',
      boxSizing: 'border-box',
    },
    submitButton: {
      padding: 'clamp(8px, 1.5vw, 10px) clamp(15px, 2vw, 20px)',
      border: 'none',
      borderRadius: '8px',
      backgroundColor: '#28a745',
      color: '#ffffff',
      cursor: 'pointer',
      marginRight: 'clamp(5px, 1vw, 10px)',
      transition: 'background-color 0.3s',
    },
    cancelButton: {
      padding: 'clamp(8px, 1.5vw, 10px) clamp(15px, 2vw, 20px)',
      border: 'none',
      borderRadius: '8px',
      backgroundColor: '#d9534f',
      color: '#ffffff',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    },
    footer: {
      marginTop: 'clamp(20px, 3vw, 30px)',
      textAlign: 'center',
      color: '#666',
      fontSize: 'clamp(12px, 1.8vw, 14px)',
      padding: 'clamp(10px, 2vw, 15px)',
      width: '100%',
    },
  };

  // Media queries for responsiveness
  const mediaQueries = `
    @media (max-width: 768px) {
      ${styles.header} {
        padding: clamp(8px, 2vw, 10px) clamp(10px, 2vw, 15px);
        flex-direction: column;
        gap: clamp(5px, 1vw, 10px);
      }
      ${styles.title} {
        font-size: clamp(16px, 3vw, 20px);
      }
      ${styles.buttonGroup} {
        flex-direction: column;
        width: 100%;
        gap: clamp(5px, 1vw, 10px);
      }
      ${styles.logoutButton},
      ${styles.backButton},
      ${styles.employeeListButton} {
        width: 100%;
        margin: 0;
      }
      ${styles.statsContainer} {
        margin-top: 70px;
      }
      ${styles.statCard} {
        width: clamp(150px, 40%, 25%);
      }
      ${styles.input} {
        width: clamp(120px, 30vw, 150px);
      }
      ${styles.tableContainer}, ${styles.employeeListContainer} {
        padding: clamp(10px, 2vw, 15px);
      }
      ${styles.th}, ${styles.td} {
        font-size: clamp(10px, 1.5vw, 12px);
        padding: clamp(6px, 1.2vw, 8px);
      }
    }

    @media (max-width: 480px) {
      ${styles.header} {
        padding: clamp(5px, 2vw, 8px) clamp(5px, 2vw, 10px);
      }
      ${styles.title} {
        font-size: clamp(14px, 3vw, 18px);
      }
      ${styles.statsContainer} {
        flex-direction: column;
        align-items: center;
        gap: clamp(10px, 2vw, 15px);
      }
      ${styles.statCard} {
        width: 80%;
        min-width: 0;
      }
      ${styles.inTimeContainer}, ${styles.filterContainer} {
        flex-direction: column;
        align-items: flex-start;
      }
      ${styles.updateButton} {
        width: 100%;
        margin-top: clamp(5px, 1vw, 10px);
      }
      ${styles.table}, ${styles.employeeListContainer} table {
        font-size: clamp(10px, 1.5vw, 12px);
      }
      ${styles.modalContent} {
        width: 85vw;
        padding: clamp(10px, 2vw, 15px);
      }
    }
  `;

  // Inject media queries into the document (ensure this runs only once)
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = mediaQueries;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet); // Cleanup on unmount
  }, [mediaQueries]);

  // Hover effects
  styles.logoutButton['&:hover'] = { backgroundColor: '#c9302c' };
  styles.backButton['&:hover'] = { backgroundColor: '#5a6268' };
  styles.employeeListButton['&:hover'] = { backgroundColor: '#0056b3' };
  styles.updateButton['&:hover'] = { backgroundColor: '#218838' };
  styles.submitButton['&:hover'] = { backgroundColor: '#218838' };
  styles.cancelButton['&:hover'] = { backgroundColor: '#c9302c' };
  styles.tr['&:hover'] = { backgroundColor: '#f9f9f9' };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <img src="/logo1.png" alt="Logo" style={styles.logo} />
        <h1 style={styles.title}>Admin Dashboard</h1>
        <div style={styles.buttonGroup}>
          <button
            onClick={() => setShowEmployeeList(!showEmployeeList)}
            style={styles.employeeListButton}
          >
            {showEmployeeList ? 'Hide Employees' : 'Employees List'}
          </button>
          <button onClick={handleBack} style={styles.backButton}>Back</button>
          <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
        </div>
      </header>

      {error && <p style={styles.error}>Error: {error}</p>}

      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Total Employees</h3>
          <p style={styles.statValue}>{employees.length}</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Present {selectedDate || 'Today'}</h3>
          <p style={styles.statValue}>{presentCount}</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Absent {selectedDate || 'Today'}</h3>
          <p style={styles.statValue}>{absentCount}</p>
        </div>
      </div>

      {/* In Time Threshold Update Section */}
      <div style={styles.inTimeContainer}>
        <label style={styles.label}>Set In Time Threshold (e.g., 10:00 AM):</label>
        <input
          type="time"
          value={inTimeThreshold}
          onChange={(e) => setInTimeThreshold(e.target.value)}
          style={styles.input}
        />
        <button
          onClick={handleUpdateInTime}
          style={styles.updateButton}
          disabled={isUpdatingInTime}
        >
          {isUpdatingInTime ? 'Updating...' : 'Update In Time'}
        </button>
      </div>

      <div style={styles.filterContainer}>
        <label style={styles.label}>Filter by Date (Day/Month/Year):</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={styles.input}
        />
      </div>

      <div style={styles.tableContainer}>
        <h2 style={styles.sectionTitle}>Employee Attendance ({selectedDate || today})</h2>
        {loading ? (
          <p style={styles.loading}>Loading employees...</p>
        ) : employees.length === 0 ? (
          <p style={styles.noData}>No employees found.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Employee ID</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Department</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>In Time</th>
                <th style={styles.th}>Late Time</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.employee_id} style={styles.tr}>
                  <td style={styles.td}>{emp.employee_id}</td>
                  <td style={styles.td}>{emp.employee_name}</td>
                  <td style={styles.td}>{emp.email}</td>
                  <td style={styles.td}>{emp.department || 'N/A'}</td>
                  <td style={styles.td}>{emp.date}</td>
                  <td style={styles.td}>
                    {emp.status === 'not_marked' && !selectedDate && new Date().getHours() < 12
                      ? 'Pending'
                      : emp.status}
                  </td>
                  <td style={styles.td}>{emp.inTime || 'N/A'}</td>
                  <td style={styles.td}>{emp.lateTime || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showEmployeeList && (
        <div style={styles.employeeListContainer}>
          <h2 style={styles.sectionTitle}>Employees List</h2>
          {loading ? (
            <p style={styles.loading}>Loading employees...</p>
          ) : employees.length === 0 ? (
            <p style={styles.noData}>No employees found.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Employee ID</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Department</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.employee_id} style={styles.tr}>
                    <td style={styles.td}>{emp.employee_id}</td>
                    <td style={styles.td}>{emp.employee_name}</td>
                    <td style={styles.td}>{emp.email}</td>
                    <td style={styles.td}>{emp.department || 'N/A'}</td>
                    <td style={styles.td}>
                      <button
                        onClick={() => handleUpdateClick(emp)}
                        style={styles.updateButton}
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {updatingEmployee && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={{ color: '#ff7300', marginBottom: 'clamp(10px, 2vw, 15px)' }}>
              Update Employee: {updatingEmployee.employee_id}
            </h3>
            {!otpSent ? (
              <div>
                <p style={{ color: '#333', marginBottom: 'clamp(10px, 2vw, 15px)' }}>
                  Click below to send an OTP to {updatingEmployee.email} for verification.
                </p>
                <button
                  onClick={handleSendOtp}
                  style={styles.submitButton}
                >
                  Send OTP
                </button>
                <button
                  onClick={() => setUpdatingEmployee(null)}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdateSubmit}>
                <label style={styles.formLabel}>Name:</label>
                <input
                  type="text"
                  value={updateData.employeeName}
                  onChange={(e) => setUpdateData({ ...updateData, employeeName: e.target.value })}
                  style={styles.formInput}
                  required
                />
                <label style={styles.formLabel}>Email:</label>
                <input
                  type="email"
                  value={updateData.email}
                  onChange={(e) => setUpdateData({ ...updateData, email: e.target.value })}
                  style={styles.formInput}
                  required
                />
                <label style={styles.formLabel}>Department:</label>
                <input
                  type="text"
                  value={updateData.department}
                  onChange={(e) => setUpdateData({ ...updateData, department: e.target.value })}
                  style={styles.formInput}
                  required
                />
                <label style={styles.formLabel}>New Face Image (optional):</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setUpdateData({ ...updateData, faceImage: e.target.files[0] })}
                  style={styles.formInput}
                />
                <label style={styles.formLabel}>OTP:</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  style={styles.formInput}
                  required
                />
                <button type="submit" style={styles.submitButton}>Update</button>
                <button
                  type="button"
                  onClick={() => setUpdatingEmployee(null)}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <footer style={styles.footer}>
        <p>Face Recognition System © 2025 | Admin Panel</p>
      </footer>
    </div>
  );
};

export default AdminDashboard;