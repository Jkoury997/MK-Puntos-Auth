const User = require('../database/models/User');

// Obtener todos los usuarios sin la contraseña
const getAllUsers = async () => {
    // Devuelve todos los usuarios, excluyendo el campo "password"
    return await User.find().select('-password');
};

// Obtener un usuario por ID sin la contraseña
const getUserById = async (userId) => {
    // Busca un usuario por su ID, excluye el campo "password" y usa "populate" para traer los datos de la  relacionada
    return await User.findById(userId)
        .select('-password')         // Excluir el campo password
       // Traer los datos de la  relacionada
};

// Obtener usuario por email sin la contraseña
const getUserByEmail = async (email) => {
    // Busca un usuario por su email, excluyendo el campo "password"
    return await User.find({ email }).select('-password');
};


// Modificar un usuario por ID (excluyendo campos sensibles)
const updateUser = async (userId, userData) => {
    // Define los campos que deben ser excluidos para evitar su modificación
    const fieldsToExclude = ['password', '_id', 'failedLoginAttempts', 'lockUntil'];
    fieldsToExclude.forEach(field => delete userData[field]);

    // Actualiza el usuario con los datos proporcionados, excluyendo el campo "password" en la respuesta
    return await User.findByIdAndUpdate(userId, userData, { new: true }).select('-password');
};

// Eliminar un usuario por ID
const deleteUser = async (userId) => {
    // Elimina un usuario por su ID
    return await User.findByIdAndDelete(userId);
};

// Verificar si un userId existe
const checkUserExists = async (userId) => {
    // Busca un usuario por su ID y devuelve true si existe o false si no
    const user = await User.findById(userId);
    return !!user;
};

// Exporta todas las funciones para ser utilizadas en otros módulos
module.exports = {
    getAllUsers,
    getUserById,
    
    getUserByEmail,
    updateUser,
    deleteUser,
    checkUserExists,
    
};
