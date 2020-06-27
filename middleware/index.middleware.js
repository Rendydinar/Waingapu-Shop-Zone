const Review = require('../models/review.model.js');
const User = require('../models/user.model.js');
const Product = require('../models/product.model.js');
const { cloudinary } = require('../cloudinary/index.cloudinary.js');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = 'pk.eyJ1IjoicmVuZHlkaW5hciIsImEiOiJjazVhamN5Y2wwd2Z4M25wb3dxd3JieWYyIn0.SDMfrK-4DUwEyRyZ3_dLmQ' //process.env.MAPBOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapBoxToken });

// fungsi untuk menambahkan karakter \  setelah karakter .*+?^${}()|[\]\\ 
// fungsi untuk menambahkan karekter backtip. ini berguna untuk mencegah terjadinya error/hack didatabase mongodb saat ingin melakukan pencarian dalam database
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const middleware = {
	// middleware untuk menghandle error
	asyncErrorHandler: (fn) => 
	  (req, res, next) => {
	    Promise.resolve(fn(req, res, next)) // melakukan resolve
			   .catch(next); // jika terjadi error
	},
	
	// midleware untuk menghandle user siapa yang memiliki hak untuk menambahkan review suatu Product/produk
	isReviewAuthor: async(req, res, next) => {
		let review = await Review.findById(req.params.review_id);
		if(review.author.equals(req.user._id)) {
			return next();
		}
		// 
		req.session.error = 'Anda Tidak Berhak Melakukan Ini';
		return res.redirect('/');
	},

	// middleware untuk mengengecek apakah user sudah login atau belum
	isLoggedIn: (req, res, next) => {
		// cek apakah user sudah login atau belum
		if(req.isAuthenticated()) return next(); // user sudah login

		// user belum login
		req.session.error = 'Anda Harus Login Untuk Melakukan Ini';
		req.session.redirectTo = req.originalUrl; // ambil url yang user tujukan saat user belum login. kemudian simpan di properto req.session.redirectTo (dengan method overide)
		res.redirect('/login');
	},

	// middleware untuk menentukan apakah user seorang author/pemilik di suatu Product/produk
	isAuthor: async (req, res, next) => {
		// cari Product berdasarkan id didatabase
		const product = await Product.findById(req.params.id);
		// cek apakah product dibuat oleh user saat ini atau tidak 
		if(product.author.equals(req.user._id)) {
			// jika user saat ini yang membuat product/produk ini
			res.locals.product = product; // setting variabel res.locals menampung product/produk yang diambil
			return next(); // next
		}

		// jika user saat ini yang bukan membuat product/produk
		req.session.error = 'Akses Ditolak';  // set error
		res.redirect('back'); //redirect back route
	},

	// middleware untuk mengecek apakah password yang user berikan benar atau tidak
	isValidPassword: async (req, res, next) => {
		// midleware untk mengecek apakah password yang diberikan saat update profile valid atau tidak 
		const { user } = await User.authenticate()(req.user.username, req.body.currentPassword);
		if(user) {
			// add user to res.locals
			res.locals.user = user;
			next(); 
		} else {
			middleware.deleteProfileImage(req);
			req.session.error = 'Password salah';
			return res.redirect('/profile');
		}
	},

	// middleware untuk menghandle pergantian password user (kenapa pakai middleware ? karena untuk menghandle session kita menggunakan middleare passport) 
	changePassword: async (req, res, next) => {
		// midleware untk menghandle pergantian password user saat user mengupdate profile
		const {
			newPassword,
			passwordConfirmation
		} = req.body;
		
		// cek apakah user mengupdate/ganti password atau tidak
		if(newPassword && !passwordConfirmation) {
			// user ganti password, tapi tidak memasukan password konfirmasi
			middleware.deleteProfileImage(req);
			req.session.error = 'Tidak ada password konformasi';
			return res.redirect('/profile');
		} else if(newPassword && passwordConfirmation) {			
			// user mengganti password
			const { user } = res.locals;
			
			if(newPassword === passwordConfirmation) {
				// jika password baru sama dengan password confirm
				await user.setPassword(newPassword); // update password user di database
				next(); // next 
			} else {
					// jika password baru tidak sama dengan password confirm
					// kembalikan pesan error
				middleware.deleteProfileImage(req);
				req.session.error = 'Password baru harus sama dengan password confirm';
				return res.redirect('/profile');
			}
		} else {
			// user tidak mengupdate/ganti password
			next(); // next
		}
	},

	// middleware untuk menghandle pengapusan file di cloudinary
	deleteProfileImage: async req => {
		// midleware untuk menghapus profile image
		// ini digunakan bisa jadi karena multer sudah otomatis mengupdload gambar ketika diberikan gambar ke cloudunary, jika terjadi kesahalan saat mengupload profile (seperti password tidak benar) maka midleware ini bisa membantu untk menghapus otomatis gambar yang otomatis diupload multer ke cloudinary kerena gambar tidak digunakan/dibatalkan.
		if(req.file) await cloudinary.v2.uploader.destroy(req.file.public_id)
	},
	
	async searchAndFilterProducts(req, res, next) { // new syntax async (modern)
		const queryKeys = Object.keys(req.query); // ambil properti (bukan nilai properti. tetapi nama properti) yang ada diobject req.query
 		
 		// cek jumlah properti data object req.query
		if(queryKeys.length) {
			// jika jumlah properti dari object req.query >= 1
			const dbQueries = [];
			let { search, price, avgRating, location, distance, categori } = req.query; // ambil properti req.query

			if(search) {
				// jika properti search tidak kosong
				search = new RegExp(escapeRegExp(search), 'gi'); // passing dulu string search menggunakna reqex agar aman digunakan saat melakukan operasi didatabase 
				// create a db query object and push it into the dbQueries array
				// now the database will know to search the title, description, and location
				// fields, using the search regular expression
				dbQueries.push({
					$or: [
					{ title: search },
					{ description: search },
					{ location: search }
					]
				});
			}

			if(categori) {
				// jika user melakukan pencarian berdasarkan kategori
				categori = new RegExp(escapeRegExp(categori), 'gi'); // passing dulu string search menggunakna reqex agar aman digunakan saat melakukan operasi didatabase 
				// create a db query object and push it into the dbQueries array
				// now the database will know to search the title, description, and location
				// fields, using the search regular expression
				dbQueries.push({
					$or: [
					{ categori: categori },
					]
				});

			}
			
			// check if location exists, if it does then we know that the user
			// submitted the search/filter form with a location query
			if(location) {
				// pakai try and catch karena kita menebak apakah lokasi yang dimasukan user berupa format longitude/latitude atau nama tempat
				let coordinates;
				try {
					// akan berjalan mulus jika user memasukan lokasi format longitude/latitude
					location = JSON.parse(location); // parse from "[-43.3434, 34.2342]" to [-43.3434, 34.2342]
					coordinates = location;

	 			} catch(err) {
	 				// akan berjalan dengan mulus jika user memasukan format lokasi dengan nama tempat.
					// geocode the location to extract geo-coordinates (lat, lng)
					const response = await geocodingClient
						.forwardGeocode({
							query: location,
							limit: 1
						})
						.send();
					// destructure coordinates [ <longitude> , <latitude> ]
					coordinates = response.body.features[0].geometry.coordinates;
				}
				// get the max distance or set it to 25 mi
				let maxDistance = distance || 25;
				// we need to convert the distance to meters, one mile is approximately 1609.34 meters
				maxDistance *= 1609.34;
				// create a db query object for proximity searching via location (geometry)
				// and push it into the dbQueries array
				dbQueries.push({
					geometry: {
						near: {
							geometry: {
								type: 'Point',
								coordinates	
							},
							maxDistance: maxDistance, 
						},
						spherical: true
					}
				});
			}
			
			// check if price exists, if it does then we know that the user
			// submitted the search/filter form with a price query (min, max, or both)
			if(price) {
				/*
					check individual min/max values and create a db query object for each
					then push the object into the dbQueries array
					min will search for all post documents with price
					greater than or equal to ($gte) the min value
					max will search for all post documents with price
					less than or equal to ($lte) the min value
				*/
				if(price.min) dbQueries.push({ price: { $gte: price.min } })
				if(price.max) dbQueries.push({ price: { $lte: price.max } })
			}
		
			// check if avgRating exists, if it does then we know that the user
			// submitted the search/filter form with a avgRating query (0 - 5 stars)
			if(avgRating) {
				// create a db query object that finds any post documents where the avgRating
				// value is included in the avgRating array (e.g., [0, 1, 2, 3, 4, 5])
				dbQueries.push({ avgRating: {$in: avgRating} });
			}
				
			// pass database query to next middleware in route's middleware chain
			// which is the postIndex method from /controllers/postsController.js
			res.locals.dbQuery = dbQueries.length ? { $and: dbQueries } : {};
		}

		// pass req.query to the view as a local variable to be used in the searchAndFilter.ejs partial
		// this allows us to maintain the state of the searchAndFilter form
		res.locals.query = req.query;

		// build the paginateUrl for paginatePosts partial
		// first remove 'page' string value from queryKeys array, if it exists
		queryKeys.splice(queryKeys.indexOf('page'), 1);
		/*
			now check if queryKeys has any other values, if it does then we know the user submitted the search/filter form
			if it doesn't then they are on /posts or a specific page from /posts, e.g., /posts?page=2
			we assign the delimiter based on whether or not the user submitted the search/filter form
			e.g., if they submitted the search/filter form then we want page=N to come at the end of the query string
			e.g., /posts?search=surfboard&page=N
			but if they didn't submit the search/filter form then we want it to be the first (and only) value in the query string,
			which would mean it needs a ? delimiter/prefix
			e.g., /posts?page=N
			*N represents a whole number greater than 0, e.g., 1
		*/
		const delimiter = queryKeys.length ? '&' : '?';
		// build the paginateUrl local variable to be used in the paginatePosts.ejs partial
		// do this by taking the originalUrl and replacing any match of ?page=N or &page=N with an empty string
		// then append the proper delimiter and page= to the end
		// the actual page number gets assigned in the paginatePosts.ejs partial
		res.locals.paginateUrl = req.originalUrl.replace(/(\?|\&)page=\d+/g, '') + `${delimiter}page=`;
		// move to the next middleware (postIndex method)
		next();

	}

};

module.exports = middleware;


















