import React from 'react';
import './App.css';
import LandingPage from './components/LandingPage';
import Error404 from './components/Error404';
import { CardProvider } from './components/CardContext.js';
import Dashboard from './components/Dashboard.js';
import Workout from './components/Workout.js';


function App() {
  return (
    <div className="App">
     <LandingPage />
    </div>
  );
}

export default App;
