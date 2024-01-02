/*
  Warnings:

  - Added the required column `message` to the `Pengujian` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pengujian" ADD COLUMN     "message" TEXT NOT NULL;
