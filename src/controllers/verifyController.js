const userService = require('../services/userService');

// Controlador para verificar si un userId existe
const checkUserExists = async (req, res) => {
    try {
        const { id } = req.params;  // Extraer 'id' de los parámetros de la URL
        const userExists = await userService.checkUserExists(id);

        res.status(200).json({ exists: userExists });
    } catch (error) {
        res.status(500).json({ message: 'Error al verificar el userId' });
    }
}



module.exports = {
    checkUserExists,
}
