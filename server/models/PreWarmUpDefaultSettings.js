const mongoose = require('mongoose');

const PreWarmUpDefaultSettingsSchema = new mongoose.Schema({
    namecheapUsername: String,
    namecheapApiKey:  String,
    instantlyApiKey: String,
    numberOfEmailAccountsPerDomain: Number,
    defaultEmailAccountPassword: String,
    MTAIpAddress: String
}, { 
    collection: "PreWarmUpDefaultSettings",
    timestamps: true
});


const PreWarmUpDefaultSettings = mongoose.model('PreWarmUpDefaultSettings', PreWarmUpDefaultSettingsSchema);
module.exports = PreWarmUpDefaultSettings;