const mongoose = require('mongoose');

const WarmUpDefaultSettingsSchema = new mongoose.Schema({
    increasePerDay: Number,
    dailyWarmupLimit: Number,
    disableSlowWarmup: Boolean,
    replyRate: Number,
    weekdaysOnly: Boolean,
    readEmulation: Boolean,
    warmCustomTrackingDomain: Boolean,
    openRate: Number,
    spamProtection: Number,
    markImportant: Number,
}, { 
    collection: "WarmUpDefaultSettings",
    timestamps: true
});


const WarmUpDefaultSettings = mongoose.model('WarmUpDefaultSettings', WarmUpDefaultSettingsSchema);
module.exports = WarmUpDefaultSettings;