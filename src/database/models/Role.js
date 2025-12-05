const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Esquema de Roles
const roleSchema = new mongoose.Schema({
    _id: { type: String, default: uuidv4 },
    role: { type: String, required: true },  // Ejemplo: 'admin', 'recursos_humanos', 'usuario'
    userId: { type: String, ref: 'User', required: true },  // Relacionado con el UUID del usuario

});

// Asegurarse de que un usuario tenga solo un rol por empresa
roleSchema.index({ userId: 1, empresaId: 1 }, { unique: true });

module.exports = mongoose.model('Role', roleSchema);
