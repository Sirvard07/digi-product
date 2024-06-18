const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = (req, res, next) => {
    // Get the token from the request header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // If there's no token, return an error
    if (token == null) {
        return res.sendStatus(401); // Unauthorized
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
        if (err) {
            return res.sendStatus(403); // Forbidden
        }

        // Add the user to the request object
        let userExists = await User.findOne({ email: user.email });
        if (userExists != null) {
            req.userExists = true;
        }
        
        // Proceed to the next middleware function
        next();
    });
};

module.exports = authenticateToken;
