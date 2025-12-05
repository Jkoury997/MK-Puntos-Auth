const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
    token: { type: String, required: true },
    userId: { type: String, ref: 'User', required: true }, // Cambiado a String porque el user._id es UUID
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date }
});

// Agregar índice para eliminar tokens expirados automáticamente
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
