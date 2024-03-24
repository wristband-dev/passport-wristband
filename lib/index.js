// Load modules.
const Strategy = require('./strategy')
, WristbandError = require('./errors/wristbandError');

// Expose Strategy.
exports = module.exports = Strategy;

// Exports.
exports.Strategy = Strategy;
exports.WristbandError = WristbandError;

