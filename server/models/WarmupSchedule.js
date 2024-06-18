const mongoose = require('mongoose');

const WarmupScheduleSchema = new mongoose.Schema({
    day: Number,
    numberOfEmails: Number
}, { 
    collection: "WarmupSchedule",
    timestamps: true
});


const WarmupSchedule = mongoose.model('WarmupSchedule', WarmupScheduleSchema);
module.exports = WarmupSchedule;