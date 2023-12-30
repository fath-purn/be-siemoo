const Joi = require("joi");

const warungSchema = Joi.object({
  nama: Joi.string().required(),
  harga: Joi.string().required(),
  deskripsi: Joi.string().required(),
  kuantiti: Joi.string().required(),
  stok: Joi.string().required(),
  link: Joi.string(),
});

const warungUpdatedSchema = Joi.object({
    nama: Joi.string().required(),
    harga: Joi.string().required(),
    deskripsi: Joi.string().required(),
    kuantiti: Joi.string().required(),
    stok: Joi.string().required(),
    link: Joi.string(),
});

module.exports = {
    warungSchema,
    warungUpdatedSchema,
};
