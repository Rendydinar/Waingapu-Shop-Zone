const passport = require('passport');
const User = require('../models/user.model.js');
const UserRegister = require('../models/UserRegister.model.js');
const Product = require('../models/product.model.js');
const Review = require('../models/review.model.js');
const mapBoxToken = 'pk.eyJ1IjoicmVuZHlkaW5hciIsImEiOiJjazVhamN5Y2wwd2Z4M25wb3dxd3JieWYyIn0.SDMfrK-4DUwEyRyZ3_dLmQ'; //process.env.MAPBOX_TOKEN;
const util = require('util');
const { cloudinary } = require('../cloudinary/index.cloudinary.js');
const { deleteProfileImage } = require('../middleware/index.middleware.js');
const crypto = require('crypto');
// const bycrypt = require('bycrypt');
const mailService = require('../config/mailer.config.js')();
const { PostRegisterSchema, PostLoginSchema, PutUserProfileSchema, PutChangePasswordSchema, deleteAccountSchema } = require('../utils/Schema.util.js')


/**
 * Fungsi untuk mengecek apakah email sudah terdaftar didalam database atau belum
 * Return true jika email sudah terdaftar, false jika email belum terdaftar
 */
const checkEmailExist = (email) => (new Promise((resolve, reject) => {
	User.findOne({ email: String(email).toLowerCase() }, (err, user) => {
		if(err) reject(err);
		resolve(user);
	});
}));

/**
 * Fungsi untuk mengecek apakah usernam sudah terdaftar didalam database atau belum
 * Return true jika usernam sudah terdaftar, false jika usernam belum terdaftar
 */
const checkUsernameExist = (username) => (new Promise((resolve, reject) => {
	User.findOne({ username: String(username) }, (err, user) => {
		if(err) reject(err);
		resolve(user);
	});
}));


module.exports = {
	// GET /
	async landingPage(req, res, next) {
		const products = await Product.find({}).populate({path: 'author'}).sort('-_id'); // urutkan data Product secara descending
		const categories = await Product.find().distinct('categori');
		const recentProducts = products.slice(0, 3); // ambil 3 buah Product yang baru saja dimuatkan

		/**
		 * Atur untuk dijadikan sidebar kategori produk
		 */
	  	res.locals.categories = categories;
	  	req.session.categories = categories;

	  	console.log(recentProducts);

		return res.render('index', { products, mapBoxToken, recentProducts, titlePage: 'Waingapu Shop Zone - Home' });
	},

	// GET /register
	getRegister(req, res, next) {
		return res.render('register', { titlePage: 'Register', username: '', email: '', nomorTelfon: '', facebook: '', instagram: '', bio: '' } );
	},

	// POST /register
	async postRegister(req, res, next) {
		console.log(req.body);
		/**
		 * Kita melakukan try and catch.
		 * Berguna agar kita dapat mengetahui penyebab error saat mencoba mendaftar akun user.
		 * Kemudian kita dapat melakukan customisasi error tanpa dihandle oleh middleware asyncErrorHandler.
		 * Ini bertujuan untuk karena passportjs melakukan authentikasi pendaftaran akun dengan melihat username, jika username sudah ada maka passportjs otomatis akan membatalkan register akun user.
		 * Kita juga akan melakukan validasi email register akun user.
		 */
		try {
			if(req.file) {
				// user memasukan foto profile
				const { secure_url, public_id } = req.file; // ambil secure_url, public_id yang sudah dihandle oleh multer untuk penyimpanan cloudinary
				req.body.image = {
					secure_url,
					public_id
				};
			} else {
				req.body.image =  {
					secure_url: '/images/default-user-avatar.png'
				} 
			}

			// validasi data request
			const result = PostRegisterSchema.validate(req.body);
		  	if(!result.error) {
			    // data request valid
  				// cek apakah saat register akun user langsung memasukan foto profile atau tidak
		

				// cek apakah email register akun user sudah digunakan oleh akun user lain atau belum.
				const isEmailExist = await checkEmailExist(req.body.email);

				/**
				 * jika email register akun user sudah digukan akun lain.
				 * hentikan register akun
				 */
				if(isEmailExist) throw new Error ('Email ini sudah didaftarkan oleh pengguna lain, silakan menggantikan email');

				// cek apakah username register akun user sudah digunakan oleh akun user lain atau belum.
				const isUsernameExist = await checkUsernameExist(req.body.username);

				/**
				 * jika username register akun user sudah digukan akun lain.
				 * hentikan register akun
				 */
				if(isUsernameExist) throw new Error ('Username ini sudah didaftarkan oleh pengguna lain, silakan menggantikan Username');

				/**
				 * Data register akun user valid
				 * Buat token untuk melakukan verikasi pendaftaraan akun menggunakan email.
				 * Tambahkan user baru kedalam database
				 * Untuk password user, akan langsung di hashsing.
				 */
				const token = await crypto.randomBytes(20).toString('hex'); // membuat string biasa dari string tipe hexadesimal acak 
		
				const NewUserRegister = new UserRegister({
					username: String(req.body.username),
					bio: String(req.body.bio),
					email: String(req.body.email).toLowerCase(),
					image: req.body.image,
					nomorTelfon: Number(req.body.nomorTelfon),
					facebook: String(req.body.facebook).toLowerCase() || '',
					instagram: String(req.body.instagram).toLowerCase() || '',
					password: String(req.body.password),
					resetPasswordToken: token, // tambahkan token dalam database user
					resetPasswordExpires: Date.now() + 3600000, // settting 1 jam dari sekarang batas waktu
				});

		
				// email user terdaftar/valid
				await NewUserRegister.save(); // simpan database user setelah diupdate token reset password dan batas waktu token.

				const msg = {
					to: req.body.email,
					subj: 'Waingapu Shop Zone App Ecommerce - Verifikasi Email',
				 	text: `Anda menerima ini karena Anda (atau orang lain)
				  	telah meminta untuk membuat akun Anda di Waingapu Shop Zone.
				  	Silakan klik tautan berikut, atau salin dan tempel
				  	ke browser Anda untuk menyelesaikan proses:
				  	http://${req.headers.host}/register/${token}
				  	Jika Anda tidak meminta ini, abaikan email ini dan
					Email anda tidak akan didaftarkan di Waingapu Shop Zone`.replace(/		/g, ''), // set text email. ubah tab menjadi spasi biasa dengan reqex
					// html: '<strong>and easy to do anywhere, even with Node.js</strong>'
				}

				const resultSendMsg = await mailService.send(msg); // kirimkan ke email user untuk mendapatkan token verifikasi reset password 
				console.log(`Hasil pengiriman email ke email ${req.body.email} untuk melakukan verifikasi email pendaftar akun`);
				console.log(resultSendMsg);

				req.session.success = `Sebuah token verifikasi akun sudah dikirimkan ke ${req.body.email} dengan intruksi untuk melakukan verifikasi akun. Segera Lakukan Verifikasi Batas Verifikasi Mulai 1 Dari Sekarang`;
				return res.redirect('/verifikasi-email');
		  } else {
		    // data request tidak valid
		    const { details } = result.error;
		    const message = details.map(i => i.message).join(',');
		    console.log('error, ', message);
		    /**
		     * Jika terjadi error saat validasi username dan email user
		     * Maka kita hapus foto profile yang dimuat sebelumnya di cloudinary karena kita menggunakan middleware multer yang otomatis langsung upload gambar di cloudinary ketika user memasukan gambar.
		     */
		    deleteProfileImage(req);
		    let error = 'Data Tidak Valid';
		    return res.status(422).render('register', { titlePage: 'Register', username: req.body.username, email: req.body.email, error, nomorTelfon: req.body.nomortelfon, facebook: req.body.facebook, instagram: req.body.instagram, bio: req.body.bio});  
		  }
		} catch(err) {
			/**
			 * Jika terjadi error saat validasi username dan email user
			 * Maka kita hapus foto profile yang dimuat sebelumnya di cloudinary karena kita menggunakan middleware multer yang otomatis langsung upload gambar di cloudinary ketika user memasukan gambar.
			 */
			deleteProfileImage(req);
			console.log(err.message)
			// jika terjadi error karena email yang  user register sudah terfdaftar kedalam models userRegister
			if(err.message.includes('userregisters index: email_1 dup key')) {
				req.session.success = `Sebuah token verifikasi akun sudah dikirimkan ke ${req.body.email} dengan intruksi untuk melakukan verifikasi akun. Segera Lakukan Verifikasi Batas Verifikasi Mulai 1 Dari Sekarang`;
				return res.redirect('/verifikasi-email');
			} else if(err.message = 'Email ini sudah didaftarkan oleh pengguna lain, silakan menggantikan email') {
				// jika terjadi erorr saat melakukan pendaftar akun user/Product register
				const { username, email, nomorTelfon, facebook, instagram, bio } = req.body;
				let error = err; // ambil pesan error
				res.locals.error = 'Email ini sudah didaftarkan oleh pengguna lain, silakan menggantikan email'
		   	 	return res.status(422).render('register', { titlePage: 'Register', username, email, error, nomorTelfon, facebook, instagram, bio });  
			} else {
				// jika terjadi erorr saat melakukan pendaftar akun user/Product register
				const { username, email, nomorTelfon, facebook, instagram, bio } = req.body;
				let error = err; // ambil pesan error
				res.locals.error = 'Data valid';
		   	 	return res.status(422).render('register', { titlePage: 'Register', username, email, error, nomorTelfon, facebook, instagram, bio });  
			}
		}
	},

	// GET /login
	getLogin(req, res, next) {
		// jika user sudah login, tidak perlu login ulang
		if(req.isAuthenticated()) return res.redirect('/');

		// jika saat mau login user sudah menentukan tujuan url yang diinginkan tetapi membutuhkan akses login.
		if(req.query.redirectTo) req.session.redirectTo = req.headers.referer; // ambil url yang user ingin tujukan sebelum ini.
		return res.render('login', { titlePage: 'Login' } );
	},

	// Product /login
	async postLogin(req, res, next) {
		const result = PostLoginSchema.validate(req.body);

	  	if(!result.error) {
	   	 	// data request valid
			const { username, password } = req.body;
			console.log(req.body);
			const { user, error } = await User.authenticate()(username, password); // melakukan authentikasi dengan passport dengan memberikan parameter berupa username dan password

			/**
			 * cek apakah user ada di database/sudah terdaftar atau belum
			 * variabel user akan bernilai false(user tidak ditemukan)/true(user ditemukan)
			 */
			if(!user && error) { 
				if(error.name.includes('IncorrectPasswordError')) {
						req.session.error = 'Nama User atau Password Salah';
						return res.status(422).redirect('/login');
						// return next(error); // jika user belum melakukan registrasi (tidak ada didatabase) dan terjadi error
				}
			}

			/**
			 * Akun user sudah melakukan registrasi dan tidak terjadi error.
			 * Sekarang kita login otomatis user ke aplikasi
			 */
			req.login(user, function(err) {
				// set login user
				if(err) {
					if(err.message.includes('user.get is not a function')){
						// err.message = "Nama User atau Password Salah";
						// err.status = 422;
						req.session.error = 'Nama User atau Password Salah';
						return res.status(422).redirect('/login');
						// return next(err); // jika terjadi error saat mencoba login user
					}

				} 

				// lihat apakah user ingin mengingatkan password atau tidak
				if (req.body.remember === "yes") {
	      			req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // Cookie expires after 30 days
	      			console.log('remember me');
		        } else {
	      			console.log('dont remember me');
		          req.session.cookie.expires = false; // Cookie expires at end of session
		        }				

		        // eval(require('locus'));
				// set flash messege bahwa user berhasil login
				req.session.success = `Selamat datang kembali, ${username}`;

				/**
				 * Ambil redirectUrl yang sudah disetting.
				 * Jika redirectUrl kosong, maka isi defaultnya dengan route landing page.
				 */
				const redirectUrl = req.session.redirectTo || '/';
				delete req.session.redirectTo; // hapus properti req.session.redirectTo (url dimana sebelumnya user ingin tuju)
				return res.redirect(redirectUrl); // redirect user yang telah berhasil login.
			});
	 	} else {
		    // data request tidak valid
		    console.log(result.error.details[0])
		    const { details } = result.error;
		    const message = details.map(i => i.message).join(',');
		    console.log('error, ', message);
		    /**
		     * Jika terjadi error saat validasi username dan email user
		     * Maka kita hapus foto profile yang dimuat sebelumnya di cloudinary karena kita menggunakan middleware multer yang otomatis langsung upload gambar di cloudinary ketika user memasukan gambar.
		     */
		    let error = 'Nama User atau Password Salah';
		    return res.status(422).render('login', { titlePage: 'Login', username: req.body.username, password: '', error});  
	  	}
	},
	
	// GET /logout
	async getLogout(req, res, next) {
		/**
		 * User Logout
		 * Hapus session passport user di aplikasi
		 * Kembali ke landing page aplikasi
		 */
		await req.logout();
		req.session.success = 'Berhasil Logout';
  		return res.redirect('/');
	},

	// GET /profile
	async getProfile(req, res, next) {
		const products = await Product.find().where('author').equals(req.user._id).limit(10).exec(); // ambil 10 Product/produk terkahir yang user buat/Tambahkan.

		// render profile user page
		return res.render( 'profile', { products} );
	},

	// GET /profile/edit
	// Fungsi untuk merender halaman data akun user 
	// kemudian mengupdatenya
	async getProfileUpdate(req, res, next) {
		return res.render('users/updateProfile');
	},


	/**
	 * Update /profile
	 * Fungsi untuk melakukan update profile user
	 */
	async updateProfile(req, res, next) {
		try {
		  	const result = PutUserProfileSchema.validate(req.body);
		  	const products = await Product.find().where('author').equals(req.user._id).limit(10).exec(); // ambil 10 post/Product terkahir yang user buat/Tambahkan.

		  	if(!result.error) {
				/**
				 * Data request valid
				 * Kita melakukan try and catch.
				 * Berguna agar kita dapat mengetahui penyebab error saat mencoba mengubuah data akun.
				 * Kemudian kita dapat melakukan customisasi error tanpa dihandle oleh middleware asyncErrorHandler.
				 * Ini bertujuan untuk melakukan validasi email register akun user.
				 */
				const { 
					username,
					email,
					facebook,
					instagram,
					bio,
				} = req.body; 

				const { user } = res.locals; // ambil data user saat ini di variabel res.locals

				// cek apakah user ingin mengubah nama atau tidak
				if(String(username) !== user.username) {
					// user ingin mengubah username

					// cek apakah username register akun user sudah digunakan oleh akun user lain atau belum.
					const isUsernameExist = await checkUsernameExist(String(username));

					/**
					 * jika username register akun user sudah digukan akun lain.
					 * hentikan register akun
					 */
					if(isUsernameExist) {
					    return res.status(422).render( 'profile', { products, error: 'Username ini sudah didaftarkan oleh pengguna lain, silakan menggantikan Username'} );
					}
					// username baru valid, set username baru user
					user.username = String(username); 
				} 

				// cek apakah user ingin mengubah email
				// if(email.toLowerCase() !== user.email) {
				// 	// user ingin mengubah email

				// 	// cek apakah email register akun user sudah digunakan oleh akun user lain atau belum.
				// 	const isEmailExist = await checkEmailExist(email);

				// 	if(isEmailExist) throw new Error ('Email Sudah digunakan pengguna lain, silakan menggantikan email');

				// 	// email baru valid, set email baru user
				// 	user.email = String(email).toLowerCase(); 
				// } 

				// cek apakah update fto profile atau tidak
				if(req.file) {
					/**
					 * Jika update foto profile
					 * hapus gambar saat ini dulu di cloudinary
					 * ambil secure_url, public_id gambar yang baru yang otomatis di upload multer ketika diberikan gambar
					 * simpan kedalam database user 
					 */
					if(user.image.public_id) await cloudinary.v2.uploader.destroy(user.image.public_id); 
					const { secure_url, public_id } = req.file; //   
					user.image = { secure_url, public_id }; // upload kedalam database utntuk user 
				}

				user.facebook  = String(facebook).toLowerCase();
				user.instagram  = String(instagram).toLowerCase();
				user.bio  = String(bio);

				await user.save(); // simpan data user yang diupdate kedalam database
				/*
					dokumentasi util.promisify
					Takes a function following the common error-first callback style, i.e. taking an (err, value) => ... callback as the last argument, and returns a version that returns promises.
					const util = require('util');
					const fs = require('fs');

					const stat = util.promisify(fs.stat);
					stat('.').then((stats) => {
					  // Do something with `stats`
					}).catch((error) => {
					  // Handle the error.
					});
				*/

				// const login = util.promisify(req.login.bind(req));

				// await login(user); // login ke akun user yang sama tetapi dengan password yang baru diupdate

				req.session.success = 'Profile Berhasil Diupdate';
				return res.redirect('/profile');
			
			} else {
			    // data request tidak valid
			    console.log(result.error.details[0])
			    const { details } = result.error;
			    const message = details.map(i => i.message).join(',');
			    console.log('error, ', message);
			    /**
			     * Jika terjadi error saat validasi username dan email user
			     * Maka kita hapus foto profile yang dimuat sebelumnya di cloudinary karena kita menggunakan middleware multer yang otomatis langsung upload gambar di cloudinary ketika user memasukan gambar.
			     */
			    let error = 'Data Tidak Valid';
			    return res.status(422).render( 'profile', { products, error} );
		  	}
		} catch(err) {
			next(err);
		}
	}, 

	/**
	 * Render Halaman Lupa Password
	 * Halaman ini akan meminta user memasukan email untuk verivikasi reset password
	 */
	getForgotPw(req, res, next) {
		return res.render('users/forgot');
		// res.render('users/reset', {token: '2e345'});
	},

	async putForgotPw(req, res, next) {
		const token = await crypto.randomBytes(20).toString('hex'); // membuat string biasa dari string tipe hexadesimal acak 
		const { email } = req.body; // ambil email untuk konfirmasi forgot passoword
		const user = await checkEmailExist(email); // cari user berdasarkan email didatabase
		
		// cek apakah email user terdaftar dalam database
		if(!user) {
			/**
			 * jika user tidak ditemukan
			 * email tidak valid
			 */ 
			req.session.error = 'Email Tidak Terdaftar';
			return res.redirect('/forgot-password');
		}

		// email user terdaftar/valid
		user.nomorTelfon = 82217971133;
		user.bio = 'Saya penjual yang paling keren, kece dan terupdate';

		user.resetPasswordToken = token; // tambahkan token dalam database user
		user.resetPasswordExpires = Date.now() + 3600000; // settting 1 jam dari sekarang batas waktu
		await user.save(); // simpan database user setelah diupdate token reset password dan batas waktu token.

		const msg = {
			to: email,
			subj: 'Waingapu Shop Zone App Ecommerce - Lupa/Ubah Password',
		 	text: `Anda menerima ini karena Anda (atau orang lain)
		  	telah meminta pengaturan ulang kata sandi untuk akun Anda.
		  	Silakan klik tautan berikut, atau salin dan tempel
		  	ke browser Anda untuk menyelesaikan proses:
		  	http://${req.headers.host}/reset/${token}
		  	Jika Anda tidak meminta ini, abaikan email ini dan
			kata sandi Anda akan tetap tidak berubah`.replace(/		/g, ''), // set text email. ubah tab menjadi spasi biasa dengan reqex
			// html: '<strong>and easy to do anywhere, even with Node.js</strong>'
		}

		const resultSendMsg = await mailService.send(msg); // kirimkan ke email user untuk mendapatkan token verifikasi reset password 
		console.log(`Hasil pengiriman email ke email ${email} untuk melakukan reset password saya lupa password`);
		console.log(resultSendMsg);

		req.session.success = `Sebuah email sudah dikirimkan ke ${email} dengan intruksi untuk reset password`;
		return res.redirect('/forgot-password');
	},

	// Check Token Reset Password
	async getReset(req, res, next) {
		const { token } = req.params; // ambil token untuk melakukan reset password

		// /**
		//  * Lakukan pencarian user didatabase berdasarkan token reset password dan batas waktu reset password
		//  * Untuk batas waktu token reset password kita lakukan validasi menggunakan query mongodb $gt
		//  * Dokumentasi $gt
		// 	$gt
		// 	Syntax: {field: {$gt: value} }
		// 	$gt selects those documents where the value of the field is greater than (i.e. >) the specified value.
		// 	For most data types, comparison operators only perform comparisons on fields where the BSON type matches the query value’s type. MongoDB supports limited cross-BSON comparison through Type Bracketing.
		//  */
		// const user = await User.findOne({
		// 	resetPasswordToken: token,
		// 	resetPasswordExpires: { $gt: Date.now() } // $gt (greather then, $(untuk variabel global mongodb))
		// }); // cari user didalam models database user berdasarkan token untuk reset password

		// // cek apakah user berhasil ditemukan atau tidak
		// if(!user) { 
		// 	/**
		// 	 * user tidak ditemukan
		// 	 * jika token reset password dan batas waktu dari token reset password user tidak ditemukan atau kadelwarsa
		// 	 * batalkan reset password
		// 	 */
		// 	req.session.error = 'Token Reset Password tidak valid atau waktu batas token reset password telah habis.';
		// 	return res.redirect('/forgot-password');
		// }

		// /**
		//  * Token reset password valid
		//  * Arahkan user ke halaman selanjut untuk mereset password dengan memberikan data juga berupa token reset password
		//  */
		return res.render('users/reset', { token });
	},	

	/**
	 * Put Reset Password
	 * Untuk mereset password user
	 */
	async putReset(req, res, nex) {
		const { token } = req.params; // ambil token untuk melakukan reset password

		/**
		 * Lakukan pencarian user didatabase berdasarkan token reset password dan batas waktu reset password
		 * Untuk batas waktu token reset password kita lakukan validasi menggunakan query mongodb $gt
		 * Dokumentasi $gt
			$gt
			Syntax: {field: {$gt: value} }
			$gt selects those documents where the value of the field is greater than (i.e. >) the specified value.
			For most data types, comparison operators only perform comparisons on fields where the BSON type matches the query value’s type. MongoDB supports limited cross-BSON comparison through Type Bracketing.
		 */
		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpires: { $gt: Date.now() } // $gt (greather then, $(untuk variabel global mongodb))
		}); // cari user didalam models database user berdasarkan token untuk reset password

		if(!user) { 
			/**
			 * jika token reset password dan batas waktu dari token reset password user tidak ditemukan atau kadelwarsa
			 * batalkan reset password
			 */
			req.session.error = 'Token Reset Password tidak valid atau waktu batas token reset password telah habis.';
			return res.redirect('/forgot-password');
		}		

		/**
		 * jika token reset password valid
		 * cek apakah new password sudah sama dengna password confirm
		 */
		if(req.body.password === req.body.confirm) {
			// jika new password sama dengan password confirm
			await user.setPassword(req.body.password); // update password baru user kedalam database

			user.resetPasswordToken = null; // bersihkan token reset password user didatabase
			user.resetPasswordExpires = null; // bersihkan waktu batas token reset password user didatabase

			await user.save(); // simpan data baru user didalam database user.

			console.log(`User ${user.username} dengan email ${user.email} berhasil mengubah password`.blue);

			const login = util.promisify(req.login.bind(req)); // fungsi untuk login ulang
			await login(user); // login ulang user setelah reset password

			/**
			 * jika sudah berhasi update password user dan sudah berhasil login ulang user.
			 * setting pesan untuk dikirimkan ke email user sebagau tanda bahwa user sudah berhasil reset password.
			 */
			const msg = {
			    to: user.email,
			    from: 'Waingapu Shop Zone Admin <umburambu45@gmail.com>',
			    subject: 'Waingapu Shop Zone - Password Digantikan',
			    text: `Email ini untuk mengonfirmasi bahwa kata sandi untuk akun Anda baru saja diubah.
				Jika Anda tidak melakukan perubahan ini, silakan tekan balas dan beri tahu kami segera.`.replace(/		/g, '') // setting format string
		  	};


			const resultSendMsg = await mailService.send(msg); // kirimkan ke email user untuk mendapatkan token verifikasi reset password 

			console.log(`Hasil pengiriman email ke email ${user.email} untuk melakukan reset password saya lupa password`);
			console.log(resultSendMsg);

			req.session.success = 'Password berhasil diubah';
			// Redirect user kehalaman utama, user telah berhasil reset password
			return res.redirect('/');

		} else {
			req.session.error = 'Passwords tidak sama.';
			return res.redirect(`/reset/${token}`);
		}
	},

	/**
	 * Render Verifikasi email saat melakukan pendaftaran
	 * Halaman ini akan meminta user memasukan token yang dikirimkan ke email untuk verivikasi register akun
	 */
	async getVerifikasiEmailRegister(req, res, next) {
		return res.render('verifikasiEmail.ejs');
	},
	
	async getTokenVerikasiEmailRegisterAndRegisterUserAccount(req, res, next) {
		try {
			const { token } = req.params; // ambil token untuk melakukan reset password
			console.log('teoken')
			let user = await UserRegister.findOne({ resetPasswordToken: String(token)})

			if(user) {
				// token verikasi register akun valid
				// proses pembuatan akun untuk user
				/**
				 * Data register akun user valid
				 * Tambahkan user baru kedalam database
				 * Untuk password user, akan langsung di hashsing.
				 */
				console.log(user);
				const newUser = await User.register(new User({
					username: String(user.username),
					email: String(user.email).toLowerCase(),
					bio: String(user.bio),
					nomorTelfon: Number(user.nomorTelfon),
					facebook: String(user.facebook).toLowerCase() || '',
					instagram: String(user.instagram).toLowerCase() || '',
					image: user.image
				}), user.password);

				// hapus akun user register 
				await user.delete();

				/**
				 * jika sudah berhasi update password user dan sudah berhasil login ulang user.
				 * setting pesan untuk dikirimkan ke email user sebagau tanda bahwa user sudah berhasil reset password.
				 */
				const msg = {
				    to: user.email,
				    from: 'Waingapu Shop Zone Admin <umburambu45@gmail.com>',
				    subject: 'Waingapu Shop Zone - Berhasil Mendaftarkan Akun',
				    text: `Email ini untuk mengonfirmasi bahwa anda baru saja mendaftarkan akun di Waingapu Shop Zone.
					Jika Anda tidak melakukan ini, silakan tekan balas dan beri tahu kami segera.`.replace(/		/g, '') // setting format string
			    };

				const resultSendMsg = await mailService.send(msg); // kirimkan ke email user untuk mendapatkan token verifikasi reset password 

				console.log(`Hasil pengiriman email ke email ${user.email} untuk melakukan reset password saya lupa password`);
				console.log(resultSendMsg);

				// // ketika user baru mendaftar, kita langsung membuat user login secara otomatis
				// req.login(newUser, function(err) {
				// 	if(err) return next(err); // jika terjadi error saat ingin membuat user login otomatis saat berhasil register
					
				// 	// memberikan flash message saat user berhasil register akun dan langsung login otomatis setelah user berhasil register.
				// 	req.session.success = `Selamat Datang Di Waingapu Shop Zone ${newUser.username}`; 
				// 	console.log(`User ${newUser.username} berhasil membuatkan akun baru dengan email ${newUser.email}`.blue);
				// 	return res.redirect('/');
				// });

				const login = util.promisify(req.login.bind(req)); // fungsi untuk login ulang
				await login(user); // login ulang user setelah reset password
				req.session.success = 'Akun berhasil dibuat';
				// Redirect user kehalaman utama, user telah berhasil reset password
				return res.redirect('/');        		
			} else {
				error = 'Token telah kadelwarsa, silakan buatkan akun ulang';
				return res.render('register', { titlePage: 'Register', username: '', email:'', error });
			}
		} catch(err) {
			next(err);
		}
	},

	async getUsersById(req, res, next) {
		try{
			const user = await User.findById(String(req.params.id))

			if(user) {
				console.log(user);
				console.log(`${req.protocol}://${req.headers.host}/users/${req.params.id}?page=`)
				res.locals.paginateUrlProductUser = `${req.protocol}://${req.headers.host}/users/${req.params.id}?page=`;

				let products = await Product.paginate({author: String(req.params.id)}, {
					page: req.query.page || 1, // pagination di mongoose (untuk page tertentu) default page pertama 1
					limit: 8, // dalam 1 session page, ambil 10 data/document
					sort: '-_id' // sort secara descending dengan patokan sorting menggunakan _id
				}); 

				// konveri nilai product.page yang awalnya string menjadi number
				products.page = Number(products.page); 
				console.log(products);
				// uji kondisi terhapat products yang berhasil didapatkan pada database sesuai data request user untuk menampilkan products sesuai permintaan user
				if(!products.docs.length && res.locals.query) {
					// jika jumlah post 0 (tidak ada ) dan request user untuk menampilkan products sesuai permintaan user tidak ditemukan
					res.locals.error = 'Tidak ada hasil dari query tersebut.';
				}

				return res.render('users/userProfile', { products, titlePage: `${user.username} Profile`, mapBoxToken, user } ); 

			} else {
				req.session.error = "User Tidak Ditemukan"
				return res.status(404).redirect('back');
			}
		} catch(err) {
			if(err.message.includes('Cast to ObjectId failed for value')) {
				req.session.error = "User Tidak Ditemukan"
				return res.status(404).redirect('/products');				
			}
		}

	},

	async getChangePassword(req, res, next) {
		return res.render('users/changePassword');
	},

	async putChangePassword(req, res, next) {
		const result = PutChangePasswordSchema.validate(req.body);		

		console.log(req.body.currentPassword);
		console.log(req.body.password);

		if(!result.error) {
			// data valid
			console.log(req.user.username)

			const { user, error } = await User.authenticate()(req.user.username, req.body.currentPassword);


			if(error) {
				if(error.messege = 'Password or username is incorrect') {
				    let error = 'Data Tidak Valid password salah';
				    return res.status(422).render('users/changePassword', { error } );				
				} else return next(error);
			}

			if(!user) {
			    let error = 'Data Tidak Valid password salah';
			    return res.status(422).render('users/changePassword', { error } );				
			}
			console.log(error)
			// jika new password sama dengan password confirm
			await user.setPassword(req.body.password); // update password baru user kedalam database
			await user.save(); // simpan data baru user didalam database user.

			const login = util.promisify(req.login.bind(req)); // fungsi untuk login ulang
			await login(user); // login ulang user setelah reset password			

			req.session.success = 'Password berhasil diubah';
			// Redirect user kehalaman utama, user telah berhasil reset password
			return res.redirect('/');        		
		} else {
			// data tidak valid
			console.log(result.error);
		    let error = 'Password Tidak Valid';
		    return res.status(422).render('users/changePassword', { error} );

		}
	},

	async getDeleteProfile(req, res, next) {
		return res.render('users/deleteAccount');
	},

	async deleteProfile(req, res, next) {
		const result = deleteAccountSchema.validate(req.body);


		if(!result.error) {
			// data valid

			const { user, error } = await User.authenticate()(req.user.username, req.body.password);

			console.log(user)

			if(error) {
				error.message = 'Password Salah';
 				return next(error)
			}

			if(!user) return res.status(422).render('users/deleteAccount', { error: 'Password Salah'} );							 

			// hapus foto profile yang di upload jika ada di cloudinary
			if(user.image.public_id !== undefined && user.image.public_id.length !== 0) await cloudinary.v2.uploader.destroy(user.image.public_id);
	
			const userProducts = await Product.find({author: user._id});
			console.log(userProducts);
	 		// perulangan untuk menghapus seluruh gambar product yang dimuat user di cloudinary 
	 		userProducts.forEach(product => {
		 		product.images.forEach(async (img) => {
		 			if(img.public_id !== undefined && img.public_id.length !== 0) {
		 				console.log(img.public_id);
						// hapus gambar dari cloudinary berdasarkan public id, menggunakan API cloudinary
		 				cloudinary.v2.uploader.destroy(img.public_id);
		 				// await cloudinary.v2.uploader.destroy(img.public_id);
		 			}		 
		 		});
	 		});

	 		// perulangan untuk menghapus seluruh review user terhadap product-product yang ada
	 		const userReview = await Review.deleteMany({author: user._id});
	 		const userProductsDelete = await Product.deleteMany({author: user._id});
			await user.delete(); 

			req.session.success = 'Akun Berhasil Di Hapus';
			return res.redirect('/');
 
		} else {
			// data tidak valid
			console.log(result.error);
		    let error = 'Password Salah';
		    return res.status(422).render('users/deleteAccount', { error} );
		}

	}

}

