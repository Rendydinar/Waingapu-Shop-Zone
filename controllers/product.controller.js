const Product = require('../models/product.model.js');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = 'pk.eyJ1IjoicmVuZHlkaW5hciIsImEiOiJjazVhamN5Y2wwd2Z4M25wb3dxd3JieWYyIn0.SDMfrK-4DUwEyRyZ3_dLmQ'; //process.env.MAPBOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require('../cloudinary/index.cloudinary.js');
const { ProductSchema } = require('../utils/Schema.util.js')

module.exports = {
	productNew(req, res, next) {
		return res.render('product/new', {titlePage: 'Product New', title: '', price: '', stok:'', categori:'', description:'', location:''})
	},


	// GET Posts Index
	async productIndex(req, res, next) {
		const { dbQuery } = res.locals; // ambil data request user untuk menampilkan posts sesuai permintaan user
		delete res.locals.dbQuery; // hapus data request user untuk menampilkan posts sesuai permintaan user 

		// cari document/database posts berdasarkan dbQuery (data request user untuk menampilkan posts sesuai permintaan user) dengan metode pagination 
		let products = await Product.paginate(dbQuery, {
			populate: 'author',	
			page: req.query.page || 1, // pagination di mongoose (untuk page tertentu) default page pertama 1
			limit: 16, // dalam 1 session page, ambil 10 data/document
			sort: '-_id' // sort secara descending dengan patokan sorting menggunakan _id
		}); 

		// konveri nilai product.page yang awalnya string menjadi number
		products.page = Number(products.page); 
		// uji kondisi terhapat products yang berhasil didapatkan pada database sesuai data request user untuk menampilkan products sesuai permintaan user
		if(!products.docs.length && res.locals.query) {
			// jika jumlah post 0 (tidak ada ) dan request user untuk menampilkan products sesuai permintaan user tidak ditemukan
			res.locals.error = 'Tidak ada barang dari hasil pencarian';
		}

		// check apakah dilakuakan pencarian barang
		if(Object.keys(res.locals.query).length !== 0 && res.locals.query.constructor === Object && products.docs.length !== 0) res.locals.success = `Ditemukan ${products.docs.length} barang dari hasil pencarian`;
		
		return res.render('product/index', { products, titlePage: 'Product Index', mapBoxToken } ); 
	},

	// Product Create
	async productCreate(req, res, next) {
		// membersikan file di properti array req.body.product.images
		req.body.product.images = [];

		for(const file of req.files) {
			/**
			 * sekarang gambar sudah diupload, maka isi dari req.files berupa hasil gambar yang sudah diupload kedalam cloudunary
			 * ini karena kita sudah membuat fitur(middleware) cloudinary storage upload, dimana akan otomasi mengupload file/gambar jika gambar ditambahkan/ubah.
			 * tambahkan data gambar yang dimuat di cloudinary kedalam properti array req.body.product.images
			 */
			req.body.product.images.push({
				url: String(file.secure_url), // url gambar
				public_id: String(file.public_id) // public id gambar
			});	
		}

		const result = ProductSchema.validate(req.body.product);

		if(!result.error) {
	    	// data request valid
			// looping untuk mengambil file yang di product
 			// request data lokasi product ke mapbox
			let response = await geocodingClient
			  .forwardGeocode({
			  	query: req.body.product.location, // query lokasi yang dikirimkan
			  	limit: 1 // batas permintaan
			  })
			  .send()
	 		
	 		// menyimpan coodinat lokasi ke object request.product
	 		req.body.product.geometry = response.body.features[0].geometry;
	 		// ambil id user saat ini
	 		req.body.product.author = req.user._id;

			let product = new Product({
				title: String(req.body.product.title),
				price: Number(req.body.product.price),
				description: String(req.body.product.description),
				stok: Number(req.body.product.stok),
				categori: String(req.body.product.categori).toLowerCase(),
				location: String(req.body.product.location),
				images: req.body.product.images,
				geometry: req.body.product.geometry,
				author: req.body.product.author
			});

			/**
			 * manambahkan data properties.description dibagian akhir setelah inisialisasi data product
			 * ini untuk mendapatkan id product, digunakan untuk popup untuk lokasi map product.
			 */
			product.properties.description = `<strong><a href="/products/${product._id}">${product.title}</a></strong><p>${product.location}</p><p>${product.description.substring(0, 20)}...</p>`;
			await product.save(); // simpan product baru kedalam model database product

			// set success message untuk flash messages
			req.session.success = 'Product berhasil dibuat !';	

			// redirect dengan memberikan parameter berupa id product yang baru dibuatkan.
			return res.redirect(`/products/${product.id}`);
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
		    return res.status(422).render( 'product/new', { error, title: req.body.product.title, price: req.body.product.price, stok:req.body.product.stok, categori:req.body.product.categori, description:req.body.product.description, location:req.body.product.location} );
		}
		
	},

	// Show Post
	async productShow(req, res, next) {
		/**
		 * cari product didalam database berdasarkan id
		 * Untuk review mengenai product kita urutkan secara descending
		 * Data review didapatkan dari hasil query populate
		 */
		
		/**
		 * Dokumentasi Populate
		 * MongoDB has the join-like $lookup aggregation operator in versions >= 3.2. Mongoose has a more powerful alternative called populate(), which lets you reference documents in other collections.
		 * Population is the process of automatically replacing the specified paths in the document with document(s) from other collection(s). 
		 */
		
		let product = await Product.findById(req.params.id).populate({
			path: 'reviews', // untuk data review
			populate: {
				path:'author',
				model:'User'
			},
			options: { sort: { '_id': -1 } }, // kita urutkan secara descending
		}).populate('author');

		/**
		 * menghitung rata-rata rating dari product ini
		 * perhitungan langsung di jalankan di models product
		 * hasil pemanggilan method berupa nilai rata-rata rating unutk product/produk ini.
		 */
		const floorRating = product.calculateAvgRating();
		console.log(product)
		// const floorRating = product.avgRating; // ini sigunakan saat mode develop biar dapat bisa hardcode nilai rating rata2

		// render ke route product/show dengan memberikan data berupa product yang berhasil dicari untuk dilihat user. 
		return res.render('product/show', { product, floorRating, mapBoxToken, titlePage: product.title });
	},

	// Post Edit
	async productEdit(req, res, next) {
		// render halaman edit product agar user bisa mengiedit product. 
		return res.render('product/edit');
	}, 

	// product Update 
	async productUpdate(req, res, next) {
		/** handle any deletion of existing images
		 *  handle upload of any new images	
 		 */
		const { product } = res.locals;

		// cek jika ada suatu gambar yang di hapus
		if(req.body.deleteImages && req.body.deleteImages.length) {
			// ada gambar yang dihapus/ubah
			
			let deleteImages = req.body.deleteImages; // ambil data gambar2 yang dihapus
			console.log(deleteImages); 
			// lakukan perulangan setiap gambar yang dihapus (yang dibaca sebenarnya public_id)
			for(const public_id of deleteImages) {
				// hapus gambar dari cloudinary
 				await cloudinary.v2.uploader.destroy(public_id);
 				/**
 				 * Lakukan perulangan untuk membaca gambar-gambar product sebelum diupdate
 				 * Hapus gambar-gambar yang dihapus/update pada dalam database berdasarkan public_id gambar tersebut
 				 * Karena data gambar di muat dalam format array maka kita menghapus menggunakan fungsi Array.slice(n, 1)
 				 */
 				for(const image of product.images) {
 					if(image.public_id === public_id) {
 						let index = product.images.indexOf(image); // ambil posisi index gambar di docoment images pada models database product
 						product.images.splice(index, 1); // kemudian kita hapus data image tersebut berdasarkan posisi indexnya didalam database
 					}
 				}
			}
		}

		//cek jika ada suatu gambar yang di upload
		if(req.files) {
			// baca gambar yang diupload 
			for(const file of req.files) {
				/**
				 * sekarang gambar sudah diupload, maka isi dari req.files berupa hasil gambar yang sudah diupload kedalam cloudunary
				 * ini karena kita sudah membuat fitur(middleware) cloudinary storage upload, dimana akan otomasi mengupload file/gambar jika gambar ditambahkan/ubah.
				 * tambahkan data gambar berupa url dan public_id didalam document images pada database models product
				 */
				product.images.push({
					url: file.secure_url,
					public_id: file.public_id
				});	
			}
		}	

		const result = ProductSchema.validate(req.body.product);

		if(!result.error) {
	    	// data request valid
			/**
			 * cek apakah lokasi diubah atau tidak
			 * jika diubah kirimkan lokasi baru ke mapbox
			 * update data lokasi baru kedalam database
			 */
			if(req.body.product.location !== product.location) {
				// request data lokasi ke mapbox
				let response = await geocodingClient
				  .forwardGeocode({
				  	query: req.body.product.location, // query lokasi yang dikirimkan
				  	limit: 1 // batas permintaan
				  })
				  .send();

		 		// menyimpan coodinat lokasi yang baru diubah ke dalam database 
		 		product.geometry = response.body.features[0].geometry;
		 		// ubah lokasi yang baru diubah ke dalam database
				product.location = req.body.product.location;	
			}

			// update product berdasarkan data request yang dikirim.
			product.title = String(req.body.product.title);	
			product.description = String(req.body.product.description);	
			product.stok = Number(req.body.product.stok);
			product.categori= String(req.body.product.categori).toLowerCase();
			product.price = Number(req.body.product.price);	
			product.properties.description = `<strong><a href="/products/${product._id}">${product.title}</a></strong><p>${product.location}</p><p>${product.description.substring(0, 20)}...</p>`;

			// save updetan product kedalam database models product
			await product.save(); 
			
			req.session.success = 'Barang berhasil di update'
			// redirect ke route show page dengan parametar id product yang baru saja diupdate
			return res.redirect(`/products/${product.id}`);
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
		    return res.status(422).render( 'product/edit', { error, product: {title: req.body.product.title, price: req.body.product.price, stok:req.body.product.stok, categori:req.body.product.categori, description:req.body.product.description, location:req.body.product.location, images: product.images} });
		}

	},

	// Post Destroy
	async productDestroy(req, res, next) {
		// ambil product dari res.locals yang sudah disetting pada middleware isAuthor
		const { product } = res.locals;
 		
 		// perulangan untuk menghapus seluruh gambar product di cloudinary 
 		product.images.forEach(async (img) => {
			// hapus gambar dari cloudinary berdasarkan public id, menggunakan API cloudinary
			await cloudinary.v2.uploader.destroy(img.public_id);
 		});

 		await product.deleteOne(); // hapus product didalam database
 		req.session.success = "Product berhasil dihapus";
 		// redirect ke route /productss 
		return res.redirect('/profile');
	}
}; 

