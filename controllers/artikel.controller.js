const prisma = require("../libs/prisma");
const {
  artikelSchema,
  artikelUpdatedSchema,
} = require("../validations/limbah.validation");
const imagekit = require("../libs/imagekit");
const path = require("path");

const createArtikel = async (req, res, next) => {
  try {
    const { user } = req;
    const { error, value } = artikelSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        err: error.message,
        data: null,
      });
    }

    const { judul, deskripsi, menu, link } = value;

    const createdArtikel = await prisma.artikel.create({
      data: {
        id_user: Number(user.id),
        judul,
        deskripsi,
        menu,
      },
    });

    // fungsi uploadFiles untuk imagekit
    const uploadFiles = async (files, id_artikel) => {
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
              id_artikel: id_artikel,
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
      await uploadFiles(req.files, createdArtikel.id);
    }

    if (link) {
      await prisma.media.create({
        data: {
          id_link: "-",
          link: link,
          id_artikel: createdArtikel.id,
        },
      });
    }

    return res.status(201).json({
      status: true,
      message: "Artikel created successfully",
      err: null,
      data: createdArtikel,
    });
  } catch (err) {
    next(err);
    return res.status(400).json({
      status: false,
      message: "Bad Request!",
      err: err.message,
      data: null,
    });
  }
};

const getAllLimbah = async (req, res, next) => {
  try {
    const allArtikel = await prisma.artikel.findMany({
      where: {
        menu: "sulap_limbah",
      },
      select: {
        id: true,
        judul: true,
        deskripsi: true,
        menu: true,
        media: {
          select: {
            id: true,
            link: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    return res.status(200).json({
      status: true,
      message: "All Artikel retrieved successfully",
      err: null,
      data: allArtikel,
    });
  } catch (err) {
    next(err);
    return res.status(400).json({
      status: false,
      message: "Bad Request!",
      err: err.message,
      data: null,
    });
  }
};

const getAllPangan = async (req, res, next) => {
  try {
    const allArtikel = await prisma.artikel.findMany({
      where: {
        menu: "olah_pangan",
      },
      select: {
        id: true,
        judul: true,
        deskripsi: true,
        menu: true,
        media: {
          select: {
            id: true,
            link: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    return res.status(200).json({
      status: true,
      message: "All Artikel retrieved successfully",
      err: null,
      data: allArtikel,
    });
  } catch (err) {
    next(err);
    return res.status(400).json({
      status: false,
      message: "Bad Request!",
      err: err.message,
      data: null,
    });
  }
};

const getAllEdukasi = async (req, res, next) => {
  try {
    const allArtikel = await prisma.artikel.findMany({
      where: {
        menu: "edukasi",
      },
      select: {
        id: true,
        judul: true,
        deskripsi: true,
        menu: true,
        media: {
          select: {
            id: true,
            link: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    return res.status(200).json({
      status: true,
      message: "All Artikel retrieved successfully",
      err: null,
      data: allArtikel,
    });
  } catch (err) {
    next(err);
    return res.status(400).json({
      status: false,
      message: "Bad Request!",
      err: err.message,
      data: null,
    });
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const artikelById = await prisma.artikel.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        judul: true,
        deskripsi: true,
        menu: true,
        user: {
          select: {
            id: true,
            fullname: true,
            no_wa: true,
          }
        },
        media: {
          select: {
            id: true,
            link: true,
          },
        },
        created: true,
        updated: true,
      },
    });

    if (!artikelById) {
      return res.status(400).json({
        status: false,
        message: "Bad Request!",
        err: "Artikel tidak ditemukan",
        data: null,
      });
    }

    return res.status(200).json({
      status: true,
      message: "Artikel retrieved successfully",
      err: null,
      data: artikelById,
    });
  } catch (err) {
    next(err);
    return res.status(400).json({
      status: false,
      message: "Bad Request!",
      err: err.message,
      data: null,
    });
  }
};

const updateArtikel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const { error, value } = artikelUpdatedSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        err: error.message,
        data: null,
      });
    }

    const { judul, deskripsi, menu, link } = value;

    const checkArtikel = await prisma.artikel.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!checkArtikel) {
      return res.status(404).json({
        status: false,
        message: "Bad Request!",
        err: "Artikel tidak ditemukan",
        data: null,
      });
    }

    const checkMedia = await prisma.media.findMany({
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

    // fungsi uploadFiles untuk imagekit
    const uploadFiles = async (files, id_artikel) => {
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
              id_artikel: id_artikel,
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
          id_artikel: Number(id),
        },
      });

      await uploadFiles(req.files, Number(id));

      if (link) {
        await prisma.media.create({
          data: {
            id_link: "-",
            link: link,
            id_artikel: Number(id),
          },
        });
      }
    }

    const updateArtikel = await prisma.artikel.update({
      where: {
        id: Number(id),
      },
      data: {
        id_user: Number(user.id),
        judul,
        deskripsi,
        menu,
      },
    });

    return res.status(201).json({
      status: true,
      message: "Artikel updated successfully",
      err: null,
      data: updateArtikel,
    });
  } catch (err) {
    next(err);
    return res.status(400).json({
      status: false,
      message: "Bad Request!",
      err: err.message,
      data: null,
    });
  }
};

const deleteArtikel = async (req, res, next) => {
  try {
    const { id } = req.params;

    const artikel = await prisma.artikel.findUnique({
      where: { id: parseInt(id) },
    });

    if (!artikel) {
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

    await prisma.artikel.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      status: true,
      message: "Artikel deleted successfully",
      err: null,
      data: null,
    });
  } catch (err) {
    next(err);
    return res.status(400).json({
      status: false,
      message: "Bad Request!",
      err: err.message,
      data: null,
    });
  }
};

module.exports = {
  createArtikel,
  getAllPangan,
  getAllLimbah,
  getById,
  updateArtikel,
  deleteArtikel,
  getAllEdukasi,
};
