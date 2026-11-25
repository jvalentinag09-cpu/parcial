// Componente de validación: cada función devuelve un mensaje de error o null

function isPositiveNumber(value) {
  return typeof value === 'number' && !Number.isNaN(value) && value > 0;
}

function isNonEmptyText(value) {
  return typeof value === 'string' && value.trim() !== '';
}

// Para ids que llegan en la URL
function validateId(id, field = 'id') {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) {
    return `"${field}" debe ser un entero mayor que 0`;
  }
  return null;
}

// Body de crear plan: { nombre, meta, fecha_limite }
function validatePlan(body) {
  if (!body) return 'el body debe ser un JSON';

  const { nombre, meta, fecha_limite } = body;

  if (!isNonEmptyText(nombre)) {
    return '"nombre" es requerido y debe ser un texto';
  }
  if (!isPositiveNumber(meta)) {
    return '"meta" es requerida y debe ser un número mayor que 0';
  }
  if (!isNonEmptyText(fecha_limite)) {
    return '"fecha_limite" es requerida (formato dd/MM/yyyy)';
  }
  return null;
}

// Body de registrar aporte: { integrante, monto, fecha }
// montoRestante lo pasa la ruta para validar que no se pase
function validateAporte(body, montoRestante) {
  if (!body) return 'el body debe ser un JSON';

  const { integrante, monto, fecha } = body;

  if (!isNonEmptyText(integrante)) {
    return '"integrante" es requerido y debe ser un texto';
  }
  if (!isPositiveNumber(monto)) {
    return '"monto" es requerido y debe ser un número mayor que 0';
  }
  if (monto > montoRestante) {
    return `el monto supera lo que falta para la meta (${montoRestante})`;
  }
  if (!isNonEmptyText(fecha)) {
    return '"fecha" es requerida (formato dd/MM/yyyy)';
  }
  return null;
}

module.exports = { validateId, validatePlan, validateAporte };
