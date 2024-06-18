const mongoose = require('mongoose');

const EmailAccountNameSchema = new mongoose.Schema({
    firstName:  String,
	lastName: String,
	isRequired: Boolean
}, { 
	collection: "EmailAccountName",
    timestamps: true
});


const EmailAccountName = mongoose.model('EmailAccountName', EmailAccountNameSchema);
module.exports = EmailAccountName;