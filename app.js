const config = require('./src/config');
const { createDatabase } = require('./src/database');
const { createPlanRepository } = require('./src/planRepository');
const { createAporteRepository } = require('./src/aporteRepository');
const { createApp } = require('./src/app');

// Se conectan los componentes: base de datos -> repositorios -> app
const db = createDatabase(config.dbPath);
const planRepository = createPlanRepository(db);
const aporteRepository = createAporteRepository(db);
const app = createApp({ planRepository, aporteRepository });

app.listen(config.port, () => {
  console.log(`API escuchando en http://localhost:${config.port}`);
});
