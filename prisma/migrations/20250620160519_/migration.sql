/*
  Warnings:

  - Added the required column `status` to the `Aktivitas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Aktivitas" ADD COLUMN     "status" TEXT NOT NULL;
