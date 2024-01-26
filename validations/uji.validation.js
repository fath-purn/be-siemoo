const Joi = require('joi');

const pengujianSchema = Joi.object({
  id_user: Joi.number().required(),
  fat: Joi.number().required(),
  snf: Joi.number().required(),
  protein: Joi.number().required(),
  ph: Joi.number().required(),
  hasil: Joi.string().valid("SangatBaik", "Baik", "Normal", "Buruk", "SangatBuruk").required(),
  message: Joi.string().required(),
});

const updatePengujianSchema = Joi.object({
    id_user: Joi.number(),
    fat: Joi.number(),
    snf: Joi.number(),
    protein: Joi.number(),
    ph: Joi.number(),
    hasil: Joi.string().valid("SangatBaik", "Baik", "Normal", "Buruk", "SangatBuruk"),
    message: Joi.string(),
  });

module.exports = {
    updatePengujianSchema, pengujianSchema,
}