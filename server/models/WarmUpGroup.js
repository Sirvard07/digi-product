const mongoose = require('mongoose');

const WarmUpGroupSchema = new mongoose.Schema({
    name:  String,
	domains: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Domain'
    }],
    priority: Boolean,
}, { 
    collection: "WarmUpGroup",
    timestamps: true,
});


const WarmUpGroup = mongoose.model('WarmUpGroup', WarmUpGroupSchema);
module.exports = WarmUpGroup;