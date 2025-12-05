const ApiKey = require('../database/models/ApiKey');

async function createApiKey(name, permissions = []) {
    const apiKey = ApiKey.generateApiKey(); // Generar una clave única
    const newApiKey = new ApiKey({
        apiKey,
        name,
        permissions,
    });
    await newApiKey.save();
    console.log(`API Key creada: ${apiKey}`);
    return newApiKey;
}

// Crear una nueva API key
createApiKey('Servicio A', ['read', 'write']).catch(console.error);
