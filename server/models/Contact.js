const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    email:  String,
    firstName:  String,
	lastName: String,
	source: String,
    acquiredDate: Date,
    status: String,
    statusReason: String,
    lastSentDate: Date,
    lastOpenDate: Date,
    lastClickDate: Date,
	dateAdded: Date,
}, { collection: "Contact",
     timestamp: true,
}
);


const Contact = mongoose.model('Contact', ContactSchema);
module.exports = Contact;