const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');

const { 
    // Warmup Schedule
    downloadFile

} = require('../controllers/exportsController');

// Warmup Schedule
router
    .route('/download-file/:filename')
    .post(authenticateToken, downloadFile);
    

module.exports = router;