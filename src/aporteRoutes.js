const express = require('express');
const { validateId, validateAporte } = require('./validators');
const { ok, badRequest, notFound } = require('./responses');

// Componente de rutas de aportes. Se monta en /v1/planes/:planId/aportes
function createAporteRoutes(planRepository, aporteRepository) {
  const router = express.Router({ mergeParams: true });

  // Antes de cualquier ruta, valida que el plan exista
  router.use((req, res, next) => {
    const error = validateId(req.params.planId, 'planId');
    if (error) return badRequest(res, error);

    const plan = planRepository.findById(Number(req.params.planId));
    if (!plan) return notFound(res, `no existe el plan ${req.params.planId}`);

    req.plan = plan;
    next();
  });

  // GET /v1/planes/:planId/aportes - historial de aportes del plan
  router.get('/', (req, res) => {
    ok(res, 'fetch ok', aporteRepository.findByPlan(req.plan.id));
  });

  // POST /v1/planes/:planId/aportes - registra un aporte
  // Body: { "integrante": "Jorge", "monto": 200000, "fecha": "15/05/2026" }
  router.post('/', (req, res) => {
    const error = validateAporte(req.body, req.plan.monto_restante);
    if (error) return badRequest(res, error);

    ok(res, 'aporte ok', aporteRepository.create(req.plan.id, req.body), 201);
  });

  return router;
}

module.exports = { createAporteRoutes };
