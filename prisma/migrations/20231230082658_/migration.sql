/*
  Warnings:

  - Changed the type of `stok` on the `Warung` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Warung" ALTER COLUMN "kuantiti" SET DATA TYPE TEXT,
DROP COLUMN "stok",
ADD COLUMN     "stok" INTEGER NOT NULL;
