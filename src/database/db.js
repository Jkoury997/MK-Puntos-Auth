const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.URI_MONGODB, {
      useNewUrlParser: true, // Usa el nuevo analizador de URL
      useUnifiedTopology: true, // Usa el nuevo motor de manejo de topología
    });
    console.log('Conectado a MongoDB');
  } catch (err) {
    console.error('Error conectándose a MongoDB', err);
    throw err;
  }
};

module.exports = connectDB;
