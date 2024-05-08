// Import express and cors modules
const express = require('express');
const cors = require('cors');
const port = 4000
// Create an express application
const app = express();

// We use 'cors' to allow cross-origin requests.
// We use 'app.use()' to add the cors middleware to the express application.
// To parse the incoming requests with JSON payloads we use 'express.json()' which is 
// a built-in middleware function in Express. 

// for parsing application/json requests
app.use(express.json())
// for parsing application/x-www-form-urlencoded requests
// app.use(express.urlencoded({ extended: true }))
// for allowing different domain origins to make requests to this API
app.use(cors())


// Create a GET route
// We create an endpoint that will return a JSON object with the message 'Hello from server side of fitnessFive'
app.get('/message', (req, res) => { // Here '/message' is the path
    res.json({ message: "Hello from server side of fitnessFive" });
});

// Error handling middleware to catch and handle any errors that may occur during request handling
app.use((err, req, res, next) => {
    console.error(err.stack); // Log error stack for debugging
    res.status(500).send('Something broke!'); // Send a 500 error response
});

// Start the server
// 'app.listen()' function takes two inputs, 1.port number in our case 4000,
// and a callback function is called when the server starts, in our case it will just show the 
// message 'Server is running on port 2100'
// Start Express server to listen for API connections
app.listen(port, () => console.log(`API listening at http://localhost:${port}/`))
