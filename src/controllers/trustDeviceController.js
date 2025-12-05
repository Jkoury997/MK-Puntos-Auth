const trustDeviceService = require('../services/trustDeviceService');
const otpService = require('../services/recoveryService');
const userService = require('../services/userService');

// Registrar un dispositivo de confianza
const registerTrustedDevice = async (req, res) => {
    try {
        const { userId, fingerprint } = req.body;

        // Registrar el dispositivo como confiable
        const trustedDevice = await trustDeviceService.registerTrustedDevice(userId, fingerprint);
        res.status(200).json({ message: 'Dispositivo registrado como de confianza.', trustedDevice });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar el dispositivo de confianza.', error: error.message });
    }
};

// Verificar si un dispositivo es de confianza
const verifyTrustedDevice = async (req, res) => {
    try {
        const { userId, fingerprint } = req.body;

        // Verificar si el dispositivo es de confianza
        const isTrusted = await trustDeviceService.isTrustedDevice(userId, fingerprint);
        if (isTrusted) {
            res.status(200).json({ message: 'El dispositivo es de confianza.',isTrusted:true });
        } else {
            res.status(403).json({ message: 'Dispositivo no reconocido.',isTrusted:false });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al verificar el dispositivo de confianza.', error: error.message });
    }
};

// Verificar si un dispositivo es de confianza
const verifyTrustedDeviceExtra = async (req, res) => {
    try {
        const { userId, localFingerprint, newFingerprint } = req.body;

        // Validar entrada
        if (!userId || !localFingerprint || !newFingerprint) {
            return res.status(400).json({ 
                message: 'Faltan datos requeridos (userId, localFingerprint o newFingerprint).' 
            });
        }

        // Verificar si el dispositivo es de confianza
        const isTrusted = await trustDeviceService.isTrustedDevice(userId, localFingerprint);
        
        if (isTrusted) {
            try {
                const updatedDevice = await trustDeviceService.updateTrustedDevice(userId, newFingerprint);
                return res.status(200).json({ 
                    message: 'El dispositivo era de confianza y se actualizó correctamente.', 
                    isTrusted: true, 
                    updatedDevice 
                });
            } catch (error) {
                return res.status(500).json({ 
                    message: 'El dispositivo era de confianza, pero ocurrió un error al actualizarlo.', 
                    error: error.message 
                });
            }
        } else {
            return res.status(403).json({ 
                message: 'El dispositivo nunca fue de confianza.', 
                isTrusted: false 
            });
        }
    } catch (error) {
        return res.status(500).json({ 
            message: 'Error al verificar el dispositivo de confianza.', 
            error: error.message 
        });
    }
};

// Actualizar un dispositivo de confianza mediante OTP
const updateDeviceWithOTP = async (req, res) => {
    try {
        const { email, fingerprint, otpCode } = req.body;

        // Validar entrada
        if (!email || !fingerprint || !otpCode) {
            return res.status(400).json({ message: 'Faltan datos requeridos: email, fingerprint o otpCode.' });
        }

        // Verificar si el OTP es válido
        const { isValidOTP } = await otpService.verifyOTP(email, otpCode);
        if (!isValidOTP) {
            return res.status(403).json({ message: 'OTP inválido o expirado.' });
        }

        // Buscar al usuario
        const user = await userService.getUserByEmailAndEmpresa(email);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado para el email y empresa proporcionados.' });
        }

        // Intentar actualizar el dispositivo de confianza
        const updatedDevice = await trustDeviceService.updateTrustedDevice(user._id, fingerprint);
        if (!updatedDevice) {
            return res.status(404).json({ message: 'No se encontró un dispositivo de confianza para actualizar.' });
        }

        // Respuesta exitosa
        return res.status(200).json({
            message: 'Dispositivo de confianza actualizado con éxito.',
            updatedDevice,
        });
    } catch (error) {
        console.error('Error en updateDeviceWithOTP:', error.message);
        return res.status(500).json({
            message: 'Error interno al actualizar el dispositivo de confianza.',
            error: error.message,
        });
    }
};


module.exports = {
    registerTrustedDevice,
    verifyTrustedDevice,
    updateDeviceWithOTP,
    verifyTrustedDeviceExtra
};
