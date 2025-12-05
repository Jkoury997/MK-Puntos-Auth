const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_ACCESS_SECRET; // Cambia esto por tu clave secreta

/**
 * Middleware para verificar el token y los permisos
 * @param {Array} allowedRoles - Lista de roles permitidos para esta ruta
 */
const verifyTokenWithRoles = (allowedRoles) => {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token no proporcionado o inválido' });
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verificar el token
      const decoded = jwt.verify(token, SECRET_KEY);

      // Adjuntar los datos del usuario al request
      req.user = {
        userId: decoded.userId,
        role: decoded.role,
      };

      // Verificar si el rol del usuario está permitido
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: 'No tienes permiso para acceder a esta ruta' });
      }

      // Continuar al siguiente middleware o controlador
      next();
    } catch (error) {
      console.error('Error al verificar el token:', error.message);
      return res.status(401).json({ message: 'Token inválido o expirado' });
    }
  };
};

module.exports = verifyTokenWithRoles;
