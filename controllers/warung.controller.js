const prisma = require("../libs/prisma");
const {
  warungSchema,
  warungUpdatedSchema,
} = require("../validations/warung.validation");
const imagekit = require("../libs/imagekit");
const path = require("path");

const createWarung = async (req, res, next) => {
  try {
    const { user } = req;
    const { value, error } = warungSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        err: error.message,
        data: null,
      });
    }

    const { nama, harga, deskripsi, kuantiti, stok, link } = value;

    const pengujian = await prisma.pengujian.findFirst({
      where: {
        id_user: Number(user.id),
      },
      select: {
        id: true,
      },
      orderBy: {
        created: "desc",
      },
    });

    const createWarung = await prisma.warung.create({
      data: {
        id_user: Number(user.id),
        id_pengujian: Number(pengujian.id),
        nama: nama,
        harga: Number(harga),
        deskripsi: deskripsi,
        kuantiti: kuantiti,
        stok: Number(stok),
      },
    });

    // fungsi uploadFiles untuk imagekit
    const uploadFiles = async (files, id_warung) => {
      try {
        const gambarPromises = files.map(async (file) => {
          let strFile = file.buffer.toString("base64");

          let { url, fileId } = await imagekit.upload({
            fileName: Date.now() + path.extname(file.originalname),
            file: strFile,
          });

          const gambar = await prisma.media.create({
            data: {
              id_link: fileId,
              link: url,
              id_warung: id_warung,
            },
          });

          return gambar;
        });

        return Promise.all(gambarPromises);
      } catch (err) {
        return res.status(404).json({
          status: false,
          message: "Bad Request!",
          err: err.message,
          data: null,
        });
      }
    };

    let gambar = null;

    // panggil fungsi uploadFiles untuk imagekit
    if (req.files && req.files.length > 0) {
      await uploadFiles(req.files, createWarung.id);
    }

    if (link) {
      await prisma.media.create({
        data: {
          id_link: "-",
          link: link,
          id_warung: createWarung.id,
        },
      });
    }

    return res.status(201).json({
      status: true,
      message: "Dagangan berhasil dibuat",
      err: null,
      data: createWarung,
    });
  } catch (err) {
    next(err);
    return res.status(400).json({
      status: false,
      message: "Bad Request",
      err: err.message,
      data: null,
    });
  }
};

const getAll = async (req, res, next) => {
  try {
    const warung = await prisma.warung.findMany({
      select: {
        id: true,
        nama: true,
        harga: true,
        deskripsi: true,
        kuantiti: true,
        stok: true,
        user: {
          select: {
            id: true,
            fullname: true,
            no_wa: true,
          },
        },
        pengujian: {
          select: {
            id: true,
            hasil: true,
          },
        },
        Media: {
          select: {
            id: true,
            link: true,
          },
        },
        created: true,
        updated: true,
      },
      orderBy: {
        created: "desc",
      },
    });

    return res.status(200).json({
      status: false,
      message: "OK!",
      err: null,
      data: warung,
    });
  } catch (err) {
    next(err);
    return res.status(400).json({
      status: false,
      message: "Bad Request",
      err: err.message,
      data: null,
    });
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const warungById = await prisma.warung.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        nama: true,
        harga: true,
        deskripsi: true,
        kuantiti: true,
        stok: true,
        user: {
          select: {
            id: true,
            fullname: true,
            no_wa: true,
          },
        },
        pengujian: {
          select: {
            id: true,
            hasil: true,
          },
        },
        Media: {
          select: {
            id: true,
            link: true,
          },
        },
        created: true,
        updated: true,
      },
    });

    if (!warungById) {
      return res.status(400).json({
        status: false,
        message: "Bad Request!",
        err: "Warung tidak ditemukan",
        data: null,
      });
    }

    return res.status(200).json({
      status: true,
      message: "Warung retrieved successfully",
      err: null,
      data: warungById,
    });
  } catch (err) {
    next(err);
    return res.status(400).json({
      status: false,
      message: "Bad Request",
      err: err.message,
      data: null,
    });
  }
};

const updateWarung = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const { value, error } = warungUpdatedSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        err: error.message,
        data: null,
      });
    }

    const { nama, harga, deskripsi, kuantiti, stok, link } = value;

    const checkWarung = await prisma.warung.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!checkWarung) {
      return res.status(404).json({
        status: false,
        message: "Bad Request",
        err: "Warung tidak ditemukan",
        data: null,
      });
    }

    const pengujian = await prisma.pengujian.findFirst({
      where: {
        id_user: Number(user.id),
      },
      select: {
        id: true,
      },
      orderBy: {
        created: "desc",
      },
    });

    const checkMedia = await prisma.media.findMany({
      where: {
        id_warung: Number(id),
      },
    });

    // delete gambar di imagekit
    const deleteGambar = async (gambar) => {
      try {
        const gambarPromises = gambar.map(async (g) => {
          if (g.id_link !== "-") {
            await imagekit.deleteFile(g.id_link);
          }
        });
        return Promise.all(gambarPromises);
      } catch (err) {
        throw err;
      }
    };

    // fungsi uploadFiles untuk imagekit
    const uploadFiles = async (files, id_warung) => {
      try {
        const gambarPromises = files.map(async (file) => {
          let strFile = file.buffer.toString("base64");

          let { url, fileId } = await imagekit.upload({
            fileName: Date.now() + path.extname(file.originalname),
            file: strFile,
          });

          const gambar = await prisma.media.create({
            data: {
              id_link: fileId,
              link: url,
              id_warung: id_warung,
            },
          });

          return gambar;
        });

        return Promise.all(gambarPromises);
      } catch (err) {
        return res.status(404).json({
          status: false,
          message: "Bad Request!",
          err: err.message,
          data: null,
        });
      }
    };

    let gambar = null;

    // panggil fungsi uploadFiles untuk imagekit
    if ((req.files && req.files.length > 0) || link) {
      await deleteGambar(checkMedia);

      // delete gambar di database
      await prisma.media.deleteMany({
        where: {
          id_warung: Number(id),
        },
      });

      await uploadFiles(req.files, Number(id));

      if (link) {
        await prisma.media.create({
          data: {
            id_link: "-",
            link: link,
            id_warung: Number(id),
          },
        });
      }
    }

    const createWarung = await prisma.warung.update({
      where: {
        id: Number(id),
      },
      data: {
        id_user: Number(user.id),
        id_pengujian: Number(pengujian.id),
        nama: nama,
        harga: Number(harga),
        deskripsi: deskripsi,
        kuantiti: kuantiti,
        stok: Number(stok),
      },
    });

    return res.status(201).json({
      status: true,
      message: "Dagangan berhasil dibuat",
      err: null,
      data: createWarung,
    });
  } catch (err) {
    next(err);
    console.log(err);
    return res.status(400).json({
      status: false,
      message: "Bad Request",
      err: err.message,
      data: null,
    });
  }
};

const deleteWarung = async (req, res, next) => {
  try {
    const { id } = req.params;

    const warung = await prisma.warung.findUnique({
      where: { id: parseInt(id) },
    });

    if (!warung) {
      return res.status(400).json({
        status: false,
        message: "Bad Request!",
        err: err.message,
        data: null,
      });
    }

    const media = await prisma.media.findMany({
      where: {
        id_artikel: Number(id),
      },
    });

    // delete gambar di imagekit
    const deleteGambar = async (gambar) => {
      try {
        const gambarPromises = gambar.map(async (g) => {
          if (g.id_link !== "-") {
            await imagekit.deleteFile(g.id_link);
          }
        });

        return Promise.all(gambarPromises);
      } catch (err) {
        throw err;
      }
    };

    await deleteGambar(media);
    await prisma.media.deleteMany({
      where: {
        id_artikel: Number(id),
      },
    });

    await prisma.warung.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      status: true,
      message: "Warung deleted successfully",
      err: null,
      data: null,
    });
  } catch (err) {
    next(err);
    return res.status(400).json({
      status: false,
      message: "Bad Request",
      err: err.message,
      data: null,
    });
  }
};

module.exports = {
  createWarung,
  getAll,
  getById,
  updateWarung,
  deleteWarung,
};
