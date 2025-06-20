require("dotenv").config();
const prisma = require("../libs/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  registerValidationSchema,
  loginUserSchema,
} = require("../validations/user.validation");
const { generateAndSendOtp } = require("../helpers/otpService");
// const { logActivity } = require('../libs/activityService');

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
    // 1. Validasi Input (Kode Anda sudah bagus)
    const { value, error } = registerValidationSchema.validate(req.body);
    if (error) {
      // Log percobaan registrasi yang gagal karena validasi
      return res.status(400).json({ status: false, message: error.message });
    }

    const {
      email,
      password,
      fullname,
      sapi,
      no_wa,
      rt,
      rw,
      id_kelompok,
      role,
    } = value;

    // 2. Cek User & Kelompok (Kode Anda sudah bagus)
    const userExist = await prisma.users.findUnique({ where: { email } });
    if (userExist) {
      return res.status(404).json({
        success: false,
        message: "Bad Request",
        err: "Email sudah terdaftar.",
        data: null,
      });
    }

    const checkKelompok = await prisma.kelompok.findUnique({
      where: { id: id_kelompok },
    });
    if (!checkKelompok) {
      return res.status(404).json({
        success: false,
        message: "Bad Request",
        err: "Kelompok tidak ditemukan.",
        data: null,
      });
    }

    // 3. Buat User Baru
    const encryptedPassword = await bcrypt.hash(password, 10);
    const indonesianPhoneNumber = toIndonesianPhoneNumber(no_wa);

    const newUser = await prisma.users.create({
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
        verified: false, // Pastikan user belum terverifikasi
      },
    });

    // 4. Panggil Service untuk Generate dan Kirim OTP
    await generateAndSendOtp(newUser);

    delete newUser.password;

    // 5. Catat Aktivitas Registrasi Sukses
    // await prisma.aktivitas({
    //   id_user: newUser.id,
    //   aktivitas: "USER_REGISTER",
    //   status: "SUCCESS",
    // });

    return res.status(201).json({
      status: true,
      message: "OK!",
      err: null,
      data: newUser,
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

    // Catat aktivitas login
    await prisma.aktivitas.create({
      data: {
        id_user: user.id,
        aktivitas: "USER_LOGIN",
        status: "SUCCESS",
      },
    });

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
          },
        },
        role: true,
        created: true,
        updated: true,
      },
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

const resendOtp = async (req, res, next) => {
  try {
    const { id } = req.user;
    if (!id) {
      return res
        .status(400)
        .json({ status: false, message: "Id diperlukan." });
    }

    console.log('Resending OTP for user ID:', id);

    const user = await prisma.users.findUnique({ where: { id } });

    if (!user) {
      // Kita kirim pesan umum untuk keamanan, agar orang tidak bisa menebak email mana yang terdaftar.
      return res.status(200).json({
        status: true,
        message: "Jika email terdaftar, email verifikasi baru telah dikirim.",
      });
    }

    if (user.verified) {
      return res
        .status(400)
        .json({ status: false, message: "Akun ini sudah terverifikasi." });
    }

    // Cukup panggil fungsi yang sama!
    await generateAndSendOtp(user);

    // Log aktivitasnya
    // await prisma.aktivitas({
    //   id_user: user.id,
    //   aktivitas: "VERIFIKASI_EMAIL",
    //   status: "FAILURE",
    // });
    
    return res
      .status(200)
      .json({ status: true, message: "Email verifikasi baru telah dikirim." });
  } catch (err) {
    next(err);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { verificationCode } = req.body;
        const { id } = req.user;

    // 1. Validasi Input Dasar
    if (!id || !verificationCode) {
      return res.status(400).json({
        status: false,
        message: "Id dan kode verifikasi diperlukan.",
      });
    }

    // 2. Cari User di database berdasarkan email yang diberikan
    const user = await prisma.users.findUnique({
      where: { id: id },
    });

    // 3. Lakukan serangkaian pengecekan keamanan dan validitas
    if (!user || user.verificationCode !== verificationCode) {
      // Jika user tidak ada ATAU kode salah, kirim pesan error yang sama.
      // Ini untuk mencegah orang menebak email yang terdaftar.
      return res.status(400).json({
        status: false,
        message: "Kode verifikasi salah atau tidak valid.",
      });
    }

    if (user.verified) {
      return res.status(400).json({
        status: false,
        message: "Akun ini sudah terverifikasi sebelumnya.",
      });
    }

    // Cek apakah kode sudah kedaluwarsa (menggunakan Unix Timestamp)
    if (Date.now() > user.verificationCodeExpiresAt) {
      // Log percobaan yang gagal karena kedaluwarsa
      // await prisma.aktivitas({
      //   id_user: user.id,
      //   aktivitas: "VERIFIKASI_EMAIL",
      //   status: "FAILURE",
      // });
      return res.status(400).json({
        status: false,
        message: "Kode verifikasi sudah kedaluwarsa. Silakan minta kode baru.",
      });
    }

    // 4. Jika semua pengecekan lolos, verifikasi berhasil!
    // Update data user di database.
    await prisma.users.update({
      where: { id: id },
      data: {
        verified: true,
        verificationCode: null, // Penting: Hapus kode setelah digunakan
        verificationCodeExpiresAt: null, // Penting: Hapus juga waktu kedaluwarsanya
      },
    });

    // 5. Catat aktivitas sukses ke dalam log
    // await prisma.aktivitas({
    //   id_user: user.id,
    //   aktivitas: "VERIFIKASI_EMAIL",
    //   status: "SUCCESS",
    // });

    // 6. Kirim respons sukses ke frontend
    return res.status(200).json({
      status: true,
      message: "Verifikasi email berhasil!",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  authenticate,
  checkAdmin,
  getAll,
  dashboard,
  checkPenjual,
  toIndonesianPhoneNumber,
  resendOtp,
  verifyEmail,
  //   changePassword,
};
