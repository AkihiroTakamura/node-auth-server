// usage:
// var logger = require('<path to logger>/logger');
// logger.<access or system or error>.<trace/debug/info/warn/error/fatal>({})

var config = require('config');
var log4js = require('log4js');

log4js.configure(config.log4js.configure);

var logger = {
    system: log4js.getLogger('system'),
    access: log4js.getLogger('access'),
    error: log4js.getLogger('error')
}

for (key in logger) {
    logger[key].setLevel(config.log4js.level);
}

// add express connect log
logger.express = log4js.connectLogger(log4js.getLogger('access'), { level: log4js.levels.INFO});

module.exports = logger;
