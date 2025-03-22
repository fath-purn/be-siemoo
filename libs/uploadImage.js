const imagekit = require("./imagekit");
const path = require("path");
const prisma = require("./prisma");

const uploadFiles = async (file, entityId, entityName,) => {
  if (!file) throw new Error("File is required");

  try {
    let strFile = file.buffer.toString("base64");
    let { url, fileId } = await imagekit.upload({
      fileName: Date.now() + path.extname(file.originalname),
      file: strFile,
    });

    // Dynamically create the data object for Prisma
    const data = {
      id_link: fileId,
      link: url,
    };

    // Use bracket notation to set the field dynamically
    data[`id_${entityName}`] = entityId;

    console.log('data', data);

    return await prisma.media.create({
      data,
    });
  } catch (err) {
    throw err;
  }
};

module.exports = uploadFiles;
