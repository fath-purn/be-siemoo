/*
  Warnings:

  - You are about to drop the `Artikel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Deteksi` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Kelompok` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Media` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Pengujian` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Warung` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Artikel" DROP CONSTRAINT "Artikel_id_user_fkey";

-- DropForeignKey
ALTER TABLE "Deteksi" DROP CONSTRAINT "Deteksi_id_user_fkey";

-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_id_artikel_fkey";

-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_id_warung_fkey";

-- DropForeignKey
ALTER TABLE "Pengujian" DROP CONSTRAINT "Pengujian_id_user_fkey";

-- DropForeignKey
ALTER TABLE "Users" DROP CONSTRAINT "Users_id_kelompok_fkey";

-- DropForeignKey
ALTER TABLE "Warung" DROP CONSTRAINT "Warung_id_pengujian_fkey";

-- DropForeignKey
ALTER TABLE "Warung" DROP CONSTRAINT "Warung_id_user_fkey";

-- DropTable
DROP TABLE "Artikel";

-- DropTable
DROP TABLE "Deteksi";

-- DropTable
DROP TABLE "Kelompok";

-- DropTable
DROP TABLE "Media";

-- DropTable
DROP TABLE "Pengujian";

-- DropTable
DROP TABLE "Users";

-- DropTable
DROP TABLE "Warung";

-- DropEnum
DROP TYPE "Hasil";

-- DropEnum
DROP TYPE "Menu";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "Ngarang" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Ngarang_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ngarang_email_key" ON "Ngarang"("email");
