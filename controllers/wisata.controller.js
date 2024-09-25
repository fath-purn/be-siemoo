const prisma = require("../libs/prisma");
const imagekit = require("../libs/imagekit");
const path = require("path");
const { getPagination } = require("../helpers/pagination");
const { createWisataSchema } = require("../validations/validation");

const getAllWisata = async (req, res, next) => {
  try {
    try {
      if ((req.query.page || req.query.limit) && req.query.search) {
        let { page = 1, limit = 10 } = req.query;
        page = Number(page);
        limit = Number(limit);
        
        const wisata = await prisma.wisata.findMany({
          where: {
            OR: [
              {
                nama: {
                  contains: req.query.search,
                  mode: "insensitive",
                },
              },
              {
                alamat: {
                  contains: req.query.search,
                  mode: "insensitive",
                },
              },
            ],
          },
          include: {
            gambar: true,
            keterangan: true,
            kecamatan: true,
          },
          skip: (page - 1) * limit,
          take: limit,
        });

        // jadikan 1 object
        const wisataObject = wisata.map((w) => {
          const { gambar, keterangan, kecamatan, ...rest } = w;
          const filteredItem = {
            ...rest,
            gambar: gambar.map((g) => g.url),
            keterangan: {
              jarak: keterangan.jarak,
              buka: keterangan.buka,
              tutup: keterangan.tutup,
              akomodasi: keterangan.akomodasi,
              kolam: keterangan.kolam,
              parkir: keterangan.parkir,
              tiket: keterangan.tiket,
            },
            kecamatan: kecamatan.nama,
          };
          return Object.fromEntries(
            Object.entries(filteredItem).filter(
              ([_, value]) => value !== undefined
            )
          );
        });

        const { _count } = await prisma.wisata.aggregate({
          _count: { id: true },
        });

        const pagination = getPagination(req, res, _count.id, page, limit);

        return res.status(200).json({
          success: true,
          message: "OK",
          err: null,
          data: { pagination, wisataObject },
        });
      }

      if (req.query.page || req.query.limit) {
        let { page = 1, limit = 10 } = req.query;
        page = Number(page);
        limit = Number(limit);
        const wisata = await prisma.wisata.findMany({
          include: {
            gambar: true,
            keterangan: true,
            kecamatan: true,
          },
          skip: (page - 1) * limit,
          take: limit,
        });

        // jadikan 1 object
        const wisataObject = wisata.map((w) => {
          const { gambar, keterangan, kecamatan, ...rest } = w;
          const filteredItem = {
            ...rest,
            gambar: gambar.map((g) => g.url),
            keterangan: {
              jarak: keterangan.jarak,
              buka: keterangan.buka,
              tutup: keterangan.tutup,
              akomodasi: keterangan.akomodasi,
              kolam: keterangan.kolam,
              parkir: keterangan.parkir,
              tiket: keterangan.tiket,
            },
            kecamatan: kecamatan.nama,
          };
          return Object.fromEntries(
            Object.entries(filteredItem).filter(
              ([_, value]) => value !== undefined
            )
          );
        });

        const { _count } = await prisma.wisata.aggregate({
          _count: { id: true },
        });

        const pagination = getPagination(req, res, _count.id, page, limit);

        return res.status(200).json({
          success: true,
          message: "OK",
          err: null,
          data: { pagination, wisataObject },
        });
      }

      if (req.query.search) {
        const { search } = req.query;
        const wisata = await prisma.wisata.findMany({
          where: {
            OR: [
              {
                nama: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                alamat: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          },
          include: {
            gambar: true,
            keterangan: true,
            kecamatan: true,
          },
        });

        // jadikan 1 object
        const wisataObject = wisata.map((w) => {
          const { gambar, keterangan, kecamatan, ...rest } = w;
          const filteredItem = {
            ...rest,
            gambar: gambar.map((g) => g.url),
            keterangan: {
              jarak: keterangan.jarak,
              buka: keterangan.buka,
              tutup: keterangan.tutup,
              akomodasi: keterangan.akomodasi,
              kolam: keterangan.kolam,
              parkir: keterangan.parkir,
              tiket: keterangan.tiket,
            },
            kecamatan: kecamatan.nama,
          };
          return Object.fromEntries(
            Object.entries(filteredItem).filter(
              ([_, value]) => value !== undefined
            )
          );
        });

        return res.status(200).json({
          success: true,
          message: "OK",
          err: null,
          data: wisataObject,
        });
      }

      const wisata = await prisma.wisata.findMany({
        include: {
          gambar: true,
          keterangan: true,
          kecamatan: true,
        },
      });

      // jadikan 1 object
      const wisataObject = wisata.map((w) => {
        const { gambar, keterangan, kecamatan, ...rest } = w;
        const filteredItem = {
          ...rest,
          gambar: gambar.map((g) => g.url),
          keterangan: {
            jarak: keterangan.jarak,
            buka: keterangan.buka,
            tutup: keterangan.tutup,
            akomodasi: keterangan.akomodasi,
            kolam: keterangan.kolam,
            parkir: keterangan.parkir,
            tiket: keterangan.tiket,
          },
          kecamatan: kecamatan.nama,
        };
        return Object.fromEntries(
          Object.entries(filteredItem).filter(
            ([_, value]) => value !== undefined
          )
        );
      });
      return res.status(200).json({
        success: true,
        message: "OK",
        err: null,
        data: wisataObject,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Bad Request!",
        err: err.message,
        data: null,
      });
    }
  } catch (err) {
    next(err);
  }
};

const getWisataById = async (req, res, next) => {
  try {
    const { id } = req.params;
    try {
      const wisata = await prisma.wisata.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          gambar: true,
          keterangan: true,
          kecamatan: true,
        },
      });

      const hotelTerdekat = await prisma.kecamatan.findUnique({
        where: {
          id: wisata.idKecamatan,
        },
        include: {
          hotel: {
            include: {
              gambar: true,
            },
          },
          take: 2,
        },
      });

      console.log(hotelTerdekat)

      // jadikan 1 object
      const wisataObject = {
        ...wisata,
        gambar: wisata.gambar.map((g) => g.url),
        keterangan: {
          jarak: wisata.keterangan.jarak,
          buka: wisata.keterangan.buka,
          tutup: wisata.keterangan.tutup,
          akomodasi: wisata.keterangan.akomodasi,
          kolam: wisata.keterangan.kolam,
          parkir: wisata.keterangan.parkir,
          tiket: wisata.keterangan.tiket,
        },
        kecamatan: wisata.kecamatan.nama,
      };

      if (!wisata) {
        return res.status(404).json({
          success: false,
          message: "Bad Request!",
          err: "Wisata tidak ditemukan",
          data: null,
        });
      }

      const dataHotelTerdekat = hotelTerdekat.hotel.map((h) => {
        const { gambar, ...rest } = h;
        const filteredItem = {
          id: rest.id,
          nama: rest.nama,
          gambar: gambar[0].url,
        };
        return Object.fromEntries(
          Object.entries(filteredItem).filter(
            ([_, value]) => value !== undefined
          )
        );
      });

      res.status(200).json({
        success: true,
        message: "OK",
        err: null,
        data: { wisataObject, hotelTerdekat: dataHotelTerdekat },
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Bad Request!",
        err: err.message,
        data: null,
      });
    }
  } catch (err) {
    next(err);
  }
};

const createWisata = async (req, res, next) => {
  try {
    const {
      nama,
      deskripsi,
      alamat,
      maps,
      price,
      idKecamatan,
      jarak,
      buka,
      tutup,
      akomodasi,
      kolam,
      parkir,
      tiket,
    } = req.body;

    try {
      await createWisataSchema.validateAsync({
        nama,
        deskripsi,
        alamat,
        maps,
        price,
        idKecamatan,
        jarak,
        buka,
        tutup,
        akomodasi,
        tiket,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Bad Request",
        err: err.message,
        data: null,
      });
    }

    try {
      const srcRegex = /src="([^"]*)"/;
      const srcMatch = maps.match(srcRegex);

      const linkMaps = srcMatch ? srcMatch[1] : null;

      const kecamatan = await prisma.kecamatan.findUnique({
        where: {
          id: Number(idKecamatan),
        },
      });

      if (!kecamatan) {
        return res.status(404).json({
          success: false,
          message: "Bad Request!",
          err: "Kecamatan tidak ditemukan",
          data: null,
        });
      }

      // fungsi uploadFiles untuk imagekit
      const uploadFiles = async (files, idWisata, nama) => {
        try {
          const gambarPromises = files.map(async (file) => {
            let strFile = file.buffer.toString("base64");

            let { url, fileId } = await imagekit.upload({
              fileName: Date.now() + path.extname(file.originalname),
              file: strFile,
            });

            const gambar = await prisma.gambar.create({
              data: {
                idImagekit: fileId,
                nama: nama + path.extname(file.originalname),
                url,
                wisataId: idWisata,
              },
            });

            return gambar;
          });

          return Promise.all(gambarPromises);
        } catch (err) {
          throw err;
        }
      };

      // buat wisata baru
      const wisata = await prisma.wisata.create({
        data: {
          nama,
          deskripsi,
          alamat,
          maps: linkMaps,
          price: Number(price),
          idKecamatan: Number(idKecamatan),
        },
      });

      // buat keterangan baru
      const keterangan = await prisma.keterangan.create({
        data: {
          idWisata: wisata.id,
          jarak: Number(jarak),
          buka: buka,
          tutup: tutup,
          akomodasi: Number(akomodasi),
          kolam: Boolean(kolam),
          parkir: Boolean(parkir),
          tiket: Number(tiket),
        },
      });

      // panggil fungsi uploadFiles untuk imagekit
      const gambar = await uploadFiles(req.files, wisata.id, wisata.nama);

      res.status(201).json({
        success: true,
        message: "Wisata berhasil ditambahkan",
        err: null,
        data: {
          wisata,
          gambar,
          keterangan,
        },
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Bad Request!",
        err: err.message,
        data: null,
      });
    }
  } catch (err) {
    next(err);
  }
};

const updateWisata = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      nama,
      deskripsi,
      alamat,
      maps,
      price,
      idKecamatan,
      jarak,
      buka,
      tutup,
      akomodasi,
      kolam,
      parkir,
      tiket,
    } = req.body;

    try {
      await createWisataSchema.validateAsync({
        nama,
        deskripsi,
        alamat,
        maps,
        price,
        idKecamatan,
        jarak,
        buka,
        tutup,
        akomodasi,
        tiket,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Bad Request",
        err: err.message,
        data: null,
      });
    }

    try {
      const srcRegex = /src="([^"]*)"/;
      const srcMatch = maps.match(srcRegex);

      const linkMaps = srcMatch ? srcMatch[1] : null;

      // cek wisata
      const wisata = await prisma.wisata.findUnique({
        where: {
          id: Number(id),
        },
      });

      // cek gambar
      const gambarLama = await prisma.gambar.findMany({
        where: {
          wisataId: Number(id),
        },
      });

      // delete gambar di imagekit
      const deleteGambar = async (gambar) => {
        try {
          const gambarPromises = gambar.map(async (g) => {
            await imagekit.deleteFile(g.idImagekit);
          });

          return Promise.all(gambarPromises);
        } catch (err) {
          throw err;
        }
      };

      await deleteGambar(gambarLama);

      // delete gambar di database
      await prisma.gambar.deleteMany({
        where: {
          wisataId: Number(id),
        },
      });

      // fungsi uploadFiles untuk imagekit
      const uploadFiles = async (files, idWisata, nama) => {
        try {
          const gambarPromises = files.map(async (file) => {
            let strFile = file.buffer.toString("base64");

            let { url, fileId } = await imagekit.upload({
              fileName: Date.now() + path.extname(file.originalname),
              file: strFile,
            });

            const gambar = await prisma.gambar.create({
              data: {
                idImagekit: fileId,
                nama: nama + path.extname(file.originalname),
                url,
                wisataId: idWisata,
              },
            });

            return gambar;
          });

          return Promise.all(gambarPromises);
        } catch (err) {
          throw err;
        }
      };

      // buat wisata baru
      const updateWisata = await prisma.wisata.update({
        where: {
          id: Number(id),
        },
        data: {
          nama,
          deskripsi,
          alamat,
          maps: linkMaps,
          price: Number(price),
          idKecamatan: Number(idKecamatan),
        },
      });

      // buat keterangan baru
      const updateKeterangan = await prisma.keterangan.update({
        where: {
          idWisata: Number(id),
        },
        data: {
          jarak: Number(jarak),
          buka: buka,
          tutup: tutup,
          akomodasi: Number(akomodasi),
          kolam: Boolean(kolam),
          parkir: Boolean(parkir),
          tiket: Number(tiket),
        },
      });

      // panggil fungsi uploadFiles untuk imagekit
      const gambar = await uploadFiles(req.files, wisata.id, wisata.nama);

      res.status(201).json({
        success: true,
        message: "Wisata berhasil diupdate",
        err: null,
        data: {
          updateWisata,
          gambar,
          updateKeterangan,
        },
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Bad Request!",
        err: err.message,
        data: null,
      });
    }
  } catch (err) {
    next(err);
  }
};

const deleteWisata = async (req, res, next) => {
  try {
    try {
      const { id } = req.params;

      // cek wisata
      const wisata = await prisma.wisata.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (!wisata) {
        return res.status(404).json({
          success: false,
          message: "Bad Request!",
          err: "Wisata tidak ditemukan",
          data: null,
        });
      }

      // cek gambar
      const gambar = await prisma.gambar.findMany({
        where: {
          wisataId: Number(id),
        },
      });

      // delete gambar di imagekit
      const deleteGambar = async (gambar) => {
        try {
          const gambarPromises = gambar.map(async (g) => {
            await imagekit.deleteFile(g.idImagekit);
          });

          return Promise.all(gambarPromises);
        } catch (err) {
          throw err;
        }
      };

      await deleteGambar(gambar);

      // delete gambar di database
      await prisma.gambar.deleteMany({
        where: {
          wisataId: Number(id),
        },
      });

      // delete keterangan
      await prisma.keterangan.delete({
        where: {
          idWisata: Number(id),
        },
      });

      // delete wisata
      await prisma.wisata.delete({
        where: {
          id: Number(id),
        },
      });

      res.status(200).json({
        success: true,
        message: "Wisata berhasil dihapus",
        err: null,
        data: null,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Bad Request!",
        err: err.message,
        data: null,
      });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllWisata,
  getWisataById,
  createWisata,
  updateWisata,
  deleteWisata,
};
