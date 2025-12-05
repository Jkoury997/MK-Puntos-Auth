const mongoose = require('mongoose');

const trustDeviceSchema = new mongoose.Schema({
    userId: { type: String, required: true, ref:"User" },
    fingerprint: { type: String, required: true },
    trusted: { type: Boolean, default: true }
});

module.exports = mongoose.model('TrustDevice', trustDeviceSchema);
