import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [inTimeThreshold, setInTimeThreshold] = useState('09:30');
  const [isUpdatingInTime, setIsUpdatingInTime] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [employeeHistory, setEmployeeHistory] = useState(null);
  const navigate = useNavigate();
  const employeeListRef = useRef(null);

  const fetchEmployees = useCallback(async () => {
    try {
      let url = 'http://localhost:5000/api/employees';
      if (selectedDate) url += `?date=${selectedDate}`;
      const response = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
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
      } else throw new Error(data.error || 'Failed to fetch employees');
    } catch (err) {
      setError(err.message || 'Network or server issue');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  const fetchInTimeThreshold = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/in-time', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      if (data.success) setInTimeThreshold(data.inTimeThreshold);
      else throw new Error(data.error || 'Failed to fetch In Time threshold');
    } catch (err) {
      setError(err.message || 'Network or server issue');
    }
  };

  const fetchEmployeeHistory = async (employeeId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/employee-history?employeeID=${employeeId}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      if (data.success) setEmployeeHistory(data.history);
      else throw new Error(data.error || 'Failed to fetch history');
    } catch (err) {
      setError(err.message || 'Network or server issue');
      setEmployeeHistory(null);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchInTimeThreshold();
    fetchEmployees();
  }, [fetchEmployees]);

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
        alert(data.message);
        fetchEmployees();
      } else throw new Error(data.error || 'Failed to update In Time');
    } catch (err) {
      alert(`Failed to update In Time: ${err.message}`);
    } finally {
      setIsUpdatingInTime(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/login', { replace: true });
  };

  const handleBack = () => navigate(-1);

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
      } else throw new Error(data.error || 'Failed to send OTP');
    } catch (err) {
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
      const response = await fetch('http://localhost:5000/api/update-employee', { method: 'POST', body: formData });
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
      } else throw new Error(data.error || 'Failed to update employee');
    } catch (err) {
      alert(`Failed to update employee: ${err.message}`);
    }
  };

  const handleEmployeeListClick = () => {
    setShowEmployeeList((prev) => {
      const newState = !prev;
      if (newState && employeeListRef.current) {
        setTimeout(() => {
          employeeListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
      return newState;
    });
  };

  const today = new Date().toISOString().split('T')[0];
  const presentCount = employees.filter((emp) => emp.status === 'present' && emp.inTime !== 'N/A').length;
  const absentCount = employees.filter((emp) => emp.status === 'absent').length;

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: 'clamp(20px, 3vw, 40px)',
      fontFamily: "'Segoe UI', Arial, sans-serif",
      width: '100%',
      margin: '0 auto',
      boxSizing: 'border-box',
      transition: 'background-color 0.5s ease',
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
      padding: 'clamp(10px, 2vw, 15px) clamp(20px, 3vw, 40px)',
      borderRadius: '0 0 clamp(12px, 2vw, 16px) clamp(12px, 2vw, 16px)',
      boxShadow: '0 4px 12px rgba(255, 115, 0, 0.4)',
      zIndex: 1000,
      transform: isMounted ? 'translateY(0)' : 'translateY(-100%)',
      transition: 'transform 0.5s ease-out',
    },
    logo: {
      maxWidth: 'clamp(80px, 8vw, 100px)',
      height: 'auto',
      transition: 'transform 0.4s ease',
    },
    title: {
      color: '#ffffff',
      fontSize: 'clamp(24px, 3.5vw, 32px)',
      fontWeight: '700',
      margin: 0,
      flexGrow: 1,
      textAlign: 'center',
      background: 'linear-gradient(90deg, #ffffff, #ffe0b2)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
      transition: 'transform 0.3s ease, color 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
    },
    buttonGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: 'clamp(10px, 1.5vw, 15px)',
    },
    logoutButton: {
      padding: 'clamp(8px, 1.5vw, 12px) clamp(15px, 2vw, 25px)',
      border: 'none',
      borderRadius: '8px',
      backgroundColor: '#d9534f',
      color: '#ffffff',
      fontSize: 'clamp(14px, 2vw, 16px)',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.3s, transform 0.3s, box-shadow 0.3s',
      boxShadow: '0 4px 10px rgba(217, 83, 79, 0.4)',
    },
    backButton: {
      padding: 'clamp(8px, 1.5vw, 12px) clamp(15px, 2vw, 25px)',
      border: 'none',
      borderRadius: '8px',
      backgroundColor: '#6c757d',
      color: '#ffffff',
      fontSize: 'clamp(14px, 2vw, 16px)',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.3s, transform 0.3s, box-shadow 0.3s',
      boxShadow: '0 4px 10px rgba(108, 117, 125, 0.4)',
    },
    employeeListButton: {
      padding: 'clamp(8px, 1.5vw, 12px) clamp(15px, 2vw, 25px)',
      border: 'none',
      borderRadius: '8px',
      backgroundColor: '#007bff',
      color: '#ffffff',
      fontSize: 'clamp(14px, 2vw, 16px)',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.3s, transform 0.3s, box-shadow 0.3s',
      boxShadow: '0 4px 10px rgba(0, 123, 255, 0.4)',
    },
    statsContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      margin: 'clamp(30px, 4vw, 50px) 0',
      marginTop: '100px',
      gap: 'clamp(5px, 0.5vw, 8px)',
      flexWrap: 'wrap',
      transform: isMounted ? 'translateY(0)' : 'translateY(30px)',
      opacity: isMounted ? 1 : 0,
      transition: 'transform 0.6s ease-out, opacity 0.6s ease-out',
    },
    statCard: {
      backgroundColor: '#ffffff',
      padding: 'clamp(15px, 2vw, 20px)',
      borderRadius: 'clamp(10px, 2vw, 15px)',
      boxShadow: '0 6px 15px rgba(255, 115, 0, 0.3)',
      flex: '1 1 calc(33.33% - clamp(5px, 0.5vw, 8px))',
      textAlign: 'center',
      minWidth: '180px',
      maxWidth: '300px',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      transform: 'none',
    },
    statTitle: {
      color: '#ff7300',
      fontSize: 'clamp(16px, 2vw, 20px)',
      fontWeight: '700',
      marginBottom: 'clamp(5px, 1vw, 10px)',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      textShadow: '1px 1px 3px rgba(255, 115, 0, 0.3)',
      transition: 'transform 0.3s ease, color 0.3s ease',
    },
    statValue: {
      color: '#333',
      fontSize: 'clamp(24px, 3.5vw, 36px)',
      fontWeight: '700',
      textShadow: '1px 1px 3px rgba(255, 115, 0, 0.2)',
    },
    controlsContainer: {
      backgroundColor: '#ffffff',
      padding: 'clamp(10px, 1.5vw, 15px)',
      borderRadius: 'clamp(10px, 2vw, 15px)',
      boxShadow: '0 6px 15px rgba(255, 115, 0, 0.3)',
      margin: 'clamp(20px, 3vw, 30px) 0',
      display: 'flex',
      justifyContent: 'space-between', // Use space-between to align with stat cards
      alignItems: 'center',
      gap: 'clamp(5px, 0.5vw, 8px)', // Match the gap of stat cards for consistency
      flexWrap: 'wrap',
      transform: isMounted ? 'translateY(0)' : 'translateY(30px)',
      opacity: isMounted ? 1 : 0,
      transition: 'transform 0.7s ease-out, opacity 0.7s ease-out',
    },
    controlSection: {
      display: 'flex',
      alignItems: 'center',
      gap: 'clamp(5px, 1vw, 10px)',
      flex: '1 1 calc(33.33% - clamp(5px, 0.5vw, 8px))', // Match the flex of stat cards
      minWidth: '180px', // Match the minWidth of stat cards
      maxWidth: '300px', // Match the maxWidth of stat cards
      justifyContent: 'center', // Center the content within each section
    },
    label: {
      color: '#ff7300',
      fontSize: 'clamp(12px, 1.6vw, 14px)',
      fontWeight: '600',
      transition: 'transform 0.3s ease, color 0.3s ease',
      whiteSpace: 'nowrap',
    },
    input: {
      padding: 'clamp(4px, 0.8vw, 6px)',
      borderRadius: 'clamp(4px, 0.8vw, 6px)',
      border: '2px solid #ddd',
      fontSize: 'clamp(10px, 1.6vw, 12px)',
      width: 'clamp(100px, 12vw, 140px)',
      boxSizing: 'border-box',
      backgroundColor: '#fffaf0',
      transition: 'border-color 0.3s, box-shadow 0.3s, transform 0.3s',
    },
    updateButton: {
      padding: 'clamp(4px, 0.8vw, 6px) clamp(8px, 1.2vw, 12px)',
      border: 'none',
      borderRadius: '4px',
      backgroundColor: '#28a745',
      color: '#ffffff',
      fontSize: 'clamp(10px, 1.6vw, 12px)',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.3s, transform 0.3s, box-shadow 0.3s',
      boxShadow: '0 4px 10px rgba(40, 167, 69, 0.4)',
      whiteSpace: 'nowrap',
    },
    tableContainer: {
      backgroundColor: '#ffffff',
      padding: 'clamp(15px, 2vw, 20px)',
      borderRadius: 'clamp(10px, 2vw, 15px)',
      boxShadow: '0 6px 15px rgba(255, 115, 0, 0.3)',
      marginBottom: 'clamp(15px, 2.5vw, 25px)',
      overflowX: 'auto',
      transform: isMounted ? 'translateY(0)' : 'translateY(30px)',
      opacity: isMounted ? 1 : 0,
      transition: 'transform 0.9s ease-out, opacity 0.9s ease-out',
    },
    employeeListContainer: {
      backgroundColor: '#ffffff',
      padding: 'clamp(15px, 2vw, 20px)',
      borderRadius: 'clamp(10px, 2vw, 15px)',
      boxShadow: '0 6px 15px rgba(255, 115, 0, 0.3)',
      marginBottom: 'clamp(15px, 2.5vw, 25px)',
      overflowX: 'auto',
      transform: showEmployeeList ? 'translateY(0)' : 'translateY(30px)',
      opacity: showEmployeeList ? 1 : 0,
      transition: 'transform 0.5s ease-out, opacity 0.5s ease-out',
    },
    sectionTitle: {
      color: '#ff7300',
      fontSize: 'clamp(18px, 2.5vw, 24px)',
      fontWeight: '700',
      marginBottom: 'clamp(10px, 1.5vw, 15px)',
      textShadow: '1px 1px 3px rgba(255, 115, 0, 0.3)',
      transition: 'transform 0.3s ease',
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: {
      backgroundColor: '#ff7300',
      color: '#ffffff',
      padding: 'clamp(8px, 1.5vw, 12px)',
      textAlign: 'left',
      fontWeight: '600',
      fontSize: 'clamp(12px, 1.8vw, 14px)',
      borderBottom: '2px solid #e65c00',
      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
    },
    td: {
      padding: 'clamp(8px, 1.5vw, 12px)',
      borderBottom: '1px solid #ddd',
      color: '#333',
      fontSize: 'clamp(10px, 1.5vw, 13px)',
      transition: 'background-color 0.3s',
    },
    tr: { transition: 'background-color 0.3s, transform 0.3s' },
    error: {
      color: '#d9534f',
      fontSize: 'clamp(14px, 2vw, 18px)',
      textAlign: 'center',
      padding: 'clamp(15px, 2.5vw, 25px)',
      transition: 'transform 0.3s ease',
    },
    loading: {
      color: '#ff7300',
      fontSize: 'clamp(14px, 2vw, 18px)',
      textAlign: 'center',
      padding: 'clamp(15px, 2.5vw, 25px)',
      transition: 'transform 0.3s ease',
    },
    noData: {
      color: '#d9534f',
      fontSize: 'clamp(14px, 2vw, 18px)',
      textAlign: 'center',
      padding: 'clamp(15px, 2.5vw, 25px)',
      transition: 'transform 0.3s ease',
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      transition: 'opacity 0.3s ease',
    },
    modalContent: {
      backgroundColor: '#ffffff',
      padding: 'clamp(15px, 2vw, 20px)',
      borderRadius: 'clamp(10px, 1.8vw, 14px)',
      boxShadow: '0 8px 20px rgba(255, 115, 0, 0.4)',
      width: 'clamp(300px, 75%, 400px)',
      maxWidth: '90vw',
      maxHeight: '90vh',
      overflowY: 'auto',
      transform: updatingEmployee ? 'scale(1)' : 'scale(0.9)',
      opacity: updatingEmployee ? 1 : 0,
      transition: 'transform 0.4s ease-out, opacity 0.4s ease-out',
    },
    formLabel: {
      color: '#ff7300',
      fontSize: 'clamp(12px, 1.8vw, 14px)',
      fontWeight: '600',
      marginBottom: 'clamp(6px, 1vw, 10px)',
      display: 'block',
      transition: 'transform 0.3s ease',
    },
    formInput: {
      width: '100%',
      padding: 'clamp(6px, 1.2vw, 8px)',
      marginBottom: 'clamp(8px, 1.2vw, 12px)',
      borderRadius: 'clamp(6px, 1.2vw, 8px)',
      border: '2px solid #ddd',
      fontSize: 'clamp(12px, 1.8vw, 14px)',
      boxSizing: 'border-box',
      backgroundColor: '#fffaf0',
      transition: 'border-color 0.3s, box-shadow 0.3s, transform 0.3s',
    },
    submitButton: {
      padding: 'clamp(6px, 1.2vw, 10px) clamp(12px, 2vw, 20px)',
      border: 'none',
      borderRadius: '6px',
      backgroundColor: '#28a745',
      color: '#ffffff',
      cursor: 'pointer',
      marginRight: 'clamp(8px, 1.2vw, 12px)',
      transition: 'background-color 0.3s, transform 0.3s, box-shadow 0.3s',
      boxShadow: '0 4px 10px rgba(40, 167, 69, 0.4)',
    },
    cancelButton: {
      padding: 'clamp(6px, 1.2vw, 10px) clamp(12px, 2vw, 20px)',
      border: 'none',
      borderRadius: '6px',
      backgroundColor: '#d9534f',
      color: '#ffffff',
      cursor: 'pointer',
      transition: 'background-color 0.3s, transform 0.3s, box-shadow 0.3s',
      boxShadow: '0 4px 10px rgba(217, 83, 79, 0.4)',
    },
    footer: {
      marginTop: 'clamp(20px, 3vw, 30px)',
      textAlign: 'center',
      color: '#666',
      fontSize: 'clamp(12px, 1.8vw, 14px)',
      padding: 'clamp(10px, 1.5vw, 15px)',
      width: '100%',
      transition: 'color 0.3s ease, transform 0.3s ease',
    },
  };

  styles.title['&:hover'] = { transform: 'scale(1.05)', color: '#ffe0b2' };
  styles.logoutButton['&:hover'] = { backgroundColor: '#c9302c', transform: 'scale(1.05) rotate(2deg)', boxShadow: '0 6px 15px rgba(217, 83, 79, 0.6)' };
  styles.logoutButton['&:active'] = { transform: 'scale(0.95) rotate(0deg)', backgroundColor: '#b02a27', boxShadow: '0 2px 6px rgba(217, 83, 79, 0.4)' };
  styles.backButton['&:hover'] = { backgroundColor: '#5a6268', transform: 'scale(1.05) rotate(-2deg)', boxShadow: '0 6px 15px rgba(108, 117, 125, 0.6)' };
  styles.backButton['&:active'] = { transform: 'scale(0.95) rotate(0deg)', backgroundColor: '#495057', boxShadow: '0 2px 6px rgba(108, 117, 125, 0.4)' };
  styles.employeeListButton['&:hover'] = { backgroundColor: '#0056b3', transform: 'scale(1.05) rotate(2deg)', boxShadow: '0 6px 15px rgba(0, 123, 255, 0.6)' };
  styles.employeeListButton['&:active'] = { transform: 'scale(0.95) rotate(0deg)', backgroundColor: '#004085', boxShadow: '0 2px 6px rgba(0, 123, 255, 0.4)' };
  styles.statCard['&:hover'] = { transform: 'translateY(-5px)', boxShadow: '0 10px 20px rgba(255, 115, 0, 0.5)' };
  styles.statTitle['&:hover'] = { transform: 'scale(1.05)', color: '#e65c00' };
  styles.controlsContainer['&:hover'] = { boxShadow: '0 10px 20px rgba(255, 115, 0, 0.5)', transform: 'translateY(-5px)' };
  styles.label['&:hover'] = { transform: 'translateX(5px)', color: '#e65c00' };
  styles.input['&:hover'] = { transform: 'scale(1.02)', borderColor: '#ff7300', boxShadow: '0 0 5px rgba(255, 115, 0, 0.4)' };
  styles.input['&:focus'] = { borderColor: '#ff7300', boxShadow: '0 0 10px rgba(255, 115, 0, 0.6)', transform: 'scale(1.02)', outline: 'none' };
  styles.updateButton['&:hover'] = { backgroundColor: '#218838', transform: 'scale(1.05) rotate(2deg)', boxShadow: '0 6px 15px rgba(40, 167, 69, 0.6)' };
  styles.updateButton['&:active'] = { transform: 'scale(0.95) rotate(0deg)', backgroundColor: '#1c7430', boxShadow: '0 2px 6px rgba(40, 167, 69, 0.4)' };
  styles.tableContainer['&:hover'] = { boxShadow: '0 10px 20px rgba(255, 115, 0, 0.5)', transform: 'translateY(-5px)' };
  styles.employeeListContainer['&:hover'] = { boxShadow: '0 10px 20px rgba(255, 115, 0, 0.5)', transform: 'translateY(-5px)' };
  styles.sectionTitle['&:hover'] = { transform: 'scale(1.05)' };
  styles.tr['&:hover'] = { backgroundColor: '#fffaf0', transform: 'translateX(5px)' };
  styles.error['&:hover'] = { transform: 'scale(1.02)' };
  styles.loading['&:hover'] = { transform: 'scale(1.02)' };
  styles.noData['&:hover'] = { transform: 'scale(1.02)' };
  styles.formLabel['&:hover'] = { transform: 'translateX(5px)', color: '#e65c00' };
  styles.formInput['&:hover'] = { transform: 'scale(1.02)', borderColor: '#ff7300', boxShadow: '0 0 5px rgba(255, 115, 0, 0.4)' };
  styles.formInput['&:focus'] = { borderColor: '#ff7300', boxShadow: '0 0 10px rgba(255, 151, 0, 0.6)', transform: 'scale(1.02)', outline: 'none' };
  styles.submitButton['&:hover'] = { backgroundColor: '#218838', transform: 'scale(1.05) rotate(2deg)', boxShadow: '0 6px 15px rgba(40, 167, 69, 0.6)' };
  styles.submitButton['&:active'] = { transform: 'scale(0.95) rotate(0deg)', backgroundColor: '#1c7430', boxShadow: '0 2px 6px rgba(40, 167, 69, 0.4)' };
  styles.cancelButton['&:hover'] = { backgroundColor: '#c9302c', transform: 'scale(1.05) rotate(-2deg)', boxShadow: '0 6px 15px rgba(217, 83, 79, 0.6)' };
  styles.cancelButton['&:active'] = { transform: 'scale(0.95) rotate(0deg)', backgroundColor: '#b02a27', boxShadow: '0 2px 6px rgba(217, 83, 79, 0.4)' };
  styles.footer['&:hover'] = { color: '#ff7300', transform: 'translateY(-5px)' };
  styles.logo['&:hover'] = { transform: 'scale(1.1) rotate(5deg)' };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <img src="/logo1.png" alt="Logo" style={styles.logo} />
        <h1 style={styles.title}>Admin Dashboard</h1>
        <div style={styles.buttonGroup}>
          <button
            onClick={handleEmployeeListClick}
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
          <h3 style={styles.statTitle}>Present Today</h3>
          <p style={styles.statValue}>{presentCount}</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Absent Today</h3>
          <p style={styles.statValue}>{absentCount}</p>
        </div>
      </div>

      {/* Controls Section with Adjusted Alignment */}
      <div style={styles.controlsContainer}>
        {/* Filter by Date (Left) - Aligned with "Total Employees" */}
        <div style={styles.controlSection}>
          <label style={styles.label}>Filter by Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={styles.input}
          />
        </div>

        {/* Search History (Center) - Aligned with "Present Today" */}
        <div style={styles.controlSection}>
          <label style={styles.label}>Search History:</label>
          <input
            type="text"
            placeholder="Employee ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.input}
          />
          <button
            onClick={() => fetchEmployeeHistory(searchQuery)}
            style={styles.updateButton}
          >
            Search
          </button>
        </div>

        {/* Set In Time (Right) - Aligned with "Absent Today" */}
        <div style={styles.controlSection}>
          <label style={styles.label}>Set In Time:</label>
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
            {isUpdatingInTime ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>

      {employeeHistory && (
        <div style={styles.tableContainer}>
          <h2 style={styles.sectionTitle}>History for Employee {searchQuery}</h2>
          {employeeHistory.length === 0 ? (
            <p style={styles.noData}>No history found for this employee.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>In Time</th>
                  <th style={styles.th}>Late Time</th>
                </tr>
              </thead>
              <tbody>
                {employeeHistory.map((record) => (
                  <tr key={record.date} style={styles.tr}>
                    <td style={styles.td}>{record.date}</td>
                    <td style={styles.td}>{record.status}</td>
                    <td style={styles.td}>{record.inTime || 'N/A'}</td>
                    <td style={styles.td}>{record.lateTime || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

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
                    {emp.status === 'not_marked' && !selectedDate && new Date().getHours() < 12 ? 'Pending' : emp.status}
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
        <div ref={employeeListRef} style={styles.employeeListContainer}>
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
                      <button onClick={() => handleUpdateClick(emp)} style={styles.updateButton}>Update</button>
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
            <h3 style={{ color: '#ff7300', marginBottom: 'clamp(10px, 1.5vw, 15px)', textShadow: '1px 1px 3px rgba(255, 115, 0, 0.3)' }}>
              Update Employee: {updatingEmployee.employee_id}
            </h3>
            {!otpSent ? (
              <div>
                <p style={{ color: '#333', marginBottom: 'clamp(10px, 1.5vw, 15px)' }}>
                  Send OTP to {updatingEmployee.email} for verification.
                </p>
                <button onClick={handleSendOtp} style={styles.submitButton}>Send OTP</button>
                <button onClick={() => setUpdatingEmployee(null)} style={styles.cancelButton}>Cancel</button>
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
                <button type="button" onClick={() => setUpdatingEmployee(null)} style={styles.cancelButton}>Cancel</button>
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