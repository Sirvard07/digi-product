const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');

const { 
    
    dashboardDataGET,

} = require('../controllers/dashboardController');

// Email Account Names List
router
    .route('/get')
    .post(authenticateToken, dashboardDataGET);

module.exports = router;