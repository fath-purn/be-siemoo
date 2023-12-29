const router = require("express").Router();
const {
createKelompok,
getAll,
getById,
updateKelompok,
deleteKelompok,
} = require("../controllers/kelompok.controller");
const {
    checkAdmin,
  } = require("../controllers/user.controller");
const verifyToken = require("../libs/verifyToken");

router.post("/", verifyToken, checkAdmin, createKelompok);
router.get("/", getAll);
router.get("/:id", getById);
router.put("/:id", verifyToken, checkAdmin, updateKelompok);
router.delete("/:id", verifyToken, checkAdmin, deleteKelompok);

module.exports = router;
