const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
	username: {
		type: String,
		required: true
	},
	bio: {
		type: String,
		required: true
	},
	email: { 
		type: String, 
		index: true,
		unique: true, 
		required: true 
	},
	nomorTelfon: {
		type: Number,
		required: true
	},
	facebook: {
		type: String,
		default: '',
	},
	instagram: {
		type: String,
		default: '',
	},
	password: {
		type: String,
		required: true
	},
	image: {
		secure_url: { type: String, default: '/images/default-profile.jpg' },
		public_id: String
	},
	resetPasswordToken: String,
	resetPasswordExpires: Date

});

module.exports = mongoose.model('UserRegister', UserSchema);
