import React from "react";
import { useNavigate } from "react-router-dom";

const SessionExpired = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f0f2f5",
        fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <div
        style={{
          textAlign: "center",
          background: "#fff",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          maxWidth: "400px",
        }}
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/595/595067.png"
          alt="Session Expired"
          style={{ width: "100px", marginBottom: "20px" }}
        />
        <h2 style={{ color: "#cc0000" }}>Oops! Session Expired</h2>
        <p style={{ fontSize: "16px", color: "#555" }}>
          Your session has ended due to inactivity. <br />
          Please log in again to continue.
        </p>
        <button
          onClick={() => navigate("/login")}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default SessionExpired;
