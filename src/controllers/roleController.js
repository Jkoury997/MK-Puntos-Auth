const roleService = require('../services/roleService');

// Asignar o actualizar rol de un usuario en una empresa
const assignRole = async (req, res) => {
    try {
        const { userId, role } = req.body;
        const updatedRole = await roleService.assignOrUpdateRoleForUserInEmpresa(userId, empresaId, role);
        res.status(200).json({ success: true, role: updatedRole });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Obtener roles por userId
const getRolesByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const roles = await roleService.getRolesByUserId(userId);
        res.status(200).json({ success: true, roles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    assignRole,
    getRolesByUserId,

};