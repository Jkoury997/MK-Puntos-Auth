const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyTokenWithRoles = require('../middlewares/verifyTokenWithRoles');

// Obtener todos los usuarios
router.get('/', userController.getAllUsers);

// Obtener un usuario por ID
router.get('/:id', userController.getUserById);


// Obtener usuario por email
router.get('/email/:email', userController.getUserByEmail);

// Modificar un usuario por ID
router.put('/:id',verifyTokenWithRoles(['admin',"usuario"]), userController.updateUser);

// Eliminar un usuario por ID
router.delete('/:id',verifyTokenWithRoles(['admin']), userController.deleteUser);



module.exports = router;
