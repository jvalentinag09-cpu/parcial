// Componente repositorio de planes: único que hace SQL sobre plans
function createPlanRepository(db) {
  const selectAll = db.prepare(`
    SELECT p.id, p.nombre, p.meta, p.fecha_limite, p.created_at,
           COALESCE((SELECT SUM(monto) FROM aportes WHERE plan_id = p.id), 0) AS total_ahorrado
    FROM plans p
    ORDER BY p.id DESC
  `);

  const selectById = db.prepare(`
    SELECT p.id, p.nombre, p.meta, p.fecha_limite, p.created_at,
           COALESCE((SELECT SUM(monto) FROM aportes WHERE plan_id = p.id), 0) AS total_ahorrado
    FROM plans p
    WHERE p.id = ?
  `);

  const insertPlan = db.prepare(
    'INSERT INTO plans (nombre, meta, fecha_limite, created_at) VALUES (?, ?, ?, ?)'
  );

  const deletePlan = db.prepare('DELETE FROM plans WHERE id = ?');

  // Convierte las filas de SQLite al formato que consume la app
  function normalize(row) {
    const meta = Number(row.meta);
    const totalAhorrado = Number(row.total_ahorrado);
    return {
      id: Number(row.id),
      nombre: row.nombre,
      meta,
      fecha_limite: row.fecha_limite,
      created_at: row.created_at,
      total_ahorrado: totalAhorrado,
      monto_restante: Math.max(meta - totalAhorrado, 0)
    };
  }

  return {
    findAll() {
      return selectAll.all().map(normalize);
    },

    findById(id) {
      const row = selectById.get(id);
      return row ? normalize(row) : null;
    },

    create({ nombre, meta, fecha_limite }) {
      const result = insertPlan.run(
        nombre.trim(),
        meta,
        fecha_limite,
        new Date().toISOString()
      );
      return this.findById(Number(result.lastInsertRowid));
    },

    remove(id) {
      return Number(deletePlan.run(id).changes) > 0;
    }
  };
}

module.exports = { createPlanRepository };
