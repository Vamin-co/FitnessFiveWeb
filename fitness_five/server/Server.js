const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sanitizeHtml = require('sanitize-html');
const multer = require('multer');
const path = require('path');
const rateLimit = require('express-rate-limit');
const fs = require('fs');

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());




const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Sarbaaz@#$8090',
    database: 'DbFitnessApp',
    port: 3306
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database: ' + err.stack);
        return;
    }
    console.log('Connected to database as id ' + db.threadId);
});

const SECRET_KEY = 'your_secret_key'; // Define a secret key for signing JWTs

// Middleware to log and send responses for any server errors.
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

/**
 * Registers a new user with hashed password storage.
 */
app.post('/register', async (req, res) => {
    try {
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
    } catch (error) {
        console.error('Error in /register route:', error);
        res.status(500).send('Internal server error.');
    }
});

/**
 * API endpoint for user sign-in. Validates credentials and returns appropriate response messages.
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
            console.error('Error fetching user:', err);
            return res.status(500).send('Error fetching user');
        }
        if (results.length === 0) {
            return res.status(404).send('User not found');
        }

        const user = results[0];
        bcrypt.compare(password, user.Password, (err, isMatch) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                return res.status(500).send('Error comparing passwords');
            }
            if (!isMatch) {
                return res.status(401).send('Invalid credentials');
            }

            const token = jwt.sign({ userID: user.UserID }, SECRET_KEY, { expiresIn: '1h' }); // Generate JWT

            console.log('User logged in successfully:', username);
            res.status(200).json({
                UserID: user.UserID,
                FirstName: user.FirstName,
                LastName: user.LastName,
                Email: user.Email,
                ProfilePhotoURL: user.ProfilePhotoURL,
                token // Return JWT
            });
        });
    });
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.warn('No token provided. Unauthorized access attempt.');
        return res.status(401).send('Unauthorized'); // Unauthorized
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            console.error('Token verification failed:', err);
            return res.status(403).send('Forbidden'); // Forbidden
        }
        req.user = user;
        next();
    });
};

app.get('/profile', authenticateToken, (req, res) => {
    const userID = req.user.userID;
    const query = 'SELECT UserID, FirstName, LastName, Email, ProfilePhotoURL FROM Users WHERE UserID = ?';

    db.query(query, [userID], (err, results) => {
        if (err) {
            console.error(`Error fetching user profile for UserID ${userID}:`, err);
            return res.status(500).send('Error fetching user profile');
        }
        if (results.length === 0) {
            console.warn(`User profile not found for UserID ${userID}`);
            return res.status(404).send('User not found');
        }

        console.log(`User profile fetched successfully for UserID ${userID}`);
        res.json(results[0]);
    });
});


app.put('/profile', authenticateToken, async (req, res) => {
    const userID = req.user.userID;
    const { firstName, middleInitial, lastName, birthDate, weight, height, username, email, password } = req.body;

    try {
        const hashedPassword = password ? await bcrypt.hash(password, 8) : null;
        const query = `
            UPDATE Users SET 
                FirstName = ?, 
                MiddleInitial = ?, 
                LastName = ?, 
                BirthDate = ?, 
                Weight = ?, 
                Height = ?, 
                Username = ?, 
                Email = ?, 
                ${hashedPassword ? 'Password = ?, ' : ''} 
                ProfilePhotoURL = ?
            WHERE UserID = ?
        `;

        const values = [
            firstName, middleInitial, lastName, birthDate, weight, height, username, email,
            ...(hashedPassword ? [hashedPassword] : []),
            req.file ? `uploads/${req.file.filename}` : null,
            userID
        ];

        db.query(query, values, (err, result) => {
            if (err) {
                console.error(`Error updating user profile for UserID ${userID}:`, err);
                return res.status(500).send('Error updating user profile');
            }

            console.log(`User profile updated successfully for UserID ${userID}`);
            res.status(200).send('Profile updated successfully');
        });
    } catch (error) {
        console.error('Error in /profile route:', error);
        res.status(500).send('Internal server error.');
    }
});


/**
 * Handles POST requests to the '/messages' endpoint for submitting contact messages.
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
            console.error('Error fetching user:', err);
            return res.status(500).send('Database error while fetching user.');
        }
        
        let userID = null;
        if (result.length > 0) {
            userID = result[0].UserID;
        }

        const query = 'INSERT INTO ContactMessages (UserID, Email, Message) VALUES (?, ?, ?)';
        db.query(query, [userID, email, message], (err, result) => {
            if (err) {
                console.error('Error inserting message:', err);
                return res.status(500).send('Failed to insert message.');
            }
            console.log('Message received successfully.');
            res.send('Message received successfully.');
        });
    });
});

/// Ensure the 'uploads' directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif'];
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
            console.error('Error fetching user:', err);
            return res.status(500).send('Error fetching user');
        }
        if (results.length === 0) {
            return res.status(404).send('User not found');
        }

        const user = results[0];
        bcrypt.compare(password, user.Password, (err, isMatch) => {
            if (err) {
                console.error('Error comparing passwords:', err);
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
                console.log('Profile photo uploaded and URL saved in database.');
                res.send('Profile photo uploaded and URL saved in database.');
            });
        });
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
