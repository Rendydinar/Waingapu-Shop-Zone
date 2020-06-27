const express = require('express');
const router = express.Router({ mergeParams: true });
const { asyncErrorHandler, isReviewAuthor, isLoggedIn, }= require('../middleware/index.middleware.js');

const {
	reviewCreate,
	reviewUpdate,
	reviewDestroy
} = require('../controllers/reviews.controller.js');

const { 
  validatePostReview,
  validatePutReview,
} = require('../middleware/JoiValidation.middleware.js');


/**
 * @route       POST  /posts/:id/reviews 
 * @params      :id  id post
 * @deskripsi   Handle Penambahan Review Terhadap 1 Buah Post 
 * @access      Public    
 * @Protection  none
 * @middleware  asyncErrorHandler
 * @ereturn     return res.redirect(`/posts/${post.id}`) (jika gagal menambahkan review) | res.redirect(`/posts/${post.id}`) (jika berhasil menambahkan review)
 */
router.post('/', isLoggedIn, asyncErrorHandler(validatePostReview), asyncErrorHandler(reviewCreate));

/**
 * @route       PUT  /posts/:id/reviews/:review_id 
 * @params      :id - id post, :review_id - id review
 * @deskripsi   Handle Pengubahan/Edit Review Yang Sudah Ada Di 1 Buah Post 
 * @access      Public    
 * @Protection  none
 * @middleware  isReviewAuthor, asyncErrorHandler
 * @ereturn     res.redirect(`/posts/${req.params.id}`);
 */
router.put('/:review_id', asyncErrorHandler(isLoggedIn), asyncErrorHandler(isReviewAuthor), asyncErrorHandler(validatePutReview), asyncErrorHandler(reviewUpdate));

/**
 * @route       DELETE  /posts/:id/reviews/:review_id 
 * @params      :id - id post, :review_id - id review
 * @deskripsi   Handle Penghapusan/delete 1 buah Review Yang Sudah Ada Di 1 Buah Post 
 * @access      Public    
 * @Protection  none
 * @middleware  isReviewAuthor, asyncErrorHandler
 * @ereturn     res.redirect(`/posts/${req.params.id}`);
 */
router.delete('/:review_id', asyncErrorHandler(isLoggedIn), asyncErrorHandler(isReviewAuthor), asyncErrorHandler(reviewDestroy));

module.exports = router;

/*
GET index 		/reviews
GET new 		/reviews/new
POST create 	/reviews
GET show 		/reviews/:id
GET edit 		/reviews/:id/edit
PUT update		/reviews/:id
DELETE destroy	/reviews/:id
*/ 