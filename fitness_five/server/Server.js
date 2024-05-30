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
const { check, validationResult } = require('express-validator'); 


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


// POST route to create a new workout
app.post('/workouts', [authenticateToken, [
    check('title', 'Title is required').not().isEmpty(),
]], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { title, exercises } = req.body;
        const query = 'INSERT INTO Workouts (UserID, Title) VALUES (?, ?)';

        db.query(query, [req.user.userID, title], (err, result) => {
            if (err) {
                console.error('Error inserting workout:', err);
                return res.status(500).send('Failed to insert workout.');
            }

            const workoutID = result.insertId;

            const exerciseQuery = 'INSERT INTO Exercises (WorkoutID, Name, Sets, Reps, TargetSets, TargetReps) VALUES ?';
            const exerciseValues = exercises.map(exercise => [workoutID, exercise.name, exercise.sets, exercise.reps, exercise.targetSets, exercise.targetReps]);

            db.query(exerciseQuery, [exerciseValues], (err, result) => {
                if (err) {
                    console.error('Error inserting exercises:', err);
                    return res.status(500).send('Failed to insert exercises.');
                }
                console.log('Workout and exercises inserted successfully.');
                res.json({ workoutID, title, exercises });
            });
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).send('Server error.');
    }
});

// GET route to fetch workouts for the authenticated user
app.get('/workouts', authenticateToken, (req, res) => {
    const query = 'SELECT * FROM Workouts WHERE UserID = ?';

    db.query(query, [req.user.userID], (err, results) => {
        if (err) {
            console.error('Error fetching workouts:', err);
            return res.status(500).send('Error fetching workouts.');
        }
        res.json(results);
    });
});

// PUT route to update an existing workout
app.put('/workouts/:id', authenticateToken, (req, res) => {
    const { title, exercises } = req.body;

    const query = 'UPDATE Workouts SET Title = ? WHERE WorkoutID = ? AND UserID = ?';

    db.query(query, [title, req.params.id, req.user.userID], (err, result) => {
        if (err) {
            console.error('Error updating workout:', err);
            return res.status(500).send('Error updating workout.');
        }

        const deleteExerciseQuery = 'DELETE FROM Exercises WHERE WorkoutID = ?';
        db.query(deleteExerciseQuery, [req.params.id], (err, result) => {
            if (err) {
                console.error('Error deleting old exercises:', err);
                return res.status(500).send('Error deleting old exercises.');
            }

            const exerciseQuery = 'INSERT INTO Exercises (WorkoutID, Name, Sets, Reps, TargetSets, TargetReps) VALUES ?';
            const exerciseValues = exercises.map(exercise => [req.params.id, exercise.name, exercise.sets, exercise.reps, exercise.targetSets, exercise.targetReps]);

            db.query(exerciseQuery, [exerciseValues], (err, result) => {
                if (err) {
                    console.error('Error inserting new exercises:', err);
                    return res.status(500).send('Error inserting new exercises.');
                }
                console.log('Workout and exercises updated successfully.');
                res.json({ workoutID: req.params.id, title, exercises });
            });
        });
    });
});

// DELETE route to delete a workout and its exercises
app.delete('/workouts/:id', authenticateToken, (req, res) => {
    const query = 'DELETE FROM Workouts WHERE WorkoutID = ? AND UserID = ?';

    db.query(query, [req.params.id, req.user.userID], (err, result) => {
        if (err) {
            console.error('Error deleting workout:', err);
            return res.status(500).send('Error deleting workout.');
        }
        const deleteExerciseQuery = 'DELETE FROM Exercises WHERE WorkoutID = ?';
        db.query(deleteExerciseQuery, [req.params.id], (err, result) => {
            if (err) {
                console.error('Error deleting exercises:', err);
                return res.status(500).send('Error deleting exercises.');
            }
            console.log('Workout and exercises deleted successfully.');
            res.json({ msg: 'Workout deleted successfully.' });
        });
    });
});
/**
 * Starts the Express server on a specified port.
 */
app.listen(port, () => {
    console.log(`API listening at http://localhost:${port}/`);
});
