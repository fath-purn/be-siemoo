const prisma = require("../libs/prisma");
const Joi = require('joi');

const kelompokSchema = Joi.object({
  nama: Joi.string().required(),
});

const createKelompok = async (req, res, next) => {
  try {
    const { error, value } = kelompokSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        err: error.message,
        data: null,
      });
    }

    const { nama } = value;

    const createdKelompok = await prisma.kelompok.create({
      data: {
        nama,
      },
    });

    res.status(201).json({
      status: true,
      message: "Kelompok created successfully",
      err: null,
      data: createdKelompok,
    });
  } catch (err) {
    res.status(400).json({
      status: false,
      message: "Bad Request!",
      err: err.message,
      data: null,
    });
    next(err);
  }
};

const getAll = async (req, res, next) => {
  try {
    const allKelompok = await prisma.kelompok.findMany({
        select: {
            id: true,
            nama: true,
        },
        orderBy: {
            id: 'desc',
        }
    });

    res.status(200).json({
      status: true,
      message: "All Kelompok retrieved successfully",
      err: null,
      data: allKelompok,
    });
  } catch (err) {
    res.status(400).json({
      status: false,
      message: "Bad Request!",
      err: err.message,
      data: null,
    });
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const kelompokById = await prisma.kelompok.findUnique({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      status: true,
      message: "Kelompok retrieved successfully",
      err: null,
      data: kelompokById,
    });
  } catch (err) {
    res.status(400).json({
      status: false,
      message: "Bad Request!",
      err: err.message,
      data: null,
    });
    next(err);
  }
};

const updateKelompok = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nama } = req.body;

    const { error, value } = kelompokSchema.validate({ nama });

    if (error) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        err: error.message,
        data: null,
      });
    }

    const updatedKelompok = await prisma.kelompok.update({
      where: { id: parseInt(id) },
      data: { nama: value.nama },
    });

    res.status(200).json({
      status: true,
      message: "Kelompok updated successfully",
      err: null,
      data: updatedKelompok,
    });
  } catch (err) {
    res.status(400).json({
      status: false,
      message: "Bad Request!",
      err: err.message,
      data: null,
    });
    next(err);
  }
};

const deleteKelompok = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedKelompok = await prisma.kelompok.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      status: true,
      message: "Kelompok deleted successfully",
      err: null,
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: false,
      message: "Bad Request!",
      err: err.message,
      data: null,
    });
    next(err);
  }
};

module.exports = {
  createKelompok,
  getAll,
  getById,
  updateKelompok,
  deleteKelompok,
};
