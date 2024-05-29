import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import History from './components/History';
import Leaderboard from './components/Leaderboard';
import Login from './components/Login';
import Profile from './components/Profile';
import SignUp from './components/SignUp';
import Workout from './components/Workout';
import Error404 from './components/Error404';
import Settings from './components/Settings';
import Myprofile from './components/Myprofile';
import Help from './components/Help';
import About from './components/About';


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
    path: "/history",
    element: <History />,
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
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "/help",
    element: <Help />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "*", // Wildcard route for handling 404 errors
    element: <Error404 />,
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

reportWebVitals();
