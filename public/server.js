// server.js
// Import necessary modules
const express = require('express'); // Express.js for creating the server
const bodyParser = require('body-parser'); // Body-parser to handle request bodies
const fs = require('fs'); // File system module to work with files
const path = require('path'); // Path module for handling file paths

const app = express(); // Create an Express application
const port = 3000; // Define the port the server will listen on

// Middleware to parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // Middleware to parse JSON bodies

// Serve static files from the 'public' directory
// This makes files in the 'public' folder accessible directly from the browser
app.use(express.static(path.join(__dirname, 'public')));

// --- Signup Endpoint ---
app.post('/signup', (req, res) => {
    // Log that a signup request was received (for debugging)
    console.log('Signup request received');

    // Extract email and password from the request body
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        // Respond with an error if email or password is missing
        return res.status(400).send('Email and password are required.');
    }

    // Create a new user object with email, password, and a signup timestamp
    const newUser = {
        email: email,
        password: password, // In a real application, you should hash the password!
        timestamp: new Date().toISOString() // Record signup time
    };

    // Path to the users.json file in the same directory as server.js
    const usersFilePath = path.join(__dirname, 'users.json');

    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        let users = []; // Initialize users array

        if (!err) {
            // If users.json exists and is readable, parse existing users from it
            try {
                users = JSON.parse(data);
            } catch (parseError) {
                // Handle potential JSON parsing error (e.g., if file is corrupted)
                console.error('Error parsing users.json:', parseError);
                return res.status(500).send('Error reading user data.');
            }
        } else if (err.code !== 'ENOENT') {
            // If there's an error reading the file other than 'file not found', send error response
            console.error('Error reading users.json:', err);
            return res.status(500).send('Failed to read user data.');
        }

        // Add the new user to the users array
        users.push(newUser);

        // Write the updated users array back to users.json
        fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (writeErr) => {
            if (writeErr) {
                // If there's an error writing to the file, send error response
                console.error('Error writing to users.json:', writeErr);
                return res.status(500).send('Signup failed: Could not save user data.');
            }

            // If writing is successful, send a success response
            res.status(200).send('Signup successful!');
        });
    });
});

// --- Login Endpoint ---
app.post('/login', (req, res) => {
    // Log that a login request was received (for debugging)
    console.log('Login request received');

    // Extract email and password from the login form request
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        // Respond with an error if email or password is missing
        return res.status(400).send('Email and password are required.');
    }

    // Path to the users.json file
    const usersFilePath = path.join(__dirname, 'users.json');

    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            // If users.json cannot be read (or doesn't exist), send an error
            console.error('Error reading users.json for login:', err);
            return res.status(500).send('Login failed: Could not read user data.');
        }

        let users = [];
        try {
            // Parse the user data from users.json
            users = JSON.parse(data);
        } catch (parseError) {
            // Handle JSON parsing error
            console.error('Error parsing users.json for login:', parseError);
            return res.status(500).send('Login failed: Error reading user data.');
        }

        // Find a user in the users array that matches the login email and password
        const user = users.find(u => u.email === email && u.password === password); // In real app, compare hashed passwords

        if (user) {
            // If a matching user is found, login is successful
            res.status(200).send('Login successful!');
        } else {
            // If no matching user is found, login fails
            res.status(401).send('Login failed: Invalid credentials.');
        }
    });
});

// --- Start the server ---
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
