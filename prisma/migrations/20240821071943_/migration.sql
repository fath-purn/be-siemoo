-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "id_klinik" INTEGER,
ADD COLUMN     "id_sakit" INTEGER;

-- CreateTable
CREATE TABLE "Sakit" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_lokasi" INTEGER NOT NULL,
    "penyakit" TEXT NOT NULL,
    "saran" TEXT NOT NULL,
    "bahaya" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "akurasi" DOUBLE PRECISION NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sakit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lokasi" (
    "id" SERIAL NOT NULL,
    "longtitude" DOUBLE PRECISION NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lokasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Klinik" (
    "id" SERIAL NOT NULL,
    "id_kota" INTEGER NOT NULL,
    "id_jadwal" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "maps" TEXT NOT NULL,
    "telepon" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Klinik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kota" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jadwal" (
    "id" SERIAL NOT NULL,
    "seninSabtu" TEXT NOT NULL,
    "minggu" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Jadwal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_id_sakit_fkey" FOREIGN KEY ("id_sakit") REFERENCES "Sakit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_id_klinik_fkey" FOREIGN KEY ("id_klinik") REFERENCES "Klinik"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sakit" ADD CONSTRAINT "Sakit_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sakit" ADD CONSTRAINT "Sakit_id_lokasi_fkey" FOREIGN KEY ("id_lokasi") REFERENCES "Lokasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Klinik" ADD CONSTRAINT "Klinik_id_kota_fkey" FOREIGN KEY ("id_kota") REFERENCES "Kota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Klinik" ADD CONSTRAINT "Klinik_id_jadwal_fkey" FOREIGN KEY ("id_jadwal") REFERENCES "Jadwal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
