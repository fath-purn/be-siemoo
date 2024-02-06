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

    return res.status(201).json({
      status: true,
      message: "Kelompok created successfully",
      err: null,
      data: createdKelompok,
    });
  } catch (err) {
    next(err);
    return res.status(400).json({
      status: false,
      message: "Bad Request!",
      err: err.message,
      data: null,
    });
  }
};

const getAll = async (req, res, next) => {
  try {
    // Extract search query from request parameters
    const { search } = req.query;

    let allKelompok = null;

    // Check if a search query is provided
    if (search) {
      allKelompok = await prisma.kelompok.findMany({
        where: {
          OR: [
            {
              nama: {
                contains: search,
                mode: 'insensitive', // Case-insensitive search
              },
            },
            // Add more fields for searching if needed
          ],
        },
        select: {
          id: true,
          nama: true,
        },
        orderBy: {
          id: 'desc',
        },
      });
    } else {
      // If no search query, retrieve all kelompok items
      allKelompok = await prisma.kelompok.findMany({
        select: {
          id: true,
          nama: true,
        },
        orderBy: {
          id: 'desc',
        },
      });
    }

    return res.status(200).json({
      status: true,
      message: "All Kelompok retrieved successfully",
      err: null,
      data: allKelompok,
    });
  } catch (err) {
    next(err);
    return res.status(400).json({
      status: false,
      message: "Bad Request!",
      err: err.message,
      data: null,
    });
  }
};


const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const kelompokById = await prisma.kelompok.findUnique({
      where: { id: parseInt(id) },
    });

    if(!kelompokById) {
      return res.status(400).json({
        status: false,
        message: "Bad Request!",
        err: "Kelompok tidak ditemukan",
        data: null,
      });
    }

    return res.status(200).json({
      status: true,
      message: "Kelompok retrieved successfully",
      err: null,
      data: kelompokById,
    });
  } catch (err) {
    next(err);
    return res.status(400).json({
      status: false,
      message: "Bad Request!",
      err: err.message,
      data: null,
    });
  }
};

const updateKelompok = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nama } = req.body;

    const { error, value } = kelompokSchema.validate({ nama });

    const checkId = await prisma.kelompok.findUnique({
      where: {id: Number(id)},
    });

    if (!checkId) {
      return res.status(400).json({
        status: false,
        message: "Bad Request!",
        err: "Kelompok tidak ditemukan",
        data: null,
      });
    }

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

    return res.status(200).json({
      status: true,
      message: "Kelompok updated successfully",
      err: null,
      data: updatedKelompok,
    });
  } catch (err) {
    next(err);
    return res.status(400).json({
      status: false,
      message: "Bad Request!",
      err: err.message,
      data: null,
    });
  }
};

const deleteKelompok = async (req, res, next) => {
  try {
    const { id } = req.params;

    const checkId = await prisma.kelompok.findUnique({
      where: {id: Number(id)},
    });

    if (!checkId) {
      return res.status(400).json({
        status: false,
        message: "Bad Request!",
        err: "Kelompok tidak ditemukan",
        data: null,
      });
    }

    const deletedKelompok = await prisma.kelompok.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({
      status: true,
      message: "Kelompok deleted successfully",
      err: null,
      data: null,
    });
  } catch (err) {
    next(err);
    return res.status(400).json({
      status: false,
      message: "Bad Request!",
      err: err.message,
      data: null,
    });
  }
};

module.exports = {
  createKelompok,
  getAll,
  getById,
  updateKelompok,
  deleteKelompok,
};
