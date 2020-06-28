const Joi = require('@hapi/joi');
const Product = require('../models/product.model.js');
// const { deleteProfileImage } = require('./index.middleware.js');

// const postRegisterSchema = Joi.object({
//   username: Joi.string()
//     .alphanum()
//     .min(3)
//     .max(30)
//     .required(),
//   password: Joi.string()
//     .min(5)
//     .required(),
//   rePassword: Joi.ref("password"),    
//   email: Joi.string()
//     .email({ minDomainSegments: 2 })
//     .lowercase()
//     .required(),
//   nomorTelfon: Joi.number()
//     .min(11)
//     .required(),
//   facebook: Joi.string()
//     .allow('')
//     .optional(),
//   instagram: Joi.string()
//     .allow('')
//     .optional(),
// });

// const postLoginSchema = Joi.object({
//   username: Joi.string()
//     .alphanum()
//     .min(3)
//     .max(30)
//     .required(),
//   password: Joi.string()
//     .min(5)
//     .required(),  
// });

// const putUserProfileSchema = Joi.object({
//   username: Joi.string()
//     .alphanum()
//     .min(3)
//     .max(30)
//     .required(),
//   currentPassword: Joi.string()
//     .min(5)
//     .required(),
//   newPassword: Joi.string()
//     .allow('')
//     .min(5)
//     .optional()
//     .required(),
//   passwordConfirmation: Joi.ref("newPassword"),    
//   email: Joi.string()
//     .email({ minDomainSegments: 2 })
//     .lowercase()
//     .required(),
//   nomorTelfon: Joi.number()
//     .min(11)
//     .required(),
//   facebook: Joi.string()
//     .allow('')
//     .optional(),
//   instagram: Joi.string()
//     .allow('')
//     .optional(),
// });

// const productSchema = Joi.object({
//   title: Joi.string()
//     .alphanum()
//     .min(3)
//     .required(),
//   price: Joi.number()
//   	.positive()
//     .min(0)
//     .required(),
//   stok: Joi.number()
//     .positive()
//     .min(1)
//     .required(),
//   categori: Joi.string()
//     .required()
//     .min(3),
//   description: Joi.string()
//     .required(),
//   location: Joi.string()
//     .required()
// });

const reviewSchema = Joi.object({
  body: Joi.string()
    .min(3)
    .required(),
  rating: Joi.number()
    .positive()
    .min(0)
    .max(5)
    .required(),
})

// const validatePostRegister = (req, res, next) => {
//   console.log(req.body);
//   const result = postRegisterSchema.validate(req.body);

//   if(!result.error) {
//     // data request valid
//     next();
//   } else {
//     // data request tidak valid
//     const { details } = result.error;
//     const message = details.map(i => i.message).join(',');
//     console.log('error, ', message);
//     /**
//      * Jika terjadi error saat validasi username dan email user
//      * Maka kita hapus foto profile yang dimuat sebelumnya di cloudinary karena kita menggunakan middleware multer yang otomatis langsung upload gambar di cloudinary ketika user memasukan gambar.
//      */
//     deleteProfileImage(req);
//     let error = 'Data Tidak Valid';
//     res.status(422).render('register', { title: 'Register', username: req.body.username, email: req.body.email, error, nomorTelfon: req.body.nomortelfon, facebook: req.body.facebook, instagram: req.body.instagram });  
//   }
// }

// const validatePostLogin = (req, res, next) => {
//   const result = postLoginSchema.validate(req.body);

//   if(!result.error) {
//     // data request valid
//     next();
//   } else {
//     // data request tidak valid
//     console.log(result.error.details[0])
//     const { details } = result.error;
//     const message = details.map(i => i.message).join(',');
//     console.log('error, ', message);
//     /**
//      * Jika terjadi error saat validasi username dan email user
//      * Maka kita hapus foto profile yang dimuat sebelumnya di cloudinary karena kita menggunakan middleware multer yang otomatis langsung upload gambar di cloudinary ketika user memasukan gambar.
//      */
//     let error = 'Data Tidak Valid';
//     res.status(422).render('login', { title: 'Login', username: req.body.username, password: '', error});  
//   }
// }

// const validatePutUserProfile = async (req, res, next) => {
//   const result = putUserProfileSchema.validate(req.body);
//   const products = await Product.find().where('author').equals(req.user._id).limit(10).exec(); // ambil 10 post/Product terkahir yang user buat/Tambahkan.

//   if(!result.error) {
//     // data request valid
//     next();
//   } else {
//     // data request tidak valid
//     console.log(result.error.details[0])
//     const { details } = result.error;
//     const message = details.map(i => i.message).join(',');
//     console.log('error, ', message);
//     *
//      * Jika terjadi error saat validasi username dan email user
//      * Maka kita hapus foto profile yang dimuat sebelumnya di cloudinary karena kita menggunakan middleware multer yang otomatis langsung upload gambar di cloudinary ketika user memasukan gambar.
     
//     let error = 'Data Tidak Valid';
//     res.status(422).render( 'profile', { products, error} );
//   }

// }

// const validatePostProduct = (req, res, next) => {
//   console.log('validasi');
//   console.log(req.body);
//   const result = productSchema.validate(req.body.product);
//   console.log(result);
//   // eval(require('locus'));  

//   if(!result.error) {
//     // data request valid
//     console.log('berhasil validasi');
//     next();
//   } else {
//     // data request tidak valid
//     console.log(result.error.details[0])
//     const { details } = result.error;
//     const message = details.map(i => i.message).join(',');
//     console.log('error, ', message);
//     /**
//      * Jika terjadi error saat validasi username dan email user
//      * Maka kita hapus foto profile yang dimuat sebelumnya di cloudinary karena kita menggunakan middleware multer yang otomatis langsung upload gambar di cloudinary ketika user memasukan gambar.
//      */
//     let error = 'Data Tidak Valid';
//     res.status(422).render( 'product/new', { error, title: req.body.product.title, price: req.body.product.price, stok:req.body.product.stok, categori:req.body.product.categori, description:req.body.product.description, location:req.body.product.location} );
//   }
// } 

// const validatePutProduct = (req, res, next) => {

//   const result = productSchema.validate(req.body.product);
//   eval(require('locus'));  

//   if(!result.error) {
//     // data request valid
//     next();
//   } else {
//     // data request tidak valid
//     console.log(result.error.details[0])
//     const { details } = result.error;
//     const message = details.map(i => i.message).join(',');
//     console.log('error, ', message);
//     /**
//      * Jika terjadi error saat validasi username dan email user
//      * Maka kita hapus foto profile yang dimuat sebelumnya di cloudinary karena kita menggunakan middleware multer yang otomatis langsung upload gambar di cloudinary ketika user memasukan gambar.
//      */
//     let error = 'Data Tidak Valid';
//     res.status(422).render( 'product/new', { error, title: req.body.product.title, price: req.body.product.price, stok:req.body.product.stok, categori:req.body.product.categori, description:req.body.product.description, location:req.body.product.location} );
//   }

  
// }

const validatePostReview = (req, res, next) => {
  console.log('post review')
  console.log(req.body);
  const result = reviewSchema.validate(req.body.review);
  // eval(require('locus'));  

  if(!result.error) {
    // data request valid
    next();
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
    res.status(422).redirect('back');
  }
  
}

const validatePutReview = (req, res, next) => {
  console.log('put review')
  console.log(req.body);

  const result = reviewSchema.validate(req.body.review);

  if(!result.error) {
    // data request valid
    next();
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
    res.status(422).redirect('back');
  }
  
}

module.exports = {
	// validatePostRegister,
 //  validatePostLogin,
 //  validatePutUserProfile,
 //  validatePostProduct,
 //  validatePutProduct,
  validatePostReview,
  validatePutReview,
}