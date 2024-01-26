const router = require("express").Router();
const {
  createPengujian,
  getAll,
  getById,
  getAllPengujianByUser,
  updatePengujian,
  deletePengujian,
  getPengujianByUser,
} = require("../controllers/uji.controller");
const { checkAdmin } = require("../controllers/user.controller");
const verifyToken = require("../libs/verifyToken");

router.post("/", verifyToken, checkAdmin, createPengujian);
router.get("/", verifyToken, getAll);
router.get("/me", verifyToken, getAllPengujianByUser);
router.get("/me/all", verifyToken, getPengujianByUser);
router.get("/:id", verifyToken, getById);
router.put("/:id", verifyToken, checkAdmin, updatePengujian);
router.delete("/:id", verifyToken, checkAdmin, deletePengujian);

module.exports = router;
