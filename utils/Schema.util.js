const Joi = require('@hapi/joi');

const Schema = { 
  ProductSchema: 
    Joi.object({
      title: Joi.string()
        .min(3)
        .required(),
      price: Joi.number()
      	.positive()
        .min(0)
        .required(),
      stok: Joi.number()
        .positive()
        .min(1)
        .required(),
      categori: Joi.string()
        .required()
        .min(3),
      description: Joi.string()
        .required(),
      images: Joi.array().items(Joi.object().keys().min(1)),
      location: Joi.string()
        .required()
    }),
  ReviewSchema: 
    Joi.object({
      body: Joi.string()
        .min(3)
        .required(),
      rating: Joi.string()
        .optional(),
    }),
  PostRegisterSchema: 
    Joi.object({
      username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
      bio: Joi.string()
        .min(20)
        .required(),
      image: Joi.optional(),        
      password: Joi.string()
        .min(7)
        .required(),
      rePassword: Joi.ref("password"),    
      email: Joi.string()
        .email({ minDomainSegments: 2 })
        .lowercase()
        .required(),
      nomorTelfon: Joi.string()
        .min(10)
        .required(),
      facebook: Joi.string()
        .allow('')
        .optional(),
      instagram: Joi.string()
        .allow('')
        .optional(),
    }),
  PostLoginSchema: 
    Joi.object({
      username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
      password: Joi.string()
        .min(7)
        .required(),  
      remember: Joi.string()
        .min(2)
        .optional(),
    }),
  PutUserProfileSchema:
    Joi.object({
      username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
      image: Joi.string()
        .optional(),
      bio: Joi.string()
        .min(20)
        .required(),
      currentPassword: Joi.string()
        .min(7)
        .required(),
      nomorTelfon: Joi.string()
        .min(10)
        .required(),
      facebook: Joi.string()
        .allow('')
        .optional(),
      instagram: Joi.string()
        .allow('')
        .optional(), 
    }),
    PutChangePasswordSchema:
      Joi.object({
      currentPassword: Joi.string()
        .min(7)
      .required(),  
      password: Joi.string()
        .min(7)
      .required(),  
      confirm: Joi.ref("password"),    
    }),
    deleteAccountSchema:
      Joi.object({
      password: Joi.string()
        .min(7)
      .required(),  
    }),

  
};

module.exports = Schema;