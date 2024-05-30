import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/Error404.css'; // Make sure to create a corresponding CSS file for styling

const Error404 = () => {
  const navigate = useNavigate();

  const goBackHome = () => {
    navigate('/');
  };

  return (
    <div className="not-found-page">
      <div className="error-content">
        <button className='error-btn' onClick={goBackHome}>Go Back to Home</button>
      </div>
    </div>
  );
};

export default Error404;
