import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { CardProvider } from './components/CardContext'; // Import CardProvider
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Leaderboard from './components/Leaderboard';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Workout from './components/Workout';
import Error404 from './components/Error404';
import Myprofile from './components/Myprofile';
import About from './components/About';
import ContactUs from './components/ContactUs';

// Routes
const router = createBrowserRouter([
  {
    path: "/", 
    element: <App />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/leaderboard",
    element: <Leaderboard />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/landingpage",
    element: <LandingPage />,
  },
  {
    path: "/workout",
    element: <Workout />,
  },
  {
    path: "/myprofile",
    element: <Myprofile />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/contact",
    element: <ContactUs />,
  },
  {
    path: "*", // Wildcard route for handling 404 errors
    element: <Error404 />,
  }
]);

// Render the application
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CardProvider> 
      <RouterProvider router={router} />
    </CardProvider>
  </React.StrictMode>
);

// Run any web vitals reports
reportWebVitals();
