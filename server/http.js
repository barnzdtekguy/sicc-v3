class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function sendData(res, data, status = 200) {
  return res.status(status).json({ data });
}

module.exports = { HttpError, asyncRoute, sendData };
