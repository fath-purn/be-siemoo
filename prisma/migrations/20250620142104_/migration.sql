-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "verificationCode" TEXT,
ADD COLUMN     "verificationCodeExpiresAt" BIGINT,
ADD COLUMN     "verified" BOOLEAN DEFAULT false;
