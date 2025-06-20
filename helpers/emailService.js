// File: services/emailService.js

const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Mengirim email yang berisi kode verifikasi (OTP)
 * @param {string} userEmail - Alamat email penerima
 * @param {string} verificationCode - Kode OTP 6 digit
 */
const sendVerificationEmail = async (userEmail, verificationCode) => {
    const mailOptions = {
        from: `"Si-eMOO" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Kode Verifikasi Akun',
        html: `
            <div style="font-family: Arial, sans-serif; text-align: center; color: #333;">
                <h2>Verifikasi Email Anda</h2>
                <p>Gunakan kode berikut untuk menyelesaikan proses registrasi:</p>
                <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px;">
                    ${verificationCode}
                </p>
                <p>Kode ini akan kedaluwarsa dalam 3 jam.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email verifikasi berhasil dikirim ke:', userEmail);
    } catch (error) {
        console.error('Gagal mengirim email verifikasi:', error);
        throw new Error('Gagal mengirim email verifikasi.');
    }
};

module.exports = { sendVerificationEmail };