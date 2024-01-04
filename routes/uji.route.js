const router = require("express").Router();
const {
  createPengujian,
  getAll,
  getById,
  getAllPengujianByUser,
  updatePengujian,
  deletePengujian,
} = require("../controllers/uji.controller");
const { checkAdmin } = require("../controllers/user.controller");
const verifyToken = require("../libs/verifyToken");

router.post("/", verifyToken, checkAdmin, createPengujian);
router.get("/", getAll);
router.get("/:id", getById);
router.get("/user/:id", getAllPengujianByUser);
router.put("/:id", verifyToken, checkAdmin, updatePengujian);
router.delete("/:id", verifyToken, checkAdmin, deletePengujian);

module.exports = router;
