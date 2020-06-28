const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment-timezone');


const ReviewSchema = new Schema({
	body: {
		type: String,
		reqiured: true
	},
	rating: { 
		type: Number,
		reqiured: true
	},
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	createAt: {type: Date, default: moment().tz('Asia/Makassar').format('L')}
});

module.exports = mongoose.model('Review', ReviewSchema);

/*
/*
Review
- body - string
- author - object id (ref user)
*/