import Joi from "joi";

// Register validation


export const registerValidation = Joi.object({
  username: Joi.string()
    .min(3)
    .max(15)
    .trim()
    .required()
    .messages({
      "string.min": "Username must be at least 3 characters long.",
      "string.max": "Username cannot exceed 15 characters.",
      "string.empty": "Username is required.",
      "string.trim": "Username cannot have leading or trailing spaces.",
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "Please enter a valid email address.",
      "string.empty": "Email is required.",
    }),

  password: Joi.string()
    .min(6)
    .required()
    .messages({
      "string.min": "Password must be at least 6 characters long.",
      "string.empty": "Password is required.",
    }),
    role: Joi.string().valid('user', 'owner', 'admin').optional()
});


// Login validation


export const loginValidation = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "Please enter a valid email address.",
      "string.empty": "Email is required.",
    }),

  password: Joi.string()
    .required()
    .messages({
      "string.empty": "Password is required.",
    }),
});


