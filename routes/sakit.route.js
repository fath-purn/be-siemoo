const router = require("express").Router();
const {
  getAll,
  getById,
  createSakit,
  updateSakit,
  deleteSakit,
  getLastSakit,
} = require("../controllers/sakit.controller");
const { checkAdmin } = require("../controllers/user.controller");
const verifyToken = require("../libs/verifyToken");
const { upload } = require("../libs/multer");

router.post("/", upload.single("image"), verifyToken, createSakit);
router.get("/", verifyToken, getAll);
router.get("/last", verifyToken, getLastSakit);
router.get("/:id", verifyToken, getById);
// router.put("/:id", upload.array("image"), verifyToken, checkAdmin, updateSakit);
router.delete("/:id", verifyToken, checkAdmin, deleteSakit);

module.exports = router;
