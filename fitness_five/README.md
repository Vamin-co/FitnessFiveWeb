# Fitness App

A comprehensive fitness application designed to help users track their workouts, monitor their progress, and achieve their fitness goals.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [Database Usage](#database-usage)

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
    git clone https://github.com/Vamin-co/FitnessFiveWeb.git
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

3. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## Database Usage

This project uses a MySQL database for storing and retrieving data. The database is used to manage various aspects of the application, such as user authentication, workout plans, and nutrition tracking.

### Setting Up the Database

1. **Install MySQL**: Ensure you have MySQL installed on your local machine or a remote server. You can download it from [MySQL's official website](https://dev.mysql.com/downloads/).

2. **Create a Database**: Create a new database for your project. You can use the following SQL command:
    ```sql
    CREATE DATABASE fitness_app;
    ```

3. **Create Tables**: Create the necessary tables for your application. Here are the SQL commands based on your schema:

    ```sql
    CREATE TABLE Users (
        UserID INT AUTO_INCREMENT PRIMARY KEY,
        FirstName VARCHAR(50),
        MiddleInitial CHAR(1),
        LastName VARCHAR(50),
        BirthDate DATE,
        Weight DECIMAL(5,2),
        Height DECIMAL(5,2),
        Username VARCHAR(50),
        Email VARCHAR(100) UNIQUE,
        Password VARCHAR(255),
        ProfilePhotoURL VARCHAR(255)
    );

    CREATE TABLE Workouts (
        WorkoutID INT AUTO_INCREMENT PRIMARY KEY,
        UserID INT,
        Title VARCHAR(255),
        FOREIGN KEY (UserID) REFERENCES Users(UserID)
    );

    CREATE TABLE Exercises (
        ExerciseID INT AUTO_INCREMENT PRIMARY KEY,
        WorkoutID INT,
        Name VARCHAR(255),
        Sets INT,
        Reps INT,
        TargetSets INT,
        TargetReps INT,
        FOREIGN KEY (WorkoutID) REFERENCES Workouts(WorkoutID)
    );

    CREATE TABLE ContactMessages (
        MessageID INT AUTO_INCREMENT PRIMARY KEY,
        UserID INT,
        Email VARCHAR(100),
        Message TEXT,
        SubmittedAt TIMESTAMP,
        FOREIGN KEY (UserID) REFERENCES Users(UserID)
    );
    ```

4. **Configure Database Connection**: Update your Node.js backend to connect to the MySQL database. Ensure you have the `mysql2` package installed:
    ```bash
    npm install mysql2
    ```
    Then, configure the connection in your backend code:
    ```javascript
    const mysql = require('mysql2');

    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'yourUsername',
        password: 'yourPassword',
        database: 'fitness_app'
    });

    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to the database:', err);
            return;
        }
        console.log('Connected to the MySQL database.');
    });
    ```

### API Endpoints

The application uses various API endpoints to interact with the database. Here are some examples:

- **User Signup**: `POST /api/signup` - Registers a new user.
- **User Login**: `POST /api/login` - Authenticates a user and returns a JWT token.
- **Get Workout Plans**: `GET /api/workouts` - Retrieves all workout plans for the authenticated user.
- **Create Workout Plan**: `POST /api/workouts` - Creates a new workout plan.

Ensure that you secure your API endpoints and validate user inputs to prevent SQL injection and other security vulnerabilities.
