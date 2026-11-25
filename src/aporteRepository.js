// Componente repositorio de aportes: único que hace SQL sobre aportes
function createAporteRepository(db) {
  const selectByPlan = db.prepare(
    'SELECT id, plan_id, integrante, monto, fecha FROM aportes WHERE plan_id = ? ORDER BY id DESC'
  );

  const selectById = db.prepare(
    'SELECT id, plan_id, integrante, monto, fecha FROM aportes WHERE id = ?'
  );

  const insertAporte = db.prepare(
    'INSERT INTO aportes (plan_id, integrante, monto, fecha) VALUES (?, ?, ?, ?)'
  );

  function normalize(row) {
    return {
      id: Number(row.id),
      plan_id: Number(row.plan_id),
      integrante: row.integrante,
      monto: Number(row.monto),
      fecha: row.fecha
    };
  }

  return {
    findByPlan(planId) {
      return selectByPlan.all(planId).map(normalize);
    },

    create(planId, { integrante, monto, fecha }) {
      const result = insertAporte.run(planId, integrante.trim(), monto, fecha);
      return normalize(selectById.get(Number(result.lastInsertRowid)));
    }
  };
}

module.exports = { createAporteRepository };
