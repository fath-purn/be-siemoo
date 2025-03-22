const Joi = require("joi");

// Skema validasi untuk pengguna
const registerValidationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  fullname: Joi.string().required(),
  sapi: Joi.number().optional(),
  no_wa: Joi.string().optional(),
  rt: Joi.string().optional(),
  rw: Joi.string().optional(),
  id_kelompok: Joi.number().required(),
  role: Joi.string().valid("peternak", "admin", "pembeli").default("pembeli"),
});

const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const cocoblogSchema = Joi.object({
  judul: Joi.string().required(),
  isi: Joi.string().required(),
  linkGambar: Joi.string(),
})

module.exports = {
  registerValidationSchema,
  loginUserSchema,
  cocoblogSchema,
};
