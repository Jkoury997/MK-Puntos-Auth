const { getEmpresaById } = require('../services/empresaService');

// Cargar usuario y contraseña desde .env
const API_JINX = process.env.API_JINX;
const EMAIL_FICHADA = process.env.EMAIL_FICHADA;
const PASSWORD_FICHADA = process.env.PASSWORD_FICHADA;

let externalAuthToken = null; // Almacena el token actual
let tokenExpirationTime = null; // Almacena el tiempo de expiración del token

const authenticateInExternalApi = async (req, res, next) => {
  try {
    const  empresaId  = req.body.empresa;

    if (!empresaId) {
      return res.status(400).json({ message: 'Falta el campo empresaId en la solicitud.' });
    }

    // Verificar si ya tenemos un token válido en memoria
    const currentTime = Date.now();
    if (externalAuthToken && tokenExpirationTime && currentTime < tokenExpirationTime) {
      // Si el token aún es válido, se usa directamente
      console.log('Usando token almacenado en memoria');
      req.authToken = externalAuthToken;
      return next();
    }

    // Si no hay token o ha expirado, proceder con la autenticación externa
    const empresa = await getEmpresaById(empresaId);
    if (!empresa) {
      return res.status(404).json({ message: 'No se encontró el idSistema para la empresa proporcionada.' });
    }

    const idSistema = empresa.idSistema;

    // Realizar login en la API externa
    const responseLogin = await fetch(`${API_JINX}/api/Login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Usuario: EMAIL_FICHADA,
        Password: PASSWORD_FICHADA,
      }),
    });

    if (!responseLogin.ok) {
      return res.status(500).json({ message: 'Error autenticando en la API externa (Login).' });
    }

    const dataLogin = await responseLogin.json();

    // Verificar si se recibió correctamente la AccessKey
    if (!dataLogin.AccessKey) {
      return res.status(500).json({ message: 'No se recibió la AccessKey en la respuesta de la API de Login.' });
    }

    // Solicitar acceso para la empresa
    const responseUserAccess = await fetch(`${API_JINX}/api/UserAccess`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        AccessKey: dataLogin.AccessKey,
        Empresa: idSistema,
      }),
    });

    if (!responseUserAccess.ok) {
      return res.status(500).json({ message: 'Error autenticando en la API externa (UserAccess).' });
    }

    const dataUserAccess = await responseUserAccess.json();
    console.log('Usando token almacenado  fuera de memoria');
    // Guardar el token de autenticación en memoria
    externalAuthToken = dataUserAccess.Token;
    tokenExpirationTime = currentTime + (5 * 60 * 60 * 1000); // Guardar la hora de expiración (5 horas)
    
    // Asignar el token al request
    req.externalAuthToken = externalAuthToken;

    next(); // Pasar al siguiente middleware o controlador
  } catch (error) {
    console.error('Error en el middleware de autenticación:', error.message);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = authenticateInExternalApi;
