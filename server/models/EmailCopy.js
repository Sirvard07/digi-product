const mongoose = require('mongoose');

const EmailCopySchema = new mongoose.Schema({
    name:  String,
    acquiredDate: Date,
    fullHTML: String,
	dateAdded: Date,
}, { collection: "EmailCopy",
     timestamp: true,
}
);

const EmailCopy = mongoose.model('EmailCopy', EmailCopySchema);
module.exports = EmailCopy;