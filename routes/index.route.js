const express = require('express');
const router = express.Router(); 
const multer = require('multer');
const { storage } = require('../cloudinary/index.cloudinary.js');
const upload = multer({ 
	storage,
	limits: { 
		fileSize: 1010000 // 1.01mb
	} 
});
const { 
	landingPage, 
	getRegister,
	postRegister, 
	getLogin,
	postLogin, 
	getLogout, 
	getProfile,
	updateProfile,
	getForgotPw,
	putForgotPw,
	getReset,
	putReset,
	getVerifikasiEmailRegister,
	getTokenVerikasiEmailRegisterAndRegisterUserAccount,
	getUsersById,
	getProfileUpdate,	
	getChangePassword,
	putChangePassword,
	getDeleteProfile,
	deleteProfile,
} = require('../controllers/index.controller.js');
const { 
	asyncErrorHandler, 
	isLoggedIn,
	isValidPassword,
	changePassword
} = require('../middleware/index.middleware.js');

// const { 
// 	validatePostRegister,
// 	validatePostLogin,
// 	validatePutUserProfile,
// } = require('../middleware/JoiValidation.middleware.js');

/**
 * @route      	GET  / 
 * @params 		none
 * @deskripsi  	Render landind page view
 * @access     	Public 		
 * @Protection 	none
 * @middleware	asyncErrorHandler
 * @ereturn 	res.render('index', { posts, mapBoxToken, recentPosts, title: 'Surf Shop - Home' });
 */
router.get('/', asyncErrorHandler(landingPage));

/**
 * @route      	GET 		/register 
 * @params 		none
 * @deskripsi  	Render register page view
 * @access     	Public 		
 * @Protection 	none
 * @middleware	multer, asyncErrorHandler
 * @ereturn 	res.render('register', { title: 'Register', username: '', email: '' } );
 */
router.get('/register', getRegister);

/**
 * @route      	POST  /register 
 * @params 		none
 * @deskripsi  	Handle post register
 * @access     	Public 		
 * @Protection 	none
 * @middleware	multer, asyncErrorHandler
 * @ereturn 	res.redirect('/') (user berhasil register) |  res.redirect('back') (user gagal post register)
 */
router.post('/register', asyncErrorHandler(upload.single('image')), asyncErrorHandler(postRegister));

/**
 * @route      	GET  /login 
 * @params 		none
 * @deskripsi  	Render login page view
 * @access     	Public, Forward Authenticated 		
 * @Protection 	none
 * @middleware	none
 * @ereturn 	res.redirect('/') (user sudah login sebelumnya) | res.render('login', { title: 'Login' } ); (user belum login sebelumnya)
 */
router.get('/login', getLogin);

/**
 * @route      	POST  /login 
 * @params 		none
 * @deskripsi  	Handle post login 
 * @access     	Public 		
 * @Protection 	none
 * @middleware	asyncErrorHandler
 * @ereturn 	res.redirect(redirectUrl (user berhasil login) | res.redirect('back') (user gagal post login)
 */
router.post('/login', asyncErrorHandler(postLogin));

/**
 * @route      	GET  /logout 
 * @params 		none
 * @deskripsi  	Handle user logout 
 * @access     	Public 		
 * @Protection 	none
 * @middleware	none
 * @ereturn 	res.redirect('/')
 */
router.get('/logout', getLogout);

/**
 * @route      	GET  /profile 
 * @params 		none
 * @deskripsi  	Render user profile view 
 * @access     	Private 		
 * @Protection 	none
 * @middleware	isLogged, asyncErrorHandler
 * @ereturn 	res.render( 'profile', { posts} )
 */		
router.get('/profile', asyncErrorHandler(isLoggedIn), asyncErrorHandler(getProfile));

/**
 * @route      	GET  /profile/edit	
 * @params 		none
 * @deskripsi  	Render user profile view 
 * @access     	Private 		
 * @Protection 	none
 * @middleware	isLogged, asyncErrorHandler
 * @ereturn 	res.render( 'profile', { posts} )
 */		
router.get('/profile/edit', asyncErrorHandler(isLoggedIn), asyncErrorHandler(getProfileUpdate));

/**
 * @route      	PUT  /profile 
 * @params 		none
 * @deskripsi  	Handle Update User Profile 
 * @access     	Private 		
 * @Protection 	none
 * @middleware	isLogged, isValidPassword, changePassword, asyncErrorHandler
 * @ereturn 	res.render( 'profile', { posts} ) | res.redirect('back') (user gagal mengubah data profile)
 */
router.put('/profile', 
	asyncErrorHandler(isLoggedIn), 
  	asyncErrorHandler(upload.single('image')), 
	asyncErrorHandler(isValidPassword),  
	// asyncErrorHandler(changePassword),  
	asyncErrorHandler(updateProfile)  
);

/**
 * @route      	DELETE  /profile 
 * @params 		none
 * @deskripsi  	Handle DELETe User Account 
 * @access     	Private 		
 * @Protection 	none
 * @middleware	isLogged, isValidPassword,, asyncErrorHandler
 * @ereturn 	res.render( 'profile', { posts} ) | res.redirect('back') (user gagal mengubah data profile)
 */
router.delete('/profile', 
	asyncErrorHandler(isLoggedIn), 
	// asyncErrorHandler(isValidPassword),  
	// asyncErrorHandler(changePassword),  
	asyncErrorHandler(deleteProfile)  
);

/**
 * @route      	DELETE  /profile 
 * @params 		none
 * @deskripsi  	Handle DELETe User Account 
 * @access     	Private 		
 * @Protection 	none
 * @middleware	isLogged, isValidPassword,, asyncErrorHandler
 * @ereturn 	res.render( 'profile', { posts} ) | res.redirect('back') (user gagal mengubah data profile)
 */
router.get('/profile/delete', 
	asyncErrorHandler(isLoggedIn), 
	// asyncErrorHandler(isValidPassword),  
	// asyncErrorHandler(changePassword),  
	asyncErrorHandler(getDeleteProfile)  
);


/**
 * @route      	GET  /forgot-password 
 * @params 		none
 * @deskripsi  	Render Forgot password view
 * @access     	Public 		
 * @Protection 	none
 * @middleware	none
 * @ereturn 	res.render('users/forgot');
 */
router.get('/forgot-password', getForgotPw );

/**
 * @route      	PUT  /forgot-password 
 * @params 		none
 * @deskripsi  	Handle Make Token reset password untuk user
 * @access     	Public 		
 * @Protection 	none
 * @middleware	asyncErrorHandler
 * @ereturn 	res.redirect('/forgot-password') (gagal memproses reset) token password) | res.redirect('/forgot-password') (berhasil memproses reset) token password)
 */
router.put('/forgot-password', asyncErrorHandler(putForgotPw));

/**
 * @route      	GET  /reset/:token 
 * @params 		:token (token reset password)
 * @deskripsi  	Check reset token password apakah valid atau invalid
 * @access     	Public 		
 * @Protection 	none
 * @middleware	asyncErrorHandler
 * @ereturn 	res.redirect('/forgot-password') (gagal memproses untuk mereset password karena token tidak valid) | res.render('users/reset', { token }) (token user valid, proses reset token selanjutnya)
 */
router.get('/reset/:token', asyncErrorHandler(getReset));

/**
 * @route      	PUT  /reset/:token 
 * @params 		:token (token reset password)
 * @deskripsi  	Handle user reset password
 * @access     	Public 		
 * @Protection 	none
 * @middleware	asyncErrorHandler
 * @ereturn 	res.redirect('/forgot-password') (gagal memproses untuk mereset password karena token tidak valid) | res.redirect('/') (berhasil mereset password user didalam database)
 */
router.put('/reset/:token', asyncErrorHandler(putReset));

router.get('/verifikasi-email', getVerifikasiEmailRegister)

router.get('/register/:token', asyncErrorHandler(getTokenVerikasiEmailRegisterAndRegisterUserAccount))

router.get('/users/:id', asyncErrorHandler(getUsersById))

router.get('/change-password', asyncErrorHandler(isLoggedIn), asyncErrorHandler(getChangePassword));

router.put('/change-password', asyncErrorHandler(isLoggedIn), asyncErrorHandler(putChangePassword));

module.exports = router;
 