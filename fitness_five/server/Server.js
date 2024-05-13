/**
 * @fileoverview This script sets up an Express server with CORS and JSON parsing middleware,
 * establishes a MySQL database connection, and handles user registration and basic messaging.
 */

const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const port = 4000;
const sanitizeHtml = require('sanitize-html');
const app = express();
// Use express built-in middleware to parse JSON bodies
app.use(express.json());



/**
 * Connects to the MySQL database using predefined credentials.
 */
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Sarbaaz@#$8090',
    database: 'DbFitnessApp',
    port: 3306
});

/**
 * Opens a connection to the database and logs connection status.
 */
db.connect(err => {
    if (err) {
        console.error('Error connecting to the database: ' + err.stack);
        return;
    }
    console.log('Connected to database as id ' + db.threadId);
});

/**
 * Middleware to log and send responses for any server errors.
 */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.use(express.json());
app.use(cors());

/**
 * Registers a new user with hashed password storage.
 * @param {Request} req - Express HTTP Request
 * @param {Response} res - Express HTTP Response
 */
app.post('/register', async (req, res) => {
    const { firstName, middleInitial, lastName, birthDate, weight, height, username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);
    const query = 'INSERT INTO Users (FirstName, MiddleInitial, LastName, BirthDate, Weight, Height, Username, Email, Password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

    db.query(query, [firstName, middleInitial, lastName, birthDate, weight, height, username, email, hashedPassword], (err, result) => {
        if (err) {
            console.error('Error registering new user:', err);
            res.status(500).send('Error registering new user.');
            return;
        }
        console.log('User registered successfully.');
        res.status(201).send('User registered.');
    });
});

/**
 *  * API endpoint for user sign-in. Validates credentials and returns appropriate response messages.
 * 
 * @param {express.Request} req - Express HTTP request, expected to contain username and password.
 * @param {express.Response} res - Express HTTP response, returns various status messages based on authentication outcome.
 */
app.post('/signin', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    const query = 'SELECT * FROM Users WHERE Username = ?';

    db.query(query, [username], (err, results) => {
        if (err) {
            return res.status(500).send('Error fetching user');
        }
        if (results.length === 0) {
            return res.status(404).send('User not found');
        }

        const user = results[0];
        bcrypt.compare(password, user.Password, (err, isMatch) => {
            if (err) {
                return res.status(500).send('Error comparing passwords');
            }
            if (!isMatch) {
                return res.status(401).send('Invalid credentials');
            }
            console.log('User signed in successfully');
            res.status(201).send('User signed in successfully');
        });
    });
});
 
/**
 * Handles POST requests to the '/messages' endpoint for submitting contact messages.
 * This route sanitizes input to remove HTML, checks for the presence of URLs in the message,
 * and inserts the sanitized message into the database if no URLs are found.
 *
 * @param {express.Request} req The request object, containing 'email' and 'message' in the body.
 * @param {express.Response} res The response object used to send back the HTTP response.
 */
app.post('/messages', (req, res) => {
    let { email, message } = req.body;

    if (!email || !message) {
        return res.status(400).send('Email and message are required.');
    }

    // Sanitize and check for URLs as before
    email = sanitizeHtml(email, { allowedTags: [], allowedAttributes: {} });
    message = sanitizeHtml(message, { allowedTags: [], allowedAttributes: {} });

    const urlRegex = /https?:\/\/\S+/g;
    if (urlRegex.test(message)) {
        return res.status(400).send('URLs are not allowed in the message.');
    }

    // Assuming email can be used to find the UserID
    const userQuery = 'SELECT UserID FROM Users WHERE Email = ?';
    db.query(userQuery, [email], (err, result) => {
        if (err) {
            return res.status(500).send('Database error while fetching user.');
        }
        
        let userID = null;
        if (result.length > 0) {
            userID = result[0].UserID;
        }

        const query = 'INSERT INTO ContactMessages (UserID, Email, Message) VALUES (?, ?, ?)';
        db.query(query, [userID, email, message], (err, result) => {
            if (err) {
                return res.status(500).send('Failed to insert message.');
            }
            res.send('Message received successfully.');
        });
    });
});

/**
 * Simple GET endpoint returning a greeting message.
 * @param {Request} req - Express HTTP Request
 * @param {Response} res - Express HTTP Response
 */
app.get('api/message', (req, res) => {
    res.json({ message: "Hello from server side of fitnessFive" });
});

/**
 * Starts the Express server on a specified port.
 */
app.listen(port, () => {
    console.log(`API listening at http://localhost:${port}/`);
});
