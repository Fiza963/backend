const express = require('express');
const router = express.Router();
const User = require('../models/User');

//  We no longer need to import bcrypt here, as the hashing is done in the schema file.

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email, and password are required' });
        }

        /*  REMOVED: This explicit check is redundant and slower. 
        We rely on the 'unique: true' constraint in the Mongoose schema 
        and handle the resulting duplicate key error (code 11000) below.
        */

        const newUser = new User({ username, email, password });
        // The password will be hashed automatically by the pre-save hook
        await newUser.save();

        //  Since the password field has 'select: false', it won't be sent in the response.
        res.status(201).json({ message: 'User registered successfully', user: { 
            _id: newUser._id, 
            username: newUser.username, 
            email: newUser.email 
        }});
        
    } catch (error) {
        //  FIX: Handle MongoDB unique constraint errors (code 11000)
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            let message = 'Registration failed due to duplicate data.';

            if (field === 'email') {
                message = 'A user with this email already exists.';
            } else if (field === 'username') {
                message = 'This username is already taken.';
            }
            return res.status(409).json({ message }); // 409 Conflict
        }
        
        console.error(' Error in /register route:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;