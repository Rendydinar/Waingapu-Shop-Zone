const Product = require('../models/product.model.js');
const Review = require('../models/review.model.js');
const { ReviewSchema } = require('../utils/Schema.util.js')

module.exports = {

	// Reviews Create
	async reviewCreate(req, res, next) {
		/**
		 * Cari post berdasarkan id
		 * Lakukan populate dengan models review
		 */
		let product = await Product.findById(req.params.id).populate('reviews').exec(); 
		const result = ReviewSchema.validate(req.body.review);

		if(!result.error) {
			// data valid
			// cara apakah user sudah membuat review untuk produk/prodcut ini atau belum
			let haveReviewed = product.reviews.filter(review => {
				// baca semua review dan kembalikan review yanag hanya dituliskan oler user saat ini
				return review.author.equals(req.user._id); 
			}).length;

			// cek apakah ditemukan review product yang ditulis user saat ini
			if(haveReviewed) {
				/**
				 * Jika ditemukan review yang ditulis user saat ini
				 * Maka batalkan proses pembuatan review user, kerena setiap produk user hanya diijinkan untuk menulis 1 buah review saja
				 */
				
				req.session.success = "Maaf anda hanya bisa membuat 1 review untuk produk ini"; // memberikan flash message kalau review hanya dapat dilakukan 1 kali
				return res.redirect(`/products/${product.id}`);
			}

			// user baru pertama kali membuat review untuk product/produk ini

			// tambahkan id user untuk didatabase models review pada document author
	 		req.body.review.author = req.user._id;
			// buat database review produk
			let review = await Review.create({
				author: req.body.review.author,
				body: String(req.body.review.body),
				rating: Number(req.body.review.rating)
			});

			// tambahkan database review kedalam database produk
			product.reviews.push(review);
			// simpan database product/produk yang sudah ditambahkan dengan review produk
			await product.save();
			// redirect to the product
			req.session.success = 'Review produk berhasil ditambahkan'; // berikan flash message menandakan user berhasil menambahkan review pada produk.
			return res.redirect(`/products/${product.id}`);
		} else {
			// data invalid
			console.log(result.error.details[0])
		    const { details } = result.error;
		    const message = details.map(i => i.message).join(',');
		    console.log('error, ', message);
		    /**
		     * Jika terjadi error saat validasi username dan email user
		     * Maka kita hapus foto profile yang dimuat sebelumnya di cloudinary karena kita menggunakan middleware multer yang otomatis langsung upload gambar di cloudinary ketika user memasukan gambar.
		     */
			res.locals.error = "Data Tidak Valid"; // memberikan flash message kalau review hanya dapat dilakukan 1 kali
			return res.redirect(`/products/${product.id}`);
		}

	},

	// Reviews Update 
	async reviewUpdate(req, res, next) {
		// cari data Review dan Update Data Review sesuai perubahaan oleh User yang membuat review 
		console.log(req.body.review);
		await Review.findByIdAndUpdate(req.params.review_id, {
			body: String(req.body.review.body),
			rating: Number(req.body.review.rating)
		});

		// set pesan kalau review berhasil diupdate
		req.session.success = "Review berhasil diubah";

		// redirect untuk melihat produk yang setelah diupdate postnya.
		return res.redirect(`/products/${req.params.id}`);
	},

	// Reviews Destroy
	async reviewDestroy(req, res, next) {
		// pertama hapus id review yang ada di modls database post
		await Product.findByIdAndUpdate(req.params.id, {
			$pull: { reviews: req.params.review_id }
		});	

		// hapus review yang ada di models database review
		await Review.findByIdAndRemove(req.params.review_id);

		// set pesan kalau review berhasil dihapus
		req.session.success = "Review berhasil dihapus";
		
		// redirect untuk melihat produk yang setelah dihapus reviewnya.
		return res.redirect(`/products/${req.params.id}`);
	}
}; 

