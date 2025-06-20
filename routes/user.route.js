const router = require("express").Router();
const {
  register,
  login,
  authenticate,
  getAll,
  dashboard,
  checkPenjual,
  resendOtp,
  verifyEmail,
//   changePassword,
} = require("../controllers/user.controller");
const verifyToken = require("../libs/verifyToken");

router.post("/register", register);
router.post("/login", login);
router.get('/', getAll);
router.get("/whoami", verifyToken, authenticate);
router.get("/dashboard", verifyToken, dashboard);
// router.post("/change-password", changePassword);

router.post("/resend-otp", verifyToken, resendOtp);
router.post("/verify-email", verifyToken, verifyEmail);

module.exports = router;
