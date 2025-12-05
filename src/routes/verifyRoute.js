const express = require('express');
const { checkUserExists,checkEmpresaExists } = require('../controllers/verifyController');

const router = express.Router();

// Ruta para verificar si un userId existe 
//router.get('/:id', checkUserExists);


module.exports = router;
