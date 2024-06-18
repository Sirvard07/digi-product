const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
    name:  String,
    description:  String,
	domainIds: [String],
}, { 
    collection: "Group",
    timestamp: true,
});


const Group = mongoose.model('Group', GroupSchema);
module.exports = Group;