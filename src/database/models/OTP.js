const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    otpCode: { type: String, required: true },
    userId: { type: String, ref: 'User', required: true },  // Referencia al usuario
    expiresAt: { type: Date, required: true },  // Fecha de expiración del OTP
    isUsed: { type: Boolean, default: false },  // Indica si ya ha sido utilizado
});

module.exports = mongoose.model('OTP', otpSchema);