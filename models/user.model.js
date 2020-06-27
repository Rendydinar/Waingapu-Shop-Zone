// const mongoose = require('mongoose');
// const passportLocalMongoose = require('passport-local-mongoose');
// const Schema = mongoose.Schema;

// const UserSchema = new Schema({
// 	email: String,
// 	image: String,
// 	posts: [
// 		{
// 			type: Schema.Types.ObjectId,
// 			ref: 'Post'
// 		}
// 	]
// });

// module.exports = mongoose.model('User', UserSchema);

// /*User
// - email - string
// - password - string
// - username - string
// - profilePic - string
// - posts - array of object (ref Post)s
// - reviews - array of object (ref Review)
// */
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;
const { cloudinary } = require('../cloudinary/index.cloudinary.js');
const Review = require('./review.model.js');
const Product = require('./product.model.js');


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
	},
	instagram: {
		type: String,
	},

	image: {
		secure_url: { type: String, default: '/images/default-profile.jpg' },
		public_id: String
	},
	resetPasswordToken: String,
	resetPasswordExpires: Date
});

// memasang plugin untuk mendukung penggunakan passportjs dengan metode local authentikasi untuk models user pada database.
UserSchema.plugin(passportLocalMongoose);

// event yang akan dijalankan ketika post/produk di remove/hapus
// UserSchema.pre('remove', async function() {
	/**
	 * Hapus foto profile user
	 * Cek apakah user mengupload sendiri foto profilenya sendiri atau menggunakna foto default
	 * Jika menggunakan foto yang diupload, hapus foto tersebut di cloudinary
	 *
	 */
	// if(this.image.public_id !== undefined && this.image.public_id.length !== 0) await cloudinary.v2.uploader.destroy(image.public_id);
	
	// *
	//  * Hapus semua product dan foto product yang dimiliki user
	 
	
	// let listProductWillDelete = await Product.find({author: this._id});

	// console.log(listProductWillDelete);

	// // hapus seluruh review untk post/produk ini di database review bersarkan id
	// await Review.remove({
	// 	_id: {
	// 		$in: this.reviews // id review (post.reviews === id review)
	// 	}
	// });
// });


module.exports = mongoose.model('User', UserSchema);

 		// // perulangan untuk menghapus seluruh gambar product di cloudinary 
 		// product.images.forEach(async (img) => {
			// 	// hapus gambar dari cloudinary berdasarkan public id, menggunakan API cloudinary
 		// 		await cloudinary.v2.uploader.destroy(img.public_id);
 		// });

