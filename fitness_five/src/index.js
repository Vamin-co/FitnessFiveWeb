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
//import ErrorPage404 from './components/ErrorPage404';

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
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/landingpage",
    element: <LandingPage />,
  }
  // {
  //   path: "/*",
  //   element: <ErrorPage404 />,
  // }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
