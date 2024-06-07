import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/Error404.css'; // Make sure to create a corresponding CSS file for styling

/**
 * Error404 component that displays a 404 error message and a button to navigate back to the home page.
 *
 * @component
 * @returns {JSX.Element} The rendered Error404 component.
 */
const Error404 = () => {
  const navigate = useNavigate();

  /**
   * Navigate back to the home page.
   */
  const goBackHome = () => {
    navigate('/');
  };

  return (
    <div className="not-found-page">
      <div className="error-content">
        <button className="error-btn" onClick={goBackHome}>Go Back to Home</button>
      </div>
    </div>
  );
};

export default Error404;
