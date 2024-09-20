class CustomError extends Error {
  constructor(statusCode, message) {
    const ERROR_MESSAGES = {
      400: "Bad request",
      401: "Unauthorized",
      403: "Forbidden",
      404: "Page not found",
      422: "unprocessable entity",
      423: "transport error",
      500: "Internal server error",
    };

    let newMsg;
    if (typeof message == "string") {
      newMsg = message;
    } else {
      newMsg = JSON.stringify(message);
    }

    let msg = newMsg ?? ERROR_MESSAGES[statusCode] ?? "Something went wrong";
    super(msg);
    this.statusCode = statusCode ?? 500;
    Error.captureStackTrace(this, this.constructor);
  }
}

function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  if (message && isValidJSON(message)) {
    message = JSON.parse(message);
  }

  return res.status(statusCode).json({ error: message });
}

module.exports = { CustomError, errorHandler };
