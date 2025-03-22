/*
  Warnings:

  - You are about to drop the column `bahaya` on the `Sakit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "id_cocoblog" INTEGER;

-- AlterTable
ALTER TABLE "Sakit" DROP COLUMN "bahaya";

-- CreateTable
CREATE TABLE "Cocoblog" (
    "id" SERIAL NOT NULL,
    "id_admin" INTEGER NOT NULL,
    "judul" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cocoblog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_id_cocoblog_fkey" FOREIGN KEY ("id_cocoblog") REFERENCES "Cocoblog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cocoblog" ADD CONSTRAINT "Cocoblog_id_admin_fkey" FOREIGN KEY ("id_admin") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
