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
const multer = require('multer');
const path = require('path');
const rateLimit = require('express-rate-limit');
const fs = require('fs'); // Add this line to import the fs module
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
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    const query = `
        SELECT u.UserID, u.FirstName, u.LastName, u.Email, u.Password, u.ProfilePhotoURL 
        FROM Users u
        WHERE u.Username = ?
    `;

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

            res.status(200).json({
                UserID: user.UserID,
                FirstName: user.FirstName,
                LastName: user.LastName,
                Email: user.Email,
                ProfilePhotoURL: user.ProfilePhotoURL
            });
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

// Ensure the 'uploads' directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log(`Created directory: ${uploadDir}`);
} else {
    console.log(`Directory already exists: ${uploadDir}`);
}

/// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);  // Use the correct path reference
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
        const error = new Error("Invalid file type");
        error.status = 400;
        return cb(error, false);
    }
    cb(null, true);
};

const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: { fileSize: 3 * 1024 * 1024 } // 3MB file size limit
});

const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// Endpoint to handle image upload
app.post('/upload', uploadLimiter, upload.single('profilePhoto'), (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    const query = `
        SELECT UserID, Password 
        FROM Users 
        WHERE Username = ?
    `;

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

            const userId = user.UserID;
            const profilePhotoURL = `uploads/${req.file.filename}`;

            // Update the Users table
            const updateUserQuery = 'UPDATE Users SET ProfilePhotoURL = ? WHERE UserID = ?';
            db.query(updateUserQuery, [profilePhotoURL, userId], (err, result) => {
                if (err) {
                    console.error('Database update error:', err);
                    return res.status(500).send('Server error');
                }
                res.send('Profile photo uploaded and URL saved in database.');
            });
        });
    });
});


// Endpoint to retrieve user profile
app.get('/profile/:id', (req, res) => {
    const id = req.params.id;
    const query = `
        SELECT u.*, p.ProfilePhotoURL 
        FROM Users u 
        LEFT JOIN UserProfilePhotos p ON u.UserID = p.UserID 
        WHERE u.UserID = ?
    `;

    db.query(query, [id], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            res.json(result[0]);
        } else {
            res.status(404).send('Profile not found.');
        }
    });
});

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(uploadDir));

/**
 * Starts the Express server on a specified port.
 */
app.listen(port, () => {
    console.log(`API listening at http://localhost:${port}/`);
});
