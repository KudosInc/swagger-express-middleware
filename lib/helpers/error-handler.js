"use strict";

const ono = require("ono");

function errorHandler (options) {
  return ono({
    status: options.status,
    json: {
      message: options.message,
      errors: {
        code: options.errorCode,
        errors: options.errors,
        path: options.path,
      },
    },
  }, options.message);
}

module.exports = errorHandler;
