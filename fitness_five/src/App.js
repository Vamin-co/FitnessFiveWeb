import React from 'react';
import './App.css';
import LandingPage from './components/LandingPage';

/**
 * Main App component that serves as the root of the application.
 * @component
 * @returns {JSX.Element} The rendered component.
 */
function App() {
  return (
    <div className="App">
      <LandingPage />
    </div>
  );
}

export default App;
