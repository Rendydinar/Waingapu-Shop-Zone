const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review.model.js');
const mongoosePaginate = require('mongoose-paginate-v2');

const Product = new Schema({
	title: {
		type: String,
		required: true
	},
	price: {
		type: Number,
		min: 0,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	images: [ 
		{ 
			url: String, 
			public_id: String, 
		},

	],
	location: {
		type: String,
		required: true
	},
	geometry: {
		type: {
			type: String,
			enum: ['Point'],
			required: true
		},
		coordinates: {
			type: [Number], // tipe coordinates berupa array integer/Number
			required: true
		}
	},
	properties: { // untuk menampung deskripsi dari lokasi map 
		description: String
	},
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	stok: {
		type: Number,
		required: true,
		min: 1,
		default: 1
	},
	categori: {
		type: String, 
		required: true
	},
	reviews: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Review'
		}
	],
	avgRating: { type: Number, default: 0 }
});

// event yang akan dijalankan ketika post/produk di remove/hapus
Product.pre('remove', async function() {
	// hapus seluruh review untk post/produk ini di database review bersarkan id
	await Review.remove({
		_id: {
			$in: this.reviews // id review (post.reviews === id review)
		}
	});
});

// membuat method pada Produk (instance)
// method ini berfungsi untuk menghitung jumlah rata-rata rating untuk post/produk (instance)
Product.methods.calculateAvgRating = function() {
	let ratingsTotal = 0;
	
	// jika ada review untuk produk/post ini
	if(this.reviews.length) {
		// tambahkan semua nilai rating yang ada di post/produk ini
		this.reviews.forEach(review => {
 			ratingsTotal += review.rating;
		});
		// hitung nilai rata-rata rating post/produk ini
		this.avgRating = Math.round((ratingsTotal / this.reviews.length) * 10) / 10;
	} else {
		// jika tidak ada review
		// set rata-rata rating post/produk ini menjadi 0
		this.avgRating = ratingsTotal;		
	}

	const floorRating = Math.floor(this.avgRating); // bulatkan rata-rata rating post/produk
	this.save(); // simpan post/produk ini kedalam databasenya setelah mengupdate/melakukan perhitungan rata-rata rating

	return floorRating; // kembalikan nilai rata-rata rating post/produk dari method ini
}

// aktifkan plugin mongoose-paninate di models Post
// ini bergunakan agar model Post dalam melakukan paginasi saat mengambil data/document 
Product.plugin(mongoosePaginate);

// membuat document geometry mendukung 2dsphere yang artinya document/index geometry dapat menyimpan data sebagai titik pada bidang lengkung seperti bumi.
// ini digunakan karena pada fitur kita terdapat pencarian kota bersdasarkan jarak mil-nya maka digunakna fitur ini untuk mencari daftar produk suatu kota dengan luas sebaran daerah seluas n mil.
/*
A 2dsphere index supports queries that calculate geometries on an earth-like sphere. 2dsphere index supports all MongoDB geospatial queries: queries for inclusion, intersection and proximity. For more information on geospatial queries, see Geospatial Queries.
*/
/*Indeks 2dsphere mendukung kueri yang menghitung geometri pada bola mirip bumi. Indeks 2dsphere mendukung semua kueri geospasial MongoDB: kueri untuk inklusi, persimpangan, dan kedekatan. Untuk informasi lebih lanjut tentang kueri geospasial, lihat Kueri Geospasial.*/
Product.index({ geometry: '2dsphere' });

module.exports = mongoose.model('Product', Product);

/*
Post
- title - string
- price -  string
- description - string 
- images - array of string
- location - string 
- coordinates - array
- author - object id
- reviews - array of object
*/