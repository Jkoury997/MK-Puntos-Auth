const Role = require('../database/models/Role');

// Obtener roles por userId
const getRolesByUserId = async (userId) => {
    const roles = await Role.findOne({ userId });
    return roles;  // Retorna todos los roles del usuario en diferentes 
};

// Asignar o actualizar el rol de un usuario en una 
const assignOrUpdateRoleForUser = async (userId, roleName) => {
    // Verificar si ya existe un rol para ese usuario en esa 
    const existingRole = await Role.findOne({ userId});

    if (existingRole) {
        // Si ya tiene un rol, lo actualizamos
        existingRole.role = roleName;
        await existingRole.save();
        return existingRole;
    }

    // Si no tiene un rol, creamos uno nuevo
    const role = new Role({ userId, role: roleName });
    await role.save();
    return role;
};

module.exports = {
    getRolesByUserId,
    assignOrUpdateRoleForUser
};