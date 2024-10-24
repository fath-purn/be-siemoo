const prisma = require("../libs/prisma");
const Joi = require("joi");
const imagekit = require("../libs/imagekit");
const path = require("path");

const sakitSchema = Joi.object({
  longtitude: Joi.number().required(),
  latitude: Joi.number().required(),
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
    const { id } = req.user;
    const { error, value } = sakitSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        err: error.message,
        data: null,
      });
    }

    /* 
      masuk ke enpoint dari python

      data yang dibalikan dari python
      {penyakit, saran, bahaya, deskripsi, akurasi}
    */

    // const {penyakit,
    //   saran,
    //   bahaya,
    //   deskripsi,
    //   akurasi} =

    const { longtitude, latitude } = value;

    const createLokasi = await prisma.lokasi.create({
      data: {
        latitude,
        longtitude,
      },
    });

    const createdSakit = await prisma.sakit.create({
      data: {
        id_user: Number(id),
        id_lokasi: Number(createLokasi.id),
        penyakit: "ad",
        saran: "ad",
        bahaya: "98",
        deskripsi: "ad",
        akurasi: 3,
      },
    });

    // fungsi uploadFiles untuk imagekit
    const uploadFiles = async (file, id_sakit) => {
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
            id_sakit: id_sakit,
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
      await uploadFiles(req.file, createdSakit.id);
    }

    return res.status(201).json({
      status: true,
      message: "Sakit created successfully",
      err: null,
      data: createdSakit,
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
    // Extract search query from request parameters
    const { search } = req.query;

    let allSakit = null;

    // Check if a search query is provided
    if (search) {
      allSakit = await prisma.sakit.findMany({
        where: {
          OR: [
            {
              penyakit: {
                contains: search,
                mode: "insensitive", // Case-insensitive search
              },
            },
            // Add more fields for searching if needed
          ],
        },
        // select: {
        //   id: true,
        //   nama: true,
        // },
        orderBy: {
          id: "desc",
        },
      });
    } else {
      // If no search query, retrieve all sakit items
      allSakit = await prisma.sakit.findMany({
        select: {
          id: true,
          penyakit: true,
          saran: true,
          bahaya: true,
          deskripsi: true,
          media: true,
          created: true,
          lokasi: {
            select: {
              longtitude: true,
              latitude: true,
            },
          },
        },
        orderBy: {
          id: "desc",
        },
      });
    }

    allSakit = allSakit.map((item) => {
      const link =
        item.media && item.media.length > 0 ? item.media[0].link : null;
      return {
        id: item.id,
        penyakit: item.penyakit,
        saran: item.saran,
        bahaya: item.bahaya,
        deskripsi: item.deskripsi,
        link: link,
        lokasi: item.lokasi,
        created: waktu(item.created),
      };
    });

    return res.status(200).json({
      status: true,
      message: "All sakit retrieved successfully",
      err: null,
      data: allSakit,
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
    let sakitById = await prisma.sakit.findMany({
      select: {
        id: true,
        penyakit: true,
        saran: true,
        bahaya: true,
        deskripsi: true,
        akurasi: true,
        created: true,
        media: true,
        lokasi: {
          select: {
            longtitude: true,
            latitude: true,
          },
        },
      },
      take: 1,
    });

    const klinik = await prisma.klinik.findMany({
      take: 2,
    });

    sakitById = {
      id: sakitById[0].id,
      penyakit: sakitById[0].penyakit,
      saran: sakitById[0].saran,
      bahaya: sakitById[0].bahaya,
      deskripsi: sakitById[0].deskripsi,
      akurasi: sakitById[0].akurasi,
      lokasi: {
        longtitude: sakitById[0].lokasi.longtitude,
        latitude: sakitById[0].lokasi.latitude,
      },
      link: sakitById[0].media[0].link,
      lokasi: sakitById[0].lokasi,
      klinik: [
        {
          id: klinik[0].id,
          nama: klinik[0].nama,
          alamat: klinik[0].alamat,
          telepon: klinik[0].telepon,
          maps: klinik[0].maps
        },
        {
          id: klinik[1].id,
          nama: klinik[1].nama,
          alamat: klinik[1].alamat,
          telepon: klinik[1].telepon,
          maps: klinik[1].maps
        },
      ],
      created: waktu(sakitById[0].created),
    };

    if (!sakitById) {
      return res.status(400).json({
        status: false,
        message: "Bad Request!",
        err: "Data penyakit tidak ditemukan",
        data: null,
      });
    }

    return res.status(200).json({
      status: true,
      message: "Penyakit retrieved successfully",
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
    let sakitById = await prisma.sakit.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        penyakit: true,
        saran: true,
        bahaya: true,
        deskripsi: true,
        created: true,
        akurasi: true,
        media: true,
        lokasi: {
          select: {
            longtitude: true,
            latitude: true,
          },
        },
      },
    });

    const klinik = await prisma.klinik.findMany({
      take: 2,
    });

    sakitById = {
      id: sakitById.id,
      penyakit: sakitById.penyakit,
      saran: sakitById.saran,
      bahaya: sakitById.bahaya,
      deskripsi: sakitById.deskripsi,
      akurasi: sakitById.akurasi,
      link: sakitById.media[0].link,
      lokasi: sakitById.lokasi,
      lokasi: {
        longtitude: sakitById.lokasi.longtitude,
        latitude: sakitById.lokasi.latitude,
      },
      klinik: [
        {
          id: klinik[0].id,
          nama: klinik[0].nama,
          alamat: klinik[0].alamat,
          telepon: klinik[0].telepon,
        },
        {
          id: klinik[1].id,
          nama: klinik[1].nama,
          alamat: klinik[1].alamat,
          telepon: klinik[1].telepon,
        },
      ],
      created: waktu(sakitById.created),
    };

    if (!sakitById) {
      return res.status(400).json({
        status: false,
        message: "Bad Request!",
        err: "Data penyakit tidak ditemukan",
        data: null,
      });
    }

    return res.status(200).json({
      status: true,
      message: "Penyakit retrieved successfully",
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
    const { nama } = req.body;

    const { error, value } = sakitSchema.validate({ nama });

    const checkId = await prisma.sakit.findUnique({
      where: { id: Number(id) },
    });

    if (!checkId) {
      return res.status(400).json({
        status: false,
        message: "Bad Request!",
        err: "Data penyakit tidak ditemukan",
        data: null,
      });
    }

    if (error) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        err: error.message,
        data: null,
      });
    }

    const updatedSakit = await prisma.sakit.update({
      where: { id: parseInt(id) },
      data: { nama: value.nama },
    });

    return res.status(200).json({
      status: true,
      message: "Data penyakit updated successfully",
      err: null,
      data: updatedSakit,
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

    const checkId = await prisma.sakit.findUnique({
      where: { id: Number(id) },
    });

    if (!checkId) {
      return res.status(400).json({
        status: false,
        message: "Bad Request!",
        err: "Data penyakit tidak ditemukan",
        data: null,
      });
    }

    const deletedSakit = await prisma.sakit.delete({
      where: { id: parseInt(id) },
    });

    await prisma.media.delete({
      where: { id_sakit: parseInt(id) },
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
};
