const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email:  String,
	name: String,
	password: String,
	lastLogin: Date,
    role: Number,
}, { collection: "User" });


const User = mongoose.model('User', UserSchema);
module.exports = User;