const router = require("express").Router();
const {
  register,
  login,
  authenticate,
  getAll,
//   changePassword,
} = require("../controllers/user.controller");
const verifyToken = require("../libs/verifyToken");

router.post("/register", register);
router.post("/login", login);
router.get('/', getAll);
router.get("/whoami", verifyToken, authenticate);
// router.post("/change-password", changePassword);

module.exports = router;
