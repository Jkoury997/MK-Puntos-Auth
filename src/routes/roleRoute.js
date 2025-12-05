const express = require('express');
const roleController = require('../controllers/roleController');

const router = express.Router();

// Asignar o actualizar rol a un usuario en una empresa
router.post('/assign', roleController.assignRole);

// Obtener roles por userId
router.get('/user/:userId', roleController.getRolesByUserId);


module.exports = router;
