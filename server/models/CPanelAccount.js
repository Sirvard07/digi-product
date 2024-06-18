const mongoose = require('mongoose');

const CPanelAccountSchema = new mongoose.Schema({
    name:  String,
    primaryDomainName:  String,
	ipAddress: String,
	port: String,
    numberOfDomains: Number,
    whmUsername: String,
    whmPassword: String,
    whmApiKey: String,
    cPanelUsername: String,
    cPanelPassword: String,
    cPanelApiKey: String,
	dateAdded: Date,
}, { 
    collection: "CPanelAccount",
    timestamps: true
});


const CPanelAccount = mongoose.model('CPanelAccount', CPanelAccountSchema);
module.exports = CPanelAccount;