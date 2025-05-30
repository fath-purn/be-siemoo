const prisma = require("../libs/prisma");
const Joi = require("joi");
const imagekit = require("../libs/imagekit");
const path = require("path");
const { toIndonesianPhoneNumber } = require("./user.controller");

const klinikSchema = Joi.object({
  id_kota: Joi.number().required(),
  nama: Joi.string().required(),
  alamat: Joi.string().required(),
  maps: Joi.string().required(),
  telepon: Joi.string().required(),
  seninSabtu: Joi.string().required(),
  minggu: Joi.string().required(),
});

const waktu = (created) => {
  const date = new Date(created);

  // Daftar nama bulan dalam bahasa Indonesia
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  // Format tanggal menjadi "28 Agustus 2024"
  const formattedDate = `${date.getDate().toString().padStart(2, "0")} ${
    monthNames[date.getMonth()]
  } ${date.getFullYear()}`;

  return formattedDate;
};

const createSakit = async (req, res, next) => {
  try {
    const { error, value } = klinikSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        err: error.message,
        data: null,
      });
    }

    const { id_kota, nama, alamat, maps, telepon, seninSabtu, minggu } = value;

    const createJadwal = await prisma.jadwal.create({
      data: {
        seninSabtu,
        minggu,
      },
    });

    const checkKota = await prisma.kota.findUnique({
      where: { id: Number(id_kota) },
    });

    if (!checkKota) {
      return res.status(400).json({
        status: false,
        message: "Bad Request!",
        err: "Kota tidak ditemukan",
        data: null,
      });
    }
    const create = await prisma.klinik.create({
      data: {
        id_kota: Number(checkKota.id), // cukup ini
        id_jadwal: Number(createJadwal.id), // dan ini
        nama,
        alamat,
        maps,
        telepon: toIndonesianPhoneNumber(telepon),
      },
    });

    // fungsi uploadFiles untuk imagekit
    const uploadFiles = async (file, id_klinik) => {
      try {
        let strFile = file.buffer.toString("base64");

        let { url, fileId } = await imagekit.upload({
          fileName: Date.now() + path.extname(file.originalname),
          file: strFile,
        });

        const gambar = await prisma.media.create({
          data: {
            id_link: fileId,
            link: url,
            id_klinik: id_klinik,
          },
        });

        return gambar;
      } catch (err) {
        return res.status(404).json({
          status: false,
          message: "Bad Request!",
          err: err.message,
          data: null,
        });
      }
    };

    // panggil fungsi uploadFiles untuk imagekit
    if (req.file) {
      await uploadFiles(req.file, create.id);
    }

    return res.status(201).json({
      status: true,
      message: "Sakit created successfully",
      err: null,
      data: create,
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

const getAll = async (req, res, next) => {
  try {
    const { search, kota } = req.query;

    // Membangun objek whereClause secara dinamis
    const whereClause = {
      ...(search && {
        nama: {
          contains: search,
          mode: "insensitive",
        },
      }),
      ...(kota && {
        kota: {
          nama: {
            contains: kota,
            mode: "insensitive",
          },
        },
      }),
    };

    // Mengambil data dari database
    const allSakit = await prisma.klinik.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      select: {
        id: true,
        nama: true,
        alamat: true,
        maps: true,
        telepon: true,
        created: true,
        kota: {
          select: {
            nama: true,
          },
        },
        jadwal: {
          select: {
            seninSabtu: true,
            minggu: true,
          },
        },
        media: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    // Memformat hasil
    const formattedResults = allSakit.map(
      ({ id, nama, alamat, maps, telepon, created, kota, jadwal, media }) => {
        const link = media && media.length > 0 ? media[0].link : null;
        return {
          id,
          nama,
          alamat,
          maps,
          telepon,
          media: link,
          kota: kota?.nama || null, // Menggunakan optional chaining dan default value
          created: waktu(created),
          jadwal: {
            seninSabtu: jadwal.seninSabtu,
            minggu: jadwal.minggu,
          },
        };
      }
    );

    return res.status(200).json({
      status: true,
      message: "All sakit retrieved successfully",
      err: null,
      data: formattedResults,
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

const getLastSakit = async (req, res, next) => {
  try {
    let sakitById = await prisma.klinik.findMany({
      select: {
        id: true,
        nama: true,
        alamat: true,
        maps: true,
        telepon: true,
        created: true,
        kota: {
          select: {
            nama: true,
          },
        },
        jadwal: {
          select: {
            seninSabtu: true,
            minggu: true,
          },
        },
        media: true,
      },
      take: 1,
    });

    sakitById = {
      id: sakitById[0].id,
      nama: sakitById[0].nama,
      alamat: sakitById[0].alamat,
      maps: sakitById[0].maps,
      telepon: sakitById[0].telepon,
      media: sakitById[0].media[0].link,
      kota: sakitById[0].kota.nama,
      created: waktu(sakitById[0].created),
      jadwal: {
        seninSabtu: sakitById[0].jadwal.seninSabtu,
        minggi: sakitById[0].jadwal.minggu,
      },
    };

    if (!sakitById) {
      return res.status(400).json({
        status: false,
        message: "Bad Request!",
        err: "Klinik tidak ditemukan",
        data: null,
      });
    }

    return res.status(200).json({
      status: true,
      message: "Klinik retrieved successfully",
      err: null,
      data: sakitById,
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

    let sakitById = await prisma.klinik.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        nama: true,
        alamat: true,
        maps: true,
        telepon: true,
        created: true,
        kota: {
          select: {
            nama: true,
          },
        },
        jadwal: {
          select: {
            seninSabtu: true,
            minggu: true,
          },
        },
        media: true,
      },
    });

    sakitById = {
      id: sakitById.id,
      nama: sakitById.nama,
      alamat: sakitById.alamat,
      maps: sakitById.maps,
      telepon: sakitById.telepon,
      media: sakitById.media[0].link,
      kota: sakitById.kota.nama,
      created: waktu(sakitById.created),
      jadwal: {
        seninSabtu: sakitById.jadwal.seninSabtu,
        minggi: sakitById.jadwal.minggu,
      },
    };

    if (!sakitById) {
      return res.status(400).json({
        status: false,
        message: "Bad Request!",
        err: "Klinik tidak ditemukan",
        data: null,
      });
    }

    return res.status(200).json({
      status: true,
      message: "Klinik retrieved successfully",
      err: null,
      data: sakitById,
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

const updateSakit = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error, value } = klinikSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        err: error.message,
        data: null,
      });
    }

    const checkKlinik = await prisma.klinik.findUnique({
      where: { id: Number(id) },
      include: { jadwal: true },
    });

    if (!checkKlinik) {
      return res.status(400).json({
        status: false,
        message: "Bad Request!",
        err: "Data klinik tidak ditemukan",
        data: null,
      });
    }

    const { id_kota, nama, alamat, maps, telepon, seninSabtu, minggu } = value;

    // Cek kota
    const checkKota = await prisma.kota.findUnique({
      where: { id: Number(id_kota) },
    });

    if (!checkKota) {
      return res.status(400).json({
        status: false,
        message: "Bad Request!",
        err: "Kota tidak ditemukan",
        data: null,
      });
    }

    // Update jadwal
    await prisma.jadwal.update({
      where: { id: checkKlinik.id_jadwal },
      data: {
        seninSabtu,
        minggu,
      },
    });

    // Update data klinik
    const updatedKlinik = await prisma.klinik.update({
      where: { id: Number(id) },
      data: {
        id_kota: Number(id_kota),
        nama,
        alamat,
        maps,
        telepon: toIndonesianPhoneNumber(telepon),
      },
    });

    // fungsi uploadFiles untuk imagekit
    const uploadFiles = async (file, id_klinik) => {
      try {
        let strFile = file.buffer.toString("base64");

        let { url, fileId } = await imagekit.upload({
          fileName: Date.now() + path.extname(file.originalname),
          file: strFile,
        });

        // opsional: hapus media lama dulu jika hanya boleh satu file
        await prisma.media.deleteMany({
          where: { id_klinik: id_klinik },
        });

        const gambar = await prisma.media.create({
          data: {
            id_link: fileId,
            link: url,
            id_klinik: id_klinik,
          },
        });

        return gambar;
      } catch (err) {
        return res.status(404).json({
          status: false,
          message: "Upload Failed",
          err: err.message,
          data: null,
        });
      }
    };

    // Jika ada file baru, upload dan update media
    if (req.file) {
      await uploadFiles(req.file, updatedKlinik.id);
    }

    return res.status(200).json({
      status: true,
      message: "Data klinik updated successfully",
      err: null,
      data: updatedKlinik,
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


const deleteSakit = async (req, res, next) => {
  try {
    const { id } = req.params;

    const checkId = await prisma.klinik.findUnique({
      where: { id: Number(id) },
    });

    if (!checkId) {
      return res.status(400).json({
        status: false,
        message: "Bad Request!",
        err: "Klinik tidak ditemukan",
        data: null,
      });
    }

    // Hapus semua media terkait
    await prisma.media.deleteMany({
      where: { id_klinik: Number(id) },
    });

    // Hapus jadwal (dari id_jadwal yang diambil dari data klinik)
    
    // Hapus klinik
    await prisma.klinik.delete({
      where: { id: Number(id) },
    });
    
    await prisma.jadwal.delete({
      where: { id: checkId.id_jadwal },
    });

    return res.status(200).json({
      status: true,
      message: "Klinik deleted successfully",
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


const createKota = async (req, res, next) => {
  try {
    const { nama } = req.body;

    const create = await prisma.kota.create({
      data: {
        nama,
      },
    });

    return res.status(200).json({
      status: true,
      message: "Kota berhasil dibuat",
      err: null,
      data: create,
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

const getKotaAll = async (req, res, next) => {
  try {
    const data = await prisma.kota.findMany({
      select: {
        id: true,
        nama: true,
      },
    });

    // Map data to the desired format
    const formattedData = data.map((item) => ({
      label: item.nama, // Use 'nama' as label
      value: item.id, // Use 'id' as value
    }));

    return res.status(200).json({
      status: true,
      message: "Kota berhasil diambil",
      err: null,
      data: formattedData, // Use the formatted data
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

const deleteKota = async (req, res, next) => {
  try {
    const { id } = req.params;

    const checkId = await prisma.kota.findUnique({
      where: { id: Number(id) },
    });

    if (!checkId) {
      return res.status(400).json({
        status: false,
        message: "Bad Request!",
        err: "Kota tidak ditemukan",
        data: null,
      });
    }

    const deleted = await prisma.kota.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({
      status: true,
      message: "Sakit deleted successfully",
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
  getAll,
  getById,
  createSakit,
  updateSakit,
  deleteSakit,
  getLastSakit,
  createKota,
  getKotaAll,
  deleteKota,
};
