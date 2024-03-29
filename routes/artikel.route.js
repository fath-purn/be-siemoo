const router = require("express").Router();
const {
    createArtikel,
    getAllPangan,
    getAllLimbah,
    getAll,
    getById,
    updateArtikel,
    deleteArtikel,
    getAllEdukasi,
} = require("../controllers/artikel.controller");
const { checkAdmin } = require("../controllers/user.controller");
const verifyToken = require("../libs/verifyToken");
const { upload } = require("../libs/multer");

router.post("/", upload.array("image"), verifyToken, checkAdmin, createArtikel);
router.get("/pangan", getAllPangan);
router.get("/limbah", getAllLimbah);
router.get("/edukasi", getAllEdukasi);
router.get("/", getAll);
router.get("/:id", getById);
router.put("/:id", upload.array("image"), verifyToken, checkAdmin, updateArtikel);
router.delete("/:id", verifyToken, checkAdmin, deleteArtikel);

module.exports = router;
