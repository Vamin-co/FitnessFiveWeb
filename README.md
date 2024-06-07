# Fitness App

A comprehensive fitness application designed to help users track their workouts, monitor their progress, and achieve their fitness goals.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Running the Application](#running-the-application)

## Project Overview

The Fitness App is designed to provide users with a convenient way to manage and track their fitness routines. This app addresses common problems such as the lack of structured workout plans, difficulty in tracking progress, and the need for personalized fitness recommendations. By integrating various features, the Fitness App helps users stay motivated and achieve their fitness goals more efficiently.

## Features

List the main features of your project:
- **Workout Tracking**: Log and monitor workouts with detailed information on exercises, sets, and repetitions.
- **Progress Monitoring**: Visualize progress over time with graphs and statistics.
- **Custom Workout Plans**: Create and manage personalized workout plans tailored to individual fitness goals.
- **Nutrition Tracking**: Log daily food intake and monitor nutritional values.
- **Goal Setting**: Set and track fitness goals, including weight loss, muscle gain, and endurance improvement.
- **User Authentication**: Secure user authentication and profile management using JWT.

## Technologies Used

List all the major technologies used in your project:
- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MySQL](https://www.mysql.com/)
- [JWT](https://jwt.io/)

## Installation

### Prerequisites

Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v14.x or higher)
- [npm](https://www.npmjs.com/) (v6.x or higher)
- [MySQL](https://www.mysql.com/)

### Backend Setup

1. Clone the repository:
    ```bash
    git clone https://github.com/Vamin-co/FitnessFiveWeb.git.git
    cd your-repo-name/backend
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Set up environment variables:
    Create a `.env` file in the `backend` directory and add your environment variables:
    ```env
    PORT=5000
    MYSQL_HOST=your_mysql_host
    MYSQL_USER=your_mysql_user
    MYSQL_PASSWORD=your_mysql_password
    MYSQL_DATABASE=your_mysql_database
    JWT_SECRET=your_jwt_secret
    ```

4. Initialize the database:
    Run the SQL scripts to set up your database schema.

5. Start the backend server:
    ```bash
    npm start
    ```

### Frontend Setup

1. Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Set up environment variables:
    Create a `.env` file in the `frontend` directory and add your environment variables:
    ```env
    REACT_APP_API_URL=http://localhost:5000
    ```

4. Start the frontend development server:
    ```bash
    npm start
    ```

## Running the Application

After completing the installation steps, you can run the application:

1. Make sure the backend server is running:
    ```bash
    cd backend
    npm start
    ```

2. Make sure the frontend development server is running:
    ```bash
    cd frontend
    npm start
    ```

3. Open your browser and navigate to `http://localhost:3000`