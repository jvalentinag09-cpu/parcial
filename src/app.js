const express = require('express');
const { createPlanRoutes } = require('./planRoutes');
const { createAporteRoutes } = require('./aporteRoutes');

// Arma la aplicación con los repositorios que se le pasen
function createApp({ planRepository, aporteRepository }) {
  const app = express();

  app.use(express.json());

  // Log de cada petición
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });

  // Health check
  app.get('/', (req, res) => {
    res.send({ status: 'ok', message: 'running' });
  });

  app.use('/v1/planes/:planId/aportes', createAporteRoutes(planRepository, aporteRepository));
  app.use('/v1/planes', createPlanRoutes(planRepository));

  // Rutas no encontradas
  app.use((req, res) => {
    res.status(404).send({ status: 'error', message: 'ruta no encontrada' });
  });

  // JSON mal formado u otro error
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).send({ status: 'error', message: 'el body no es un JSON válido' });
    }
    console.error(err);
    res.status(500).send({ status: 'error', message: 'error interno del servidor' });
  });

  return app;
}

module.exports = { createApp };
