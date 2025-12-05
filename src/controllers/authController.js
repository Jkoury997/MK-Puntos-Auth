const authService = require('../services/authService');
const jwtService = require('../services/jwtService');

// Registro de usuario
const register = async (req, res) => {
    try {
        const userData = req.body;
        // Intentar registrar el usuario
        const newUser = await authService.registerUser(userData);
        res.status(201).json({ message: 'Usuario registrado exitosamente', user: newUser });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Login de usuario
const login = async (req, res) => {
    try {
        const { email, password} = req.body;

        // Verificar que todos los campos estén presentes
        if (!email || !password) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios: email, contraseña' });
        }

        // Llamar al servicio de login y obtener los tokens y el usuario
        const { accessToken, refreshToken, user } = await authService.loginUser(email, password);

        // Excluir el password del objeto user antes de enviarlo
        const { password: _, ...userWithoutPassword } = user._doc;

        // Enviar respuesta con los tokens y la información del usuario
        res.status(200).json({
            message: 'Login exitoso',
            user: userWithoutPassword,
            accessToken,
            refreshToken
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Refrescar el Access Token usando el Refresh Token
const refreshAccessToken = async (req, res) => {
    const { refreshToken } = req.body;

    // Verificar que el Refresh Token esté presente
    if (!refreshToken) {
        return res.status(400).json({ message: 'El token de actualización es obligatorio.' });
    }

    try {
        // Llamar al servicio para refrescar el Access Token
        const newAccessToken = await authService.refreshAccessToken(refreshToken);

        // Enviar el nuevo Access Token al cliente
        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        res.status(403).json({ message: error.message });
    }
};

// Logout del usuario
const logout = async (req, res) => {
    const { refreshToken } = req.body;

    // Verificar que el Refresh Token esté presente
    if (!refreshToken) {
        return res.status(400).json({ message: 'El Refresh Token es obligatorio para cerrar sesión.' });
    }

    try {
        // Llamar al servicio para eliminar el Refresh Token de la base de datos
         await authService.logoutUser(refreshToken);

        res.status(200).json({ message: 'Sesión cerrada correctamente.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



module.exports = {
    register,
    login,
    refreshAccessToken,
    logout
};
