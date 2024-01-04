const prisma = require("../libs/prisma");
const {
  updatePengujianSchema,
  pengujianSchema,
} = require("../validations/uji.validation");

const createPengujian = async (req, res, next) => {
  try {
    const { error, value } = pengujianSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        err: error.message,
        data: null,
      });
    }

    const { id_user, fat, snf, protein, ph } = value;

    const calculatePengujianResult = (fat, snf, protein, ph) => {
      const nilaiFat = 3; // persen
      const nilaiSnf = 7.8; // persen
      const nilaiProtein = 2.8; // persen
      const nilaiMinPh = 6.3; // int
      const nilaiMaxPh = 6.8; // int

      let hasil = null;
      let message = null;

      if (
        fat > nilaiFat &&
        snf > nilaiSnf &&
        protein > nilaiProtein &&
        ph >= nilaiMinPh &&
        ph <= nilaiMaxPh
      ) {
        hasil = "SangatBaik";
        message =
          "Susu sapi perah sangat baik. Pertahankan pakan dan kondisi lingkungan yang baik!";
      } else if (
        fat > nilaiFat &&
        snf > nilaiSnf &&
        protein > nilaiProtein &&
        ph < nilaiMinPh
      ) {
        hasil = "Baik";
        message =
          "Susu sapi perah baik. Namun, perhatikan bahwa pH sedikit rendah. Pertimbangkan peningkatan pH dalam pakan.";
      } else if (
        fat > nilaiFat &&
        snf > nilaiSnf &&
        protein > nilaiProtein &&
        ph > nilaiMaxPh
      ) {
        hasil = "Baik";
        message =
          "Susu sapi perah baik. Namun, perhatikan bahwa pH sedikit tinggi. Pertimbangkan penurunan pH dalam pakan.";
      } else if (fat > nilaiFat && snf > nilaiSnf && protein > nilaiProtein) {
        hasil = "Baik";
        message = "Susu sapi perah baik. Tetap pertahankan pakan yang baik!";
      } else if (
        fat > nilaiFat &&
        snf > nilaiSnf &&
        protein < nilaiProtein &&
        ph >= nilaiMinPh &&
        ph <= nilaiMaxPh
      ) {
        hasil = "Normal";
        message =
          "Kualitas protein susu sapi perah normal. Tetap pertahankan pakan yang baik!";
      } else if (fat > nilaiFat && snf > nilaiSnf && protein < nilaiProtein) {
        hasil = "Buruk";
        message =
          "Kandungan protein susu sapi perah rendah. Perlu pertimbangan dalam formulasi pakan.";
      } else if (
        fat > nilaiFat &&
        snf < nilaiSnf &&
        protein > nilaiProtein &&
        ph >= nilaiMinPh &&
        ph <= nilaiMaxPh
      ) {
        hasil = "Normal";
        message =
          "Kandungan solid non-fat (SNF) susu sapi perah normal. Tetap pertahankan pakan yang baik!";
      } else if (fat > nilaiFat && snf < nilaiSnf && protein > nilaiProtein) {
        hasil = "Buruk";
        message =
          "Kandungan solid non-fat (SNF) susu sapi perah rendah. Perlu pertimbangan dalam formulasi pakan.";
      } else if (
        fat < nilaiFat &&
        snf > nilaiSnf &&
        protein > nilaiProtein &&
        ph >= nilaiMinPh &&
        ph <= nilaiMaxPh
      ) {
        hasil = "Normal";
        message =
          "Kandungan lemak (fat) susu sapi perah normal. Tetap pertahankan pakan yang baik!";
      } else if (fat < nilaiFat && snf > nilaiSnf && protein > nilaiProtein) {
        hasil = "Buruk";
        message =
          "Kandungan lemak (fat) susu sapi perah rendah. Perlu pertimbangan dalam formulasi pakan.";
      } else {
        hasil = "Normal";
        message =
          "Kualitas susu sapi perah dalam kondisi normal. Tetap pertahankan pakan yang baik!";
      }
    
      return { hasil, message };
    };

    // Example usage:
    const { hasil, message } = calculatePengujianResult(
      fat,
      snf,
      protein,
      ph
    );
    // console.log(`Hasil Pengujian: ${hasil}`);
    // console.log(`Pesan untuk peternak: ${message}`);

    // return res.status(201).json({
    //   status: true,
    //   message: "Pengujian created successfully",
    //   err: null,
    //   data: { hasil, message },
    // });

    const createdPengujian = await prisma.pengujian.create({
      data: {
        id_user,
        fat,
        snf,
        protein,
        ph,
        hasil: hasil,
        message: message,
      },
    });

    return res.status(201).json({
      status: true,
      message: "Pengujian created successfully",
      err: null,
      data: createdPengujian,
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
    const allPengujian = await prisma.pengujian.findMany({
      select: {
        id: true,
        fat: true,
        snf: true,
        protein: true,
        ph: true,
        hasil: true,
        message: true,
        user: {
          select: {
            id: true,
            fullname: true,
            no_wa: true,
          },
        },
        created: true,
        updated: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    return res.status(200).json({
      status: true,
      message: "All Pengujian retrieved successfully",
      err: null,
      data: allPengujian,
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
    const pengujianById = await prisma.pengujian.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        fat: true,
        snf: true,
        protein: true,
        ph: true,
        hasil: true,
        message: true,
        user: {
          select: {
            id: true,
            fullname: true,
            no_wa: true,
          },
        },
        created: true,
        updated: true,
      },
    });

    if (!pengujianById) {
      return res.status(400).json({
        status: false,
        message: "Bad Request!",
        err: "Pengujian tidak ditemukan",
        data: null,
      });
    }

    return res.status(200).json({
      status: true,
      message: "Pengujian retrieved successfully",
      err: null,
      data: pengujianById,
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

const getAllPengujianByUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pengujianById = await prisma.users.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        pengujian: {
          orderBy: {
            created: "desc",
          },
        },
      },
    });

    if (!pengujianById) {
      return res.status(400).json({
        status: false,
        message: "Bad Request!",
        err: "Pengujian tidak ditemukan",
        data: null,
      });
    }

    delete pengujianById.password;

    return res.status(200).json({
      status: true,
      message: "Pengujian retrieved successfully",
      err: null,
      data: pengujianById,
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

const updatePengujian = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error, value } = updatePengujianSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        err: error.message,
        data: null,
      });
    }

    const { id_user, fat, snf, protein, ph } = value;
    let hasilPengujian = "Baik";
    let messagePengujian = "Perlu makan tambahan";

    const checkId = await prisma.pengujian.findUnique({
      where: { id: Number(id) },
    });

    if (!checkId) {
      return res.status(400).json({
        status: false,
        message: "Bad Request!",
        err: "Hasil pengujian tidak ditemukan",
        data: null,
      });
    }

    const updatedPengujian = await prisma.pengujian.update({
      where: { id: Number(id) },
      data: {
        id_user,
        fat,
        snf,
        protein,
        ph,
        hasil: hasilPengujian,
        message: messagePengujian,
      },
    });

    return res.status(200).json({
      status: true,
      message: "Pengujian updated successfully",
      err: null,
      data: updatedPengujian,
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

const deletePengujian = async (req, res, next) => {
  try {
    const { id } = req.params;

    const checkId = await prisma.pengujian.findUnique({
      where: { id: Number(id) },
    });

    if (!checkId) {
      return res.status(400).json({
        status: false,
        message: "Bad Request!",
        err: "Hasil pengujian tidak ditemukan",
        data: null,
      });
    }

    await prisma.pengujian.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({
      status: true,
      message: "Pengujian deleted successfully",
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
  createPengujian,
  getAll,
  getById,
  getAllPengujianByUser,
  updatePengujian,
  deletePengujian,
};
