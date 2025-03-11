import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Should work after install

const VerifyOTP = () => {
  const [employeeID, setEmployeeID] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!employeeID || !otp || !password) {
      setError('All fields (Employee ID, OTP, Password) are required.');
      return;
    }

    const formData = new FormData();
    formData.append('employeeID', employeeID);
    formData.append('otp', otp);
    formData.append('password', password);

    try {
      const response = await fetch('http://localhost:5000/api/verify-otp', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.error || 'OTP verification failed.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Verify OTP</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="employeeID" className="form-label">Employee ID</label>
          <input
            type="text"
            className="form-control"
            id="employeeID"
            value={employeeID}
            onChange={(e) => setEmployeeID(e.target.value)}
            placeholder="Enter Employee ID"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="otp" className="form-label">OTP</label>
          <input
            type="text"
            className="form-control"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Set Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Password"
          />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <button type="submit" className="btn btn-success">
          Verify OTP
        </button>
      </form>
    </div>
  );
};

export default VerifyOTP;