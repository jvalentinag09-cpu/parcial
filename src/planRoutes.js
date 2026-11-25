const express = require('express');
const { validateId, validatePlan } = require('./validators');
const { ok, badRequest, notFound } = require('./responses');

// Componente de rutas de planes
function createPlanRoutes(planRepository) {
  const router = express.Router();

  // GET /v1/planes - lista de planes (pantalla Home)
  router.get('/', (req, res) => {
    ok(res, 'fetch ok', planRepository.findAll());
  });

  // GET /v1/planes/:id - un plan por id
  router.get('/:id', (req, res) => {
    const error = validateId(req.params.id);
    if (error) return badRequest(res, error);

    const plan = planRepository.findById(Number(req.params.id));
    if (!plan) return notFound(res, `no existe el plan ${req.params.id}`);

    ok(res, 'fetch ok', plan);
  });

  // POST /v1/planes - crea un plan
  // Body: { "nombre": "Viaje", "meta": 5000000, "fecha_limite": "31/12/2026" }
  router.post('/', (req, res) => {
    const error = validatePlan(req.body);
    if (error) return badRequest(res, error);

    ok(res, 'create ok', planRepository.create(req.body), 201);
  });

  // DELETE /v1/planes/:id - borra el plan con sus aportes
  router.delete('/:id', (req, res) => {
    const error = validateId(req.params.id);
    if (error) return badRequest(res, error);

    if (!planRepository.remove(Number(req.params.id))) {
      return notFound(res, `no existe el plan ${req.params.id}`);
    }
    ok(res, 'delete ok', null);
  });

  return router;
}

module.exports = { createPlanRoutes };
