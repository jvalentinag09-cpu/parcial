const { test, before, after } = require('node:test');
const assert = require('node:assert');

const { createDatabase } = require('../src/database');
const { createPlanRepository } = require('../src/planRepository');
const { createAporteRepository } = require('../src/aporteRepository');
const { createApp } = require('../src/app');

let server;
let url;

before(() => {
  console.log = () => {}; // silencio durante pruebas
  const db = createDatabase(':memory:');
  const app = createApp({
    planRepository: createPlanRepository(db),
    aporteRepository: createAporteRepository(db)
  });
  server = app.listen(0);
  url = `http://localhost:${server.address().port}`;
});

after(() => server.close());

async function call(method, path, body) {
  const res = await fetch(`${url}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  return { status: res.status, body: await res.json() };
}

function nuevoPlan(overrides = {}) {
  return call('POST', '/v1/planes', {
    nombre: 'Viaje familiar',
    meta: 1000000,
    fecha_limite: '31/12/2026',
    ...overrides
  });
}

test('crea un plan válido', async () => {
  const res = await nuevoPlan();
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.data.nombre, 'Viaje familiar');
  assert.strictEqual(res.body.data.total_ahorrado, 0);
  assert.strictEqual(res.body.data.monto_restante, 1000000);
});

test('rechaza un plan con datos inválidos', async () => {
  assert.strictEqual((await nuevoPlan({ nombre: '' })).status, 400);
  assert.strictEqual((await nuevoPlan({ meta: -10 })).status, 400);
  assert.strictEqual((await nuevoPlan({ fecha_limite: '' })).status, 400);
});

test('lista los planes', async () => {
  await nuevoPlan();
  const res = await call('GET', '/v1/planes');
  assert.ok(res.body.data.length >= 1);
});

test('registra un aporte y actualiza el total', async () => {
  const plan = (await nuevoPlan()).body.data;

  const res = await call('POST', `/v1/planes/${plan.id}/aportes`, {
    integrante: 'Jorge',
    monto: 200000,
    fecha: '15/05/2026'
  });
  assert.strictEqual(res.status, 201);

  const detalle = (await call('GET', `/v1/planes/${plan.id}`)).body.data;
  assert.strictEqual(detalle.total_ahorrado, 200000);
  assert.strictEqual(detalle.monto_restante, 800000);
});

test('rechaza un aporte que supere lo que falta', async () => {
  const plan = (await nuevoPlan({ meta: 1000 })).body.data;
  const res = await call('POST', `/v1/planes/${plan.id}/aportes`, {
    integrante: 'Ana', monto: 5000, fecha: '01/01/2026'
  });
  assert.strictEqual(res.status, 400);
});

test('borra un plan y responde 404', async () => {
  const plan = (await nuevoPlan()).body.data;
  assert.strictEqual((await call('DELETE', `/v1/planes/${plan.id}`)).status, 200);
  assert.strictEqual((await call('GET', `/v1/planes/${plan.id}`)).status, 404);
});
