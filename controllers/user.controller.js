require("dotenv").config();
const prisma = require("../libs/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { registerValidationSchema, loginUserSchema } = require('../validations/user.validation')

// register
const register = async (req, res, next) => {
  try {
    let { email, password, fullname, sapi, no_wa, rt, rw, id_kelompok, role } =
      req.body;

    const { value, error } = await registerValidationSchema.validateAsync({
        email, password, fullname, sapi, no_wa, rt, rw, id_kelompok, role
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

    let encryptedPassword = await bcrypt.hash(password, 10);

    let users = await prisma.users.create({
      data: {
        email,
        password: encryptedPassword,
        fullname,
        sapi,
        no_wa,
        rt,
        rw,
        id_kelompok,
        role,
      },
    });

    delete users.password;

    return res.status(201).json({
      status: true,
      message: "Created Successfully!",
      err: null,
      data: users,
    });
  } catch (err) {
    res.status(404).json({
        status: true,
        message: "Bad Request",
        err: err.message,
        data: null,
      });
    next(err);
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
        message: 'Bad Request',
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
        message: 'Bad Request',
        err: 'User not found',
        data: null,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Bad Request',
        err: 'Wrong Email or Password',
        data: null,
      });
    }

    const payload = {
      id: user.id,
      nickname: user.nickname,
      email: user.email,
      phone_number: user.phone_number,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    delete user.password;

    return res.status(200).json({
      success: true,
      message: 'Login success',
      err: null,
      data: {
        user: user,
        token: token,
      },
    });
  } catch (err) {
    res.status(404).json({
        status: true,
        message: "Bad Request",
        err: err.message,
        data: null,
      });
    next(err);
  }
};

const authenticate = async (req, res, next) => {
  try {
    const { user } = req;
    
    const userDetail = await prisma.users.findUnique({
        where: {
            id: user.id
        },
        include: {
            kelompok: {
                select: {
                    nama: true,
                }
            }
        }
    })

    delete userDetail.password;

    return res.status(200).json({
      status: true,
      message: "OK",
      err: null,
      data: { ...userDetail },
    });
  } catch (error) {
    next(error);
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
//   changePassword,
};
