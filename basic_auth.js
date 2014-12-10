module.exports = (process.env.BASIC_AUTH_USER && process.env.BASIC_AUTH_PASS)
  ? require('express').basicAuth(process.env.BASIC_AUTH_USER, process.env.BASIC_AUTH_PASS)
  : function (req, res, next) { next() }
;

