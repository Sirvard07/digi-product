const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {parse} = require('csv-parse');
var fs = require('fs'); 
const path = require('path');

const WarmupSchedule = require('../models/WarmupSchedule');
const WarmUpDefaultSettings = require('../models/WarmUpDefaultSettings');

// START Default Settings

exports.downloadFile = async (req, res, next) => {


    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../exports', filename);

    // Set headers to prompt download on the client side
    res.download(filePath, filename, (err) => {
        if (err) {
        // Handle error, but keep in mind the response may be partially-sent
        console.error(err);
        if (!res.headersSent) {
            res.status(500).send('Error occurred while downloading the file.');
        }
        } else {
        // Delete the file after sending it to the client
        fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
            console.error('Error deleting the file:', unlinkErr);
            }
        });
        }
    });

};


// END Default Settings