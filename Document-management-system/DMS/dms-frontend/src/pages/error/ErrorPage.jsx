import React from "react";
import { Link } from "react-router-dom";
const ErrorPage = () => {
  return (
    <div className="error-container d-flex flex-column justify-content-center align-items-center text-center">
      
      {/* Animated Circle Background */}
      <div className="circle"></div>
      <div className="circle small"></div>

      {/* Content */}
      <h1 className="error-code">404</h1>
      <h3 className="mb-3">Oops! Page Not Found</h3>
      <p className="mb-4 text-muted">
        The page you're looking for doesn't exist or has been moved.
      </p>

      <button className="btn btn-light-sp px-4 py-2">
        <Link to="/" className="btn">Go Back Home</Link>
      </button>

      {/* Styles */}
      <style>{`
        .error-container {
          height: 100vh;
          background: linear-gradient(135deg, #4F46E5, #6366F1);
          color: white;
          position: relative;
          overflow: hidden;
        }

        .error-code {
          font-size: 120px;
          font-weight: 800;
          letter-spacing: 5px;
          animation: floatText 3s ease-in-out infinite;
        }

        h3 {
          font-weight: 600;
        }

        p {
          max-width: 400px;
        }

        /* Floating circles */
        .circle {
          position: absolute;
          width: 300px;
          height: 300px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          top: -50px;
          left: -50px;
          animation: float 6s ease-in-out infinite;
        }

        .circle.small {
          width: 200px;
          height: 200px;
          bottom: -50px;
          right: -50px;
          top: auto;
          left: auto;
          animation: floatReverse 8s ease-in-out infinite;
        }

        /* Animations */
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(30px); }
          100% { transform: translateY(0px); }
        }

        @keyframes floatReverse {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
          100% { transform: translateY(0px); }
        }

        @keyframes floatText {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }

        button {
          border-radius: 30px;
          font-weight: 500;
          transition: 0.3s;
        }

        button:hover {
          transform: scale(1.05);
        }
        .btn-light-sp{
        color: #000;
     --bs-btn-bg: #f8f9fa !important;
        border-color: #f8f9fa;
    --bs-btn-hover-color: #000;
    --bs-btn-hover-bg: #d3d4d5;
    --bs-btn-hover-border-color: #c6c7c8;
    --bs-btn-focus-shadow-rgb: 211, 212, 213;
    --bs-btn-active-color: #000;
    --bs-btn-active-bg: #c6c7c8;
    --bs-btn-active-border-color: #babbbc;
    --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
    --bs-btn-disabled-color: #000;
    --bs-btn-disabled-bg: #f8f9fa;
    --bs-btn-disabled-border-color: #f8f9fa;
      }
          
      `}</style>
    </div>
  );
};

export default ErrorPage;