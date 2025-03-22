const router = require("express").Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to API",
  });
});


router.use('/user', require('./user.route'));
router.use("/kelompok", require("./kelompok.route"));
router.use("/artikel", require("./artikel.route"));
router.use("/pengujian", require("./uji.route"));
router.use("/warung", require("./warung.route"));
router.use("/deteksi", require("./sakit.route"));
router.use("/klinik", require("./klinik.route"));
router.use("/cocoblog", require("./cocoblog.route"));

module.exports = router;
