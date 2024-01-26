const Joi = require("joi");

const artikelSchema = Joi.object({
  judul: Joi.string().required(),
  deskripsi: Joi.string().required(),
  menu: Joi.string().valid("olah_pangan", "sulap_limbah", "edukasi").required(),
  link: Joi.string(),
});

const artikelUpdatedSchema = Joi.object({
  judul: Joi.string(),
  deskripsi: Joi.string(),
  menu: Joi.string().valid("olah_pangan", "sulap_limbah", "edukasi"),
  link: Joi.string(),
});

module.exports = {
  artikelSchema,
  artikelUpdatedSchema,
};
