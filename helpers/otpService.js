// File: services/otpService.js

const prisma = require('../libs/prisma'); // Sesuaikan path ke Prisma Client
const { sendVerificationEmail } = require('./emailService');

/**
 * Membuat OTP baru, menyimpannya ke database, dan mengirimkannya via email.
 * @param {object} user - Objek user dari Prisma
 */
const generateAndSendOtp = async (user) => {
    // 1. Generate kode 6 digit
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Tentukan waktu kedaluwarsa (3 jam dari sekarang dalam milidetik)
    const expiresAt = Date.now() + (3 * 60 * 60 * 1000);

    // 3. Update user di database dengan kode dan waktu kedaluwarsa baru
    const updatedUser = await prisma.users.update({
        where: { id: user.id },
        data: {
            verificationCode: verificationCode,
            verificationCodeExpiresAt: BigInt(expiresAt)
        }
    });

    // 4. Kirim email menggunakan service yang sudah kita buat
    await sendVerificationEmail(updatedUser.email, verificationCode);

    return updatedUser; // Kembalikan user yang sudah di-update
};

module.exports = { generateAndSendOtp };