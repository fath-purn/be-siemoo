const Joi = require('joi');

const pengujianSchema = Joi.object({
  id_user: Joi.number().required(),
  fat: Joi.number().required(),
  snf: Joi.number().required(),
  protein: Joi.number().required(),
  ph: Joi.number().required(),
});

const updatePengujianSchema = Joi.object({
    id_user: Joi.number(),
    fat: Joi.number().required(),
    snf: Joi.number().required(),
    protein: Joi.number().required(),
    ph: Joi.number().required(),
  });

module.exports = {
    updatePengujianSchema, pengujianSchema,
}