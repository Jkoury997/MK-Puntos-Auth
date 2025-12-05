const User = require('../database/models/User');
const RefreshToken = require('../database/models/RefreshToken');
const roleService = require('../services/roleService');
const jwtService = require('../services/jwtService'); 
const bcrypt = require('bcryptjs');

// Registrar un nuevo usuario
const registerUser = async (userData) => {
    const { email, dni } = userData;

    try {
        // Verificar que los datos necesarios estén presentes
        if (!email || !dni) {
            throw new Error('Los campos email y dni son obligatorios.');
        }

        // Verificar si el email o dni ya existen
        const existingUser = await User.findOne({
            $or: [{ email }, { dni }]
        });

        if (existingUser) {
            throw new Error('Ya existe un usuario con ese email o dni.');
        }

        // Crear el nuevo usuario
        const newUser = new User(userData);
        await newUser.save();

        // Asignar el rol de "usuario" por defecto al registrarse
        await roleService.assignOrUpdateRoleForUser(newUser._id, 'usuario');

        return newUser;
    } catch (error) {
        // Manejo de errores
        console.error('Error al registrar el usuario:', error.message);
        throw new Error(`Error al registrar el usuario: ${error.message}`);
    }
};


// Servicio de login
const loginUser = async (email, password) => {
    try {
        // Verificar que los datos necesarios estén presentes
        if (!email || !password) {
            throw new Error('Los campos email y contraseña son obligatorios.');
        }

        // Buscar el usuario por email
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Credenciales inválidas.');
        }

        // Verificar la contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Credenciales inválidas.');
        }

        // Obtener el rol del usuario
        const userRole = await roleService.getRolesByUserId(user._id);
        if (!userRole) {
            throw new Error('El usuario no tiene un rol asignado.');
        }

        // Generar y guardar el Refresh Token
        const refreshToken = await createAndSaveRefreshToken(user, userRole.role);

        // Generar el Access Token
        const accessToken = await refreshAccessToken(refreshToken);

        // Retornar los tokens y datos del usuario
        return { accessToken, refreshToken, user };
    } catch (error) {
        // Manejo de errores
        console.error('Error en el login:', error.message);
        throw new Error(`Error en el login: ${error.message}`);
    }
};

// Crear y guardar el Refresh Token en la base de datos
const createAndSaveRefreshToken = async (user,role) => {
    const refreshToken = jwtService.generateRefreshToken(user,role);

    // Guardar el Refresh Token en la base de datos
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Token expira en 7 días

    // Asegurarse de que el userId sea un ObjectId
    await RefreshToken.create({
        token: refreshToken,
        userId: user._id,  // Esto debe ser ObjectId y no un string
        expiresAt
    });

    return refreshToken;
};

// Servicio para refrescar el Access Token
const refreshAccessToken = async (refreshToken) => {
    // Verificar si el Refresh Token existe en la base de datos
    const storedToken = await RefreshToken.findOne({ token: refreshToken });

    if (!storedToken) {
        throw new Error('El token de actualización es inválido o ha sido revocado.');
    }

    // Verificar el Refresh Token usando JWT
    const decoded = jwtService.verifyRefreshToken(refreshToken);

    // Extraer la información necesaria del token decodificado
    const { userId,role } = decoded;


    // Generar un nuevo Access Token
    const newAccessToken = jwtService.generateAccessToken(userId, role);

    return newAccessToken;
};

// Servicio para el logout del usuario
const logoutUser = async (refreshToken) => {
    try {
        // Verificar si el Refresh Token existe antes de intentar eliminarlo
        const token = await RefreshToken.findOne({ token: refreshToken });
        
        if (!token) {
            console.log('Token no encontrado:', refreshToken);  // Depuración: Verificar si el token no se encuentra
            throw new Error('El token de actualización no es válido o ya ha sido eliminado.');
        }

        // Eliminar el token si se encuentra
        await RefreshToken.findOneAndDelete({ token: refreshToken });
        console.log('Token eliminado:', refreshToken);  // Depuración: Confirmar que el token ha sido eliminado

        return true; // Token eliminado correctamente
    } catch (error) {
        console.log('Error al eliminar el token:', error);  // Depuración: Mostrar el error
        throw new Error(`Error al realizar el logout: ${error.message}`);
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    createAndSaveRefreshToken,
    refreshAccessToken
};
