const OTP = require('../database/models/OTP');
const User = require('../database/models/User');
const nodemailer = require('nodemailer');

// Servicio para generar el OTP y enviarlo por correo electrónico
const generateOTP = async (email) => {
    // Verificar si el usuario existe con el email 
    const user = await User.findOne({ email});
    if (!user) {
        throw new Error('Usuario no encontrado .');
    }

    // Eliminar cualquier OTP existente para el usuario
    await OTP.deleteMany({ userId: user._id });

    // Generar OTP de 6 dígitos
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Establecer la fecha de expiración (10 minutos)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Crear el nuevo OTP
    await OTP.create({
        otpCode,
        userId: user._id,
        expiresAt
    });

    // Enviar OTP por correo
    await sendOTPByEmail(user.email, otpCode);

    return { message: 'OTP enviado al correo electrónico.' };
};


// Servicio para verificar OTP sin cambiar la contraseña
const verifyOTP = async (email, otpCode) => {
    try {
        // Validar entrada
        if (!email ||  !otpCode) {
            throw new Error('Faltan datos requeridos: email o otpCode.');
        }

        // Buscar al usuario por email 
        const user = await User.findOne({ email,  });
        if (!user) {
            throw new Error('Usuario no encontrado .');
        }

        // Buscar el OTP correspondiente en la base de datos
        const otp = await OTP.findOne({ otpCode, userId: user._id, isUsed: false });
        if (!otp) {
            throw new Error('OTP inválido o ya utilizado.');
        }

        // Verificar si el OTP ha expirado
        if (otp.expiresAt < new Date()) {
            throw new Error('OTP expirado.');
        }

        // Marcar el OTP como utilizado
        otp.isUsed = true;
        await otp.save();

        return {
            message: 'OTP verificado correctamente.',
            isValidOTP: true,
        };
    } catch (error) {
        console.error('Error en verifyOTP:', error.message);
        throw error; // Propagar el error al controlador
    }
};

// Servicio para verificar OTP sin cambiar la contraseña
const verifyOTPOnly = async (email, otpCode) => {
    try {
        // Validar entrada
        if (!email ||  !otpCode) {
            throw new Error('Faltan datos requeridos: email o otpCode.');
        }

        // Buscar al usuario por email 
        const user = await User.findOne({ email,  });
        if (!user) {
            throw new Error('Usuario no encontrado .');
        }

        // Buscar el OTP correspondiente en la base de datos
        const otp = await OTP.findOne({ otpCode, userId: user._id, isUsed: false });
        if (!otp) {
            throw new Error('OTP inválido o ya utilizado.');
        }

        // Verificar si el OTP ha expirado
        if (otp.expiresAt < new Date()) {
            throw new Error('OTP expirado.');
        }

        return {
            message: 'OTP verificado correctamente.',
            isValidOTP: true,
        };
    } catch (error) {
        console.error('Error en verifyOTP:', error.message);
        throw error; // Propagar el error al controlador
    }
};


// Servicio para verificar OTP y cambiar la contraseña
const changePasswordWithOTP = async (email, otpCode, newPassword) => {
    // Verificar si el OTP es válido
    await verifyOTP(email, otpCode);

    // Buscar al usuario para cambiar la contraseña
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Usuario no encontrado.');
    }

    // Cambiar la contraseña del usuario
    user.password = newPassword;  // El pre-hook del esquema se encargará de hashearla
    await user.save();  // Guardar la nueva contraseña (bcrypt se encargará del hashing automáticamente)

    return { message: 'Contraseña cambiada correctamente.' };
};

const sendOTPByEmail = async (email, otpCode) => {

    const loginURL = `https://puntos.mkapp.com.ar/auth/recovery?email=${email}&otp=${otpCode}`
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true, // Usar SSL
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    // Plantilla HTML con reemplazo dinámico
    const htmlTemplate = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Tu código de verificación</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333333;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .header {
                    background-color: #ec4899;
                    color: #ffffff;
                    text-align: center;
                    padding: 20px;
                }
                .content {
                    padding: 30px;
                    text-align: center;
                }
                .otp-code {
                    font-size: 32px;
                    font-weight: bold;
                    color: #ec4899;
                    letter-spacing: 5px;
                    margin: 20px 0;
                }
                .button {
                    display: inline-block;
                    background-color: #ec4899;
                    color: #ffffff;
                    text-decoration: none;
                    padding: 12px 24px;
                    border-radius: 4px;
                    font-weight: bold;
                    margin-top: 20px;
                }
                .footer {
                    background-color: #f9fafb;
                    text-align: center;
                    padding: 20px;
                    font-size: 12px;
                    color: #6b7280;
                }
                @media only screen and (max-width: 600px) {
                    .container {
                        width: 100%;
                        margin: 0;
                        border-radius: 0;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Tu código de verificación</h1>
                </div>
                <div class="content">
                    <p>Has solicitado un código de verificación para acceder a tu cuenta. Utiliza el siguiente código OTP:</p>
                    <div class="otp-code">${otpCode}</div>
                    <p>Este código expirará en 5 minutos. Si no has solicitado este código, por favor ignora este correo.</p>
                    <a href="${loginURL}" class="button">Restablecer contraseña</a>
                </div>
                <div class="footer">
                    <p>Este es un correo electrónico automático, por favor no respondas a este mensaje.</p>
                    <p>&copy; 2024 Sistema de Puntos y Descuentos. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const mailOptions = {
        from: process.env.SMTP_USERNAME,
        to: email,
        subject: 'Recuperación de contraseña - OTP',
        html: htmlTemplate, // Plantilla HTML aquí
    };

    // Envía el correo
    await transporter.sendMail(mailOptions);
};

module.exports = {
    generateOTP,
    verifyOTP,
    verifyOTPOnly,
    changePasswordWithOTP
};
