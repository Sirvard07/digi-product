const mongoose = require('mongoose');

const EmailAccountSchema = new mongoose.Schema({
    name:  String,
    firstName: String,
    lastName: String,
    domainName:  String,
    fullEmail: String,
    domainId: String,
    isConnectedToInstantly: Boolean,
    dateConnectedToInstantly: Date,
	cPanelAccountId: String,
	cPanelAccountName: String,
    cPanelPrimaryDomainName: String,
    password: String,
    replyRate: Number,
    isLocked: Boolean,
    isRequired: Boolean,
    inRecoveryMode: Boolean,
	currentWarmupDay: Number,
    warmupLimitDaily: Number,
    productionLimitDaily: Number,
	dateAdded: Date,
}, { 
    collection: "EmailAccount",
    timestamps: true
});


const EmailAccount = mongoose.model('EmailAccount', EmailAccountSchema);
module.exports = EmailAccount;