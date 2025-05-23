const prisma = require("../libs/prisma");
const Joi = require("joi");
const imagekit = require("../libs/imagekit");
const path = require("path");
const { PREDICT_URL } = process.env;

const sakitSchema = Joi.object({
  longtitude: Joi.number().required(),
  latitude: Joi.number().required(),
});

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

    const { longtitude, latitude } = value;

    // Cek apakah ada file gambar yang diupload
    if (!req.file) {
      return res.status(400).json({
        status: false,
        message: "Image file is required",
        err: "No image uploaded",
        data: null,
      });
    }

    // Buat lokasi terlebih dahulu
    const createLokasi = await prisma.lokasi.create({
      data: {
        latitude,
        longtitude,
      },
    });

    // Upload file ke imagekit
    const uploadFiles = async (file) => {
      let strFile = file.buffer.toString("base64");

      let { url, fileId } = await imagekit.upload({
        fileName: Date.now() + path.extname(file.originalname),
        file: strFile,
      });

      return { url, fileId };
    };

    // Upload gambar terlebih dahulu
    const { url, fileId } = await uploadFiles(req.file);

    // Fetch dari API Python untuk prediksi
    const response = await fetch(`${PREDICT_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_url: url,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const hasilPredict = await response.json();

    if (!hasilPredict || !hasilPredict.data) {
      throw new Error("Data response tidak sesuai");
    }

    // Buat record sakit dengan data hasil prediksi
    const createdSakit = await prisma.sakit.create({
      data: {
        id_user: Number(id),
        id_lokasi: Number(createLokasi.id),
        penyakit: hasilPredict.data.penyakit,
        saran: hasilPredict.data.saran,
        bahaya: hasilPredict.data.bahaya,
        deskripsi: hasilPredict.data.deskripsi,
        akurasi: hasilPredict.data.akurasi,
      },
    });

    // Simpan data media setelah sakit berhasil dibuat
    const gambar = await prisma.media.create({
      data: {
        id_link: fileId,
        link: url,
        id_sakit: createdSakit.id,
      },
    });

    return res.status(201).json({
      status: true,
      message: "Sakit created successfully",
      err: null,
      data: createdSakit,
    });
  } catch (err) {
    // Gunakan next(err) saja, jangan return response di sini
    next(err);
  }
};

const getAll = async (req, res, next) => {
  try {
    const { id } = req.user;

    let allSakit = null;

    // If no search query, retrieve all sakit items
    allSakit = await prisma.sakit.findMany({
      where: {
        id_user: Number(id),
      },
      select: {
        id: true,
        penyakit: true,
        saran: true,
        bahaya: true,
        akurasi: true,
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

    allSakit = allSakit.map((item) => {
      const link =
        item.media && item.media.length > 0 ? item.media[0].link : null;
      return {
        id: item.id,
        penyakit: item.penyakit,
        saran: item.saran,
        bahaya: item.bahaya,
        deskripsi: item.deskripsi,
        akurasi: item.akurasi,
        link: link,
        lokasi: item.lokasi,
        created: new Date(item.created).toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
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
    const { id } = req.user;
    let sakitById = await prisma.sakit.findMany({
      where: {
        id_user: Number(id),
      },
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
      orderBy: {
        created: "desc",
      },
    });

    if (!sakitById.length) {
      return res.status(400).json({
        status: false,
        message: "Bad Request!",
        err: "Data penyakit tidak ditemukan",
        data: null,
      });
    }

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
          maps: klinik[0].maps,
        },
        {
          id: klinik[1].id,
          nama: klinik[1].nama,
          alamat: klinik[1].alamat,
          telepon: klinik[1].telepon,
          maps: klinik[1].maps,
        },
      ],
      created: new Date(sakitById[0].created).toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    };

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
      created: new Date(sakitById.created).toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
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
      include: {
        media: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!checkId) {
      return res.status(400).json({
        status: false,
        message: "Bad Request!",
        err: "Data penyakit tidak ditemukan",
        data: null,
      });
    }

    const idMedia = checkId.media[0].id;

    await prisma.media.delete({
      where: { id: idMedia },
    });

    await prisma.sakit.delete({
      where: { id: parseInt(id) },
    });

    await prisma.lokasi.delete({
      where: { id: Number(id) },
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
