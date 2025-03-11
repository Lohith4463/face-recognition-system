import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";

const AttendanceRecords = () => {
  const [employeeID, setEmployeeID] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [records, setRecords] = useState([]);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  const capture = useCallback(() => webcamRef.current?.getScreenshot(), [webcamRef]);

  const handleLogin = async () => {
    const formData = new FormData();
    formData.append("employeeID", employeeID);
    formData.append("password", password);
    const response = await fetch("http://localhost:5000/api/login", { method: "POST", body: formData });
    const result = await response.json();
    setMessage(result.message || result.error);
    if (result.success) {
      setIsLoggedIn(true);
      fetchRecords();
    }
  };

  const fetchRecords = async () => {
    const response = await fetch(`http://localhost:5000/api/attendance_records?employeeID=${employeeID}`);
    const result = await response.json();
    if (result.success) setRecords(result.attendance_records);
  };

  const handleVerify = async () => {
    const faceData = capture();
    if (!faceData) return setMessage("Failed to capture image.");
    const byteString = atob(faceData.split(",")[1]);
    const mimeString = faceData.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    const blob = new Blob([ab], { type: mimeString });
    const file = new File([blob], "faceImage.jpg", { type: mimeString });

    const formData = new FormData();
    formData.append("employeeID", employeeID);
    formData.append("faceImage", file);
    const response = await fetch("http://localhost:5000/api/verify", { method: "POST", body: formData });
    const result = await response.json();
    setMessage(result.message || result.error);
    if (result.success) {
      setAttendanceMarked(result.attendance_marked);
      fetchRecords();
    }
  };

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100">
      <button className="btn btn-warning position-absolute top-0 start-0 m-2" onClick={() => navigate(-1)}>Back</button>
      <h2 className="text-warning mb-4">Attendance Records</h2>
      {!isLoggedIn ? (
        <div className="w-100" style={{ maxWidth: "400px" }}>
          <input
            className="form-control mb-3"
            type="text"
            placeholder="Employee ID"
            value={employeeID}
            onChange={(e) => setEmployeeID(e.target.value)}
          />
          <input
            className="form-control mb-3"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn btn-warning w-100" onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <>
          <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" width={320} height={240} className="rounded mb-3" />
          {records.length > 0 && (
            <table className="table table-bordered mt-3">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={i}>
                    <td>{r.date}</td>
                    <td>{r.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <button
            className="btn btn-warning"
            onClick={handleVerify}
            disabled={attendanceMarked}
          >
            {attendanceMarked ? "Attendance Marked" : "Mark Attendance"}
          </button>
        </>
      )}
      {message && <p className="text-danger mt-3">{message}</p>}
    </div>
  );
};

export default AttendanceRecords;