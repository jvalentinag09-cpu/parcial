// Formato común de respuestas: { status, message, data }

function ok(res, message, data, code = 200) {
  return res.status(code).send({ status: 'ok', message, data });
}

function badRequest(res, message) {
  return res.status(400).send({ status: 'error', message });
}

function notFound(res, message) {
  return res.status(404).send({ status: 'error', message });
}

module.exports = { ok, badRequest, notFound };
