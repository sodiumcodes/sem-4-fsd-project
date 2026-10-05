const morgan = require('morgan');

// Standard format combined with custom logging
const requestLogger = morgan(':method :url :status :res[content-length] - :response-time ms');

module.exports = requestLogger;
