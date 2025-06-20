/*
  Warnings:

  - Made the column `verified` on table `Users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "verified" SET NOT NULL;

-- CreateTable
CREATE TABLE "Aktivitas" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "aktivitas" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Aktivitas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Aktivitas" ADD CONSTRAINT "Aktivitas_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
