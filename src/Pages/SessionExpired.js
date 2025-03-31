import React from "react";
import { useNavigate } from "react-router-dom";

const SessionExpired = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Session Expired</h2>
      <p>Your session has expired. Please log in again.</p>
      <button onClick={() => navigate("/login")} style={{ padding: "10px", background: "red", color: "white" }}>
        Go to Login
      </button>
    </div>
  );
};

export default SessionExpired;
