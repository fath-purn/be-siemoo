const prisma = require("../libs/prisma");
const {
  updatePengujianSchema,
  pengujianSchema,
} = require("../validations/uji.validation");

const parseDate = (date) => {
  const options = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };

  return new Intl.DateTimeFormat("id-ID", options).format(date);
};

function mapHasilToRating(hasil) {
  switch (hasil) {
    case 'SangatBaik':
      return 5;
    case 'Baik':
      return 4;
    case 'Normal':
      return 3;
    case 'Buruk':
      return 2;
    case 'SangatBuruk':
      return 1;
    default:
      return 0; // Default value jika hasil tidak sesuai
  }
}

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

    const { id_user, fat, snf, protein, ph, hasil, message } = value;


    const checkUser =  await prisma.users.findUnique({
      where: {
      id: Number(id_user),
    }})

    if(!checkUser) {
      return res.status(400).json({
        status: false,
        message: "Bad Request!",
        err: "User tidak ditemukan",
        data: null,
      });
    }

    // const calculatePengujianResult = (fat, snf, protein, ph) => {
    //   const nilaiFat = 3; // persen
    //   const nilaiSnf = 7.8; // persen
    //   const nilaiProtein = 2.8; // persen
    //   const nilaiMinPh = 6.3; // int
    //   const nilaiMaxPh = 6.8; // int

    //   let hasil = null;
    //   let message = null;

    //   if (
    //     fat > nilaiFat &&
    //     snf > nilaiSnf &&
    //     protein > nilaiProtein &&
    //     ph >= nilaiMinPh &&
    //     ph <= nilaiMaxPh
    //   ) {
    //     hasil = "SangatBaik";
    //     message =
    //       "Susu sapi perah sangat baik. Pertahankan pakan dan kondisi lingkungan yang baik!";
    //   } else if (
    //     fat > nilaiFat &&
    //     snf > nilaiSnf &&
    //     protein > nilaiProtein &&
    //     ph < nilaiMinPh
    //   ) {
    //     hasil = "Baik";
    //     message =
    //       "Susu sapi perah baik. Namun, perhatikan bahwa pH sedikit rendah. Pertimbangkan peningkatan pH dalam pakan.";
    //   } else if (
    //     fat > nilaiFat &&
    //     snf > nilaiSnf &&
    //     protein > nilaiProtein &&
    //     ph > nilaiMaxPh
    //   ) {
    //     hasil = "Baik";
    //     message =
    //       "Susu sapi perah baik. Namun, perhatikan bahwa pH sedikit tinggi. Pertimbangkan penurunan pH dalam pakan.";
    //   } else if (fat > nilaiFat && snf > nilaiSnf && protein > nilaiProtein) {
    //     hasil = "Baik";
    //     message = "Susu sapi perah baik. Tetap pertahankan pakan yang baik!";
    //   } else if (
    //     fat > nilaiFat &&
    //     snf > nilaiSnf &&
    //     protein < nilaiProtein &&
    //     ph >= nilaiMinPh &&
    //     ph <= nilaiMaxPh
    //   ) {
    //     hasil = "Normal";
    //     message =
    //       "Kualitas protein susu sapi perah normal. Tetap pertahankan pakan yang baik!";
    //   } else if (fat > nilaiFat && snf > nilaiSnf && protein < nilaiProtein) {
    //     hasil = "Buruk";
    //     message =
    //       "Kandungan protein susu sapi perah rendah. Perlu pertimbangan dalam formulasi pakan.";
    //   } else if (
    //     fat > nilaiFat &&
    //     snf < nilaiSnf &&
    //     protein > nilaiProtein &&
    //     ph >= nilaiMinPh &&
    //     ph <= nilaiMaxPh
    //   ) {
    //     hasil = "Normal";
    //     message =
    //       "Kandungan solid non-fat (SNF) susu sapi perah normal. Tetap pertahankan pakan yang baik!";
    //   } else if (fat > nilaiFat && snf < nilaiSnf && protein > nilaiProtein) {
    //     hasil = "Buruk";
    //     message =
    //       "Kandungan solid non-fat (SNF) susu sapi perah rendah. Perlu pertimbangan dalam formulasi pakan.";
    //   } else if (
    //     fat < nilaiFat &&
    //     snf > nilaiSnf &&
    //     protein > nilaiProtein &&
    //     ph >= nilaiMinPh &&
    //     ph <= nilaiMaxPh
    //   ) {
    //     hasil = "Normal";
    //     message =
    //       "Kandungan lemak (fat) susu sapi perah normal. Tetap pertahankan pakan yang baik!";
    //   } else if (fat < nilaiFat && snf > nilaiSnf && protein > nilaiProtein) {
    //     hasil = "Buruk";
    //     message =
    //       "Kandungan lemak (fat) susu sapi perah rendah. Perlu pertimbangan dalam formulasi pakan.";
    //   } else {
    //     hasil = "Normal";
    //     message =
    //       "Kualitas susu sapi perah dalam kondisi normal. Tetap pertahankan pakan yang baik!";
    //   }

    //   return { hasil, message };
    // };

    // // Example usage:
    // const { hasil, message } = calculatePengujianResult(fat, snf, protein, ph);


    const createdPengujian = await prisma.pengujian.create({
      data: {
        id_user,
        fat,
        snf,
        protein,
        ph,
        hasil: hasil,
        message: message,
        rating: mapHasilToRating(hasil),
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
    const { user } = req;
    const pengujian = await prisma.users.findUnique({
      where: {
        id: Number(user.id),
      },
      include: {
        pengujian: {
          orderBy: {
            created: "desc",
          },
        },
      },
    });

    if (!pengujian) {
      return res.status(400).json({
        status: false,
        message: "Bad Request!",
        err: "Pengujian tidak ditemukan",
        data: null,
      });
    }

    const iniPengujian = pengujian.pengujian;
    const pengujianResult = {
      pengujian:
        iniPengujian && iniPengujian.length > 0
          ? iniPengujian.map((item) => ({
              id: item.id,
              id_user: item.id_user,
              fat: item.fat,
              snf: item.snf,
              protein: item.protein,
              ph: item.ph,
              rating: item.rating,
              hasil: item.hasil,
              message: item.message,
              created: parseDate(new Date(item.created)),
              updated: parseDate(new Date(item.updated)),
            }))
          : [],
    };

    return res.status(200).json({
      status: true,
      message: "Pengujian retrieved successfully",
      err: null,
      data: pengujianResult.pengujian,
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

const getPengujianByUser = async (req, res, next) => {
  try {
    const { user } = req;
    const pengujian = await prisma.users.findUnique({
      where: {
        id: Number(user.id),
      },
      include: {
        pengujian: {
          orderBy: {
            created: "desc",
          },
          take: 1,
        },
      },
    });

    if (!pengujian) {
      return res.status(400).json({
        status: false,
        message: "Bad Request!",
        err: "Pengujian tidak ditemukan",
        data: null,
      });
    }

    const iniPengujian = pengujian.pengujian;
    const pengujianResult = {
      pengujian:
        iniPengujian && iniPengujian.length > 0
          ? iniPengujian.map((item) => ({
              id: item.id,
              id_user: item.id_user,
              fat: item.fat,
              snf: item.snf,
              protein: item.protein,
              ph: item.ph,
              rating: item.rating,
              hasil: item.hasil,
              message: item.message,
              created: parseDate(new Date(item.created)),
              updated: parseDate(new Date(item.updated)),
            }))
          : [],
    };

    return res.status(200).json({
      status: true,
      message: "Pengujian retrieved successfully",
      err: null,
      data: pengujianResult.pengujian[0],
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
  getPengujianByUser,
};
