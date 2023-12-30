const router = require("express").Router();
const {
    createWarung,
    getAll,
    getById,
    updateWarung,
    deleteWarung,
} = require("../controllers/warung.controller");
const { checkAdmin } = require("../controllers/user.controller");
const verifyToken = require("../libs/verifyToken");
const { upload } = require("../libs/multer");

router.post("/", upload.array("image"), verifyToken, createWarung);
router.get("/", getAll);
router.get("/:id", getById);
router.put("/:id", upload.array("image"), verifyToken, updateWarung);
router.delete("/:id", verifyToken, checkAdmin, deleteWarung);

module.exports = router;
