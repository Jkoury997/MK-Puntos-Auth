const recoveryService = require('../services/recoveryService');

// Generar OTP y enviarlo al correo electrónico del usuario
const generateOTP = async (req, res) => {
    try {
        const { email} = req.body;  // Se requiere email y empresaId
        const result = await recoveryService.generateOTP(email);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Verificar OTP sin cambiar la contraseña
const verifyOTP = async (req, res) => {
    try {
        const { email, otpCode } = req.body;  // Se requiere empresaId aquí también
        const result = await recoveryService.verifyOTP(email, otpCode);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Verificar OTP sin cambiar la contraseña
const verifyOTPOnly = async (req, res) => {
    try {
        const { email, otpCode } = req.body;  // Se requiere empresaId aquí también
        const result = await recoveryService.verifyOTPOnly(email, otpCode);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Verificar OTP y cambiar la contraseña
const changePasswordWithOTP = async (req, res) => {
    try {
        const { email, otpCode, newPassword } = req.body;  // Se requiere también empresaId aquí
        const result = await recoveryService.changePasswordWithOTP(email, otpCode, newPassword);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    generateOTP,
    verifyOTP,
    verifyOTPOnly ,
    changePasswordWithOTP
};
