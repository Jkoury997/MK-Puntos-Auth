const express = require('express');
const connectDB = require('./database/db');
const mainRoute = require('./routes/mainRoute');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();
const { errorHandler } = require('./middlewares/errorMiddleware');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());
// ⚠️ Lo ideal es poner el errorHandler al final, después de las rutas

// 🩺 Endpoint de health
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];

  const isDbUp = dbState === 1;

  res.status(isDbUp ? 200 : 500).json({
    status: isDbUp ? 'ok' : 'error',
    db: states[dbState] || 'unknown',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Conectar a MongoDB y luego iniciar el servidor
connectDB()
  .then(() => {
    app.use('/api', mainRoute);

    // 👉 ahora sí, el error handler al final
    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  });
