const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudinary/index.cloudinary.js');
const upload = multer({ storage });
const { 
	asyncErrorHandler, 
	isLoggedIn, 
	isAuthor, 
	searchAndFilterProducts 
} = require('../middleware/index.middleware.js');

const { 
  productIndex, 
  productNew,
  productCreate,
  productShow,
  productEdit,
  productUpdate,
  productDestroy
} = require('../controllers/product.controller.js');

const { 
  validatePostProduct,
  validatePutProduct,
} = require('../middleware/JoiValidation.middleware.js');


// eval(require('locus'));

/**
 * @route       GET  /products 
 * @params      none
 * @deskripsi   Render Daftar product page view
 * @access      Public    
 * @Protection  none
 * @middleware  searchAndFilterProducts, asyncErrorHandler
 * @ereturn     res.render('products/index', { products, title: 'products Index', mapBoxToken } ); 
 */
router.get('/', asyncErrorHandler(searchAndFilterProducts), asyncErrorHandler(productIndex));

/**
 * @route       GET  /products/new 
 * @params      none
 * @deskripsi   Render Form Untuk Menambahkan product
 * @access      Private    
 * @Protection  none
 * @middleware  isLoggendIn, multer, asyncErrorHandler
 * @ereturn     res.render('products/new');
 */
router.get('/new', asyncErrorHandler(isLoggedIn), asyncErrorHandler(productNew));

/**
 * @route       product  /products
 * @params      none
 * @deskripsi   Handle Penambahan product Oleh User
 * @access      Private    
 * @Protection  none
 * @middleware  isLoggendIn, multer, asyncErrorHandler
 * @ereturn     res.redirect(`/products/${product.id}`) (jika product berhasil ditambahkan) | res.redirect('back'); (jika gagal menambahkan product)
 */
router.post('/', asyncErrorHandler(isLoggedIn), asyncErrorHandler(upload.array('images', 3)), asyncErrorHandler(productCreate));

/**
 * @route       GET  /products/:id
 * @params      :id
 * @deskripsi   Render 1 buah product berdasarkan id
 * @access      Public    
 * @Protection  none
 * @middleware  asyncErrorHandler
 * @ereturn     res.render('products/show', { product, floorRating, mapBoxToken })
 */
router.get('/:id', asyncErrorHandler(productShow));

/**
 * @route       GET  /products/:id/edit
 * @params      :id
 * @deskripsi   Render Form Untuk Mengedit product
 * @access      Private    
 * @Protection  none
 * @middleware  isLoggedIn, isAuthor, asyncErrorHandler
 * @ereturn     res.render('products/show', { product, floorRating, mapBoxToken })
 */
router.get('/:id/edit', asyncErrorHandler(isLoggedIn), asyncErrorHandler(isAuthor), asyncErrorHandler(productEdit));

/**
 * @route       PUT  /products/:id
 * @params      :id
 * @deskripsi   Handle Edit/Update product
 * @access      Private    
 * @Protection  none
 * @middleware  isLoggedIn, isAuthor, asyncErrorHandler
 * @ereturn     res.redirect(`/products/${product.id}`)
 */
router.put('/:id', asyncErrorHandler(isLoggedIn), asyncErrorHandler(isAuthor), upload.array('images', 4), asyncErrorHandler(productUpdate));

/**
 * @route       DELETE  /products/:id
 * @params      :id
 * @deskripsi   Handle Penghapusan/Delete product Berdasarkan id
 * @access      Private    
 * @Protection  none
 * @middleware  isLoggedIn, isAuthor, asyncErrorHandler
 * @ereturn     res.redirect('/products');
 */
router.delete('/:id', asyncErrorHandler(isLoggedIn), asyncErrorHandler(isAuthor), asyncErrorHandler(productDestroy));

module.exports = router;

/*
GET index 		/products
GET new 		/products/new
product create 	/products
GET show 		/products/:id
GET edit 		/products/:id/edit
PUT update		/products/:id
DELETE destroy	/products/:id
*/