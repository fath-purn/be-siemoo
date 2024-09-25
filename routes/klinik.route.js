const router = require("express").Router();
const {
  getAll,
  getById,
  createSakit,
  updateSakit,
  deleteSakit,
  getLastSakit,
  createKota,
  getKotaAll,
  deleteKota,
} = require("../controllers/klinik.controller");
const { checkAdmin } = require("../controllers/user.controller");
const verifyToken = require("../libs/verifyToken");
const { upload } = require("../libs/multer");


router.get('/kota', getKotaAll);
router.post('/kota', verifyToken, createKota);
router.delete('/kota/:id', verifyToken, deleteKota);

router.post("/", upload.single("image"), verifyToken, checkAdmin, createSakit);
router.get("/", getAll);
router.get("/last", getLastSakit);
router.get("/:id", getById);
// router.put("/:id", upload.array("image"), verifyToken, checkAdmin, updateSakit);
router.delete("/:id", verifyToken, checkAdmin, deleteSakit);



module.exports = router;
