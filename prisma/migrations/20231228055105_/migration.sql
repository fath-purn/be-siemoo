-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullname" TEXT NOT NULL,
    "sapi" INTEGER,
    "no_wa" TEXT,
    "rt" TEXT,
    "rw" TEXT,
    "id_kelompok" INTEGER NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'pembeli',
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kelompok" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kelompok_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artikel" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "menu" "Menu" NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Artikel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pengujian" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,
    "snf" DOUBLE PRECISION NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "ph" DOUBLE PRECISION NOT NULL,
    "hasil" "Hasil" NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pengujian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deteksi" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "cctv" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deteksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" SERIAL NOT NULL,
    "id_artikel" INTEGER,
    "id_warung" INTEGER,
    "id_link" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warung" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_pengujian" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "harga" INTEGER NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "kuantiti" INTEGER NOT NULL,
    "stok" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Warung_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Users_id_kelompok_key" ON "Users"("id_kelompok");

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_id_kelompok_fkey" FOREIGN KEY ("id_kelompok") REFERENCES "Kelompok"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artikel" ADD CONSTRAINT "Artikel_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pengujian" ADD CONSTRAINT "Pengujian_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deteksi" ADD CONSTRAINT "Deteksi_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_id_artikel_fkey" FOREIGN KEY ("id_artikel") REFERENCES "Artikel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_id_warung_fkey" FOREIGN KEY ("id_warung") REFERENCES "Warung"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warung" ADD CONSTRAINT "Warung_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warung" ADD CONSTRAINT "Warung_id_pengujian_fkey" FOREIGN KEY ("id_pengujian") REFERENCES "Pengujian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
