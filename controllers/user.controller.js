require("dotenv").config();
const prisma = require("../libs/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  registerValidationSchema,
  loginUserSchema,
} = require("../validations/user.validation");

function toIndonesianPhoneNumber(phoneNumber) {
  let digitsOnly = phoneNumber.replace(/\D/g, "");

  if (digitsOnly.startsWith("0")) {
    return "+62" + digitsOnly.substring(1);
  }

  if (!digitsOnly.startsWith("62")) {
    return "+62" + digitsOnly;
  }

  return digitsOnly;
}

const parseDate = (date) => {
  const options = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };

  return new Intl.DateTimeFormat("id-ID", options).format(date);
};

// register
const register = async (req, res, next) => {
  try {
    let { email, password, fullname, sapi, no_wa, rt, rw, id_kelompok, role } =
      req.body;

    const { value, error } = await registerValidationSchema.validateAsync({
      email,
      password,
      fullname,
      sapi,
      no_wa,
      rt,
      rw,
      id_kelompok,
      role,
    });

    if (error) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        err: error.message,
        data: null,
      });
    }

    let userExist = await prisma.users.findUnique({
      where: { email: email },
    });
    if (userExist) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        err: "Email already exists!",
        data: null,
      });
    }

    const checkKelompok = await prisma.kelompok.findUnique({
      where: {
        id: id_kelompok,
      },
    });

    if (!checkKelompok) {
      res.status(404).json({
        status: true,
        message: "Bad Request",
        err: "Kelompok tani tidak ditemukan",
        data: null,
      });
    }

    let encryptedPassword = await bcrypt.hash(password, 10);
    let indonesianPhoneNumber = toIndonesianPhoneNumber(no_wa);

    let users = await prisma.users.create({
      data: {
        email,
        password: encryptedPassword,
        fullname,
        sapi,
        no_wa: indonesianPhoneNumber,
        rt,
        rw,
        id_kelompok,
        role,
      },
    });

    delete users.password;

    return res.status(201).json({
      status: true,
      message: "OK!",
      err: null,
      data: users,
    });
  } catch (err) {
    next(err);
    return res.status(404).json({
      status: true,
      message: "Bad Request",
      err: err.message,
      data: null,
    });
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { value, error } = await loginUserSchema.validateAsync({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Bad Request",
        err: error.message,
        data: null,
      });
    }

    const user = await prisma.users.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Bad Request",
        err: "User not found",
        data: null,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Bad Request",
        err: "Wrong Email or Password",
        data: null,
      });
    }

    const payload = {
      id: user.id,
      nickname: user.nickname,
      email: user.email,
      phone_number: user.phone_number,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    delete user.password;

    return res.status(200).json({
      success: true,
      message: "OK!",
      err: null,
      data: {
        user: user,
        token: token,
      },
    });
  } catch (err) {
    next(err);
    return res.status(404).json({
      status: true,
      message: "Bad Request",
      err: err.message,
      data: null,
    });
  }
};

const authenticate = async (req, res, next) => {
  try {
    const { user } = req;

    const userDetail = await prisma.users.findUnique({
      where: {
        id: user.id,
      },
      include: {
        kelompok: {
          select: {
            nama: true,
          },
        },
        pengujian: {
          select: {
            id: true,
            hasil: true,
          },
          orderBy: {
            created: "desc",
          },
          take: 1,
        },
      },
    });

    delete userDetail.password;

    const flattenedUserDetail = {
      id: userDetail.id,
      email: userDetail.email,
      fullname: userDetail.fullname,
      sapi: userDetail.sapi,
      no_wa: userDetail.no_wa,
      rt: userDetail.rt,
      rw: userDetail.rw,
      id_kelompok: userDetail.id_kelompok,
      role: userDetail.role,
      kelompok: userDetail.kelompok.nama,
      pengujian: {
        id:
          userDetail.pengujian && userDetail.pengujian.length > 0
            ? userDetail.pengujian[0].id
            : null,
        hasil:
          userDetail.pengujian && userDetail.pengujian.length > 0
            ? userDetail.pengujian[0].hasil
            : null,
      },
      created: parseDate(userDetail.created),
      updated: parseDate(userDetail.updated),
    };

    return res.status(200).json({
      status: true,
      message: "OK!",
      err: null,
      data: { ...flattenedUserDetail },
    });
  } catch (err) {
    next(err);
    return res.status(404).json({
      status: true,
      message: "Bad Request",
      err: err.message,
      data: null,
    });
  }
};

const checkAdmin = async (req, res, next) => {
  try {
    const { user } = req;

    const userDetail = await prisma.users.findUnique({
      where: {
        id: user.id,
        role: "admin", // Filter berdasarkan role 'admin'
      },
      include: {
        kelompok: {
          select: {
            nama: true,
          },
        },
      },
    });

    if (!userDetail) {
      return res.status(404).json({
        status: true,
        message: "Admin only",
        err: "Only admins can use this command",
        data: null,
      });
    }

    next();
  } catch (err) {
    next(err);
    return res.status(404).json({
      status: true,
      message: "Bad Request",
      err: err.message,
      data: null,
    });
  }
};

const checkPenjual = async (req, res, next) => {
  try {
    const { user } = req;

    const userDetail = await prisma.users.findUnique({
      where: {
        id: user.id,
        role: "peternak", // Filter berdasarkan role 'admin'
      },
      include: {
        kelompok: {
          select: {
            nama: true,
          },
        },
      },
    });

    if (!userDetail) {
      return res.status(404).json({
        status: true,
        message: "Admin only",
        err: "Only admins can use this command",
        data: null,
      });
    }

    next();
  } catch (err) {
    next(err);
    return res.status(404).json({
      status: true,
      message: "Bad Request",
      err: err.message,
      data: null,
    });
  }
};

const getAll = async (req, res, next) => {
  try {
    const getAll = await prisma.users.findMany({
      where: {
        NOT: {
          role: "admin",
        },
      },
      select: {
        id: true,
        email: true,
        fullname: true,
        sapi: true,
        no_wa: true,
        rt: true,
        rw: true,
        kelompok: {
          select: {
            id: true,
            nama: true,
          }
        },
        role: true,
        created: true,
        updated: true,
      }
    });

    return res.status(200).json({
      success: true,
      message: "OK!",
      err: null,
      data: getAll,
    });
  } catch (err) {
    next(err);
    return res.status(404).json({
      status: false,
      message: "Bad Request",
      err: err.message,
      data: null,
    });
  }
};

const dashboard = async (req, res, next) => {
  try {
    const { user } = req;

    const allArtikel = await prisma.artikel.findMany({
      select: {
        id: true,
        judul: true,
        deskripsi: true,
        menu: true,
        media: {
          select: {
            id: true,
            link: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
      take: 5,
    });

    const userDetail = await prisma.users.findUnique({
      where: {
        id: user.id,
      },
      include: {
        kelompok: {
          select: {
            nama: true,
          },
        },
        pengujian: {
          orderBy: {
            created: "desc",
          },
          take: 1,
        },
      },
    });

    delete userDetail.password;

    const { pengujian } = userDetail;
    const pengujianResult = {
      pengujian:
        pengujian && pengujian.length > 0
          ? {
              id: pengujian[0].id,
              id_user: pengujian[0].id_user,
              fat: pengujian[0].fat,
              snf: pengujian[0].snf,
              protein: pengujian[0].protein,
              ph: pengujian[0].ph,
              rating: pengujian[0].rating,
              hasil: pengujian[0].hasil,
              message: pengujian[0].message,
              created: parseDate(pengujian[0].created),
              updated: parseDate(pengujian[0].updated),
            }
          : {
              id: null,
              id_user: null,
              fat: null,
              snf: null,
              protein: null,
              ph: null,
              hasil: null,
              message: null,
              created: null,
              updated: null,
            },
    };

    return res.status(200).json({
      success: true,
      message: "OK!",
      err: null,
      data: { artikel: allArtikel, pengujian: pengujianResult.pengujian },
    });
  } catch (err) {
    next(err);
    return res.status(404).json({
      status: false,
      message: "Bad Request",
      err: err.message,
      data: null,
    });
  }
};

// const changePassword = async (req, res, next) => {
//   try {
//   } catch (err) {
//     next(err);
//   }
// };

module.exports = {
  register,
  login,
  authenticate,
  checkAdmin,
  getAll,
  dashboard,
  checkPenjual,
  toIndonesianPhoneNumber,
  //   changePassword,
};
