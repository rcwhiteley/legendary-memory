'use strict';
const { createLogger, format, transports } = require('winston');
const fs = require('fs');
const { combine, timestamp, label, prettyPrint } = format;
const logDir = 'log';
// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}
const myFormat = format.printf(info => {
    return `${info.timestamp} ${info.level}: ${info.message}`;
});

const logger = createLogger({

    format: combine(

        timestamp({format:'HH:mm:ss'}),
        //format.align(),
        format.json(),
        //format.printf(info => `[${info.level}] ${info.timestamp} : ${info.message}`)
        //prettyPrint()
    ),
    //format: format.json(),
    //format: winston.format.json(),
    transports: [
        // colorize the output to the console
        new (transports.Console)({
            format: myFormat,
            colorize: true,
            level: 'debug'
        }),
        new (require('winston-daily-rotate-file'))({
            filename: `${logDir}/%DATE%-results.log`,
            datePattern: 'DD-MM-YYYY',
            prepend: true,
            level: 'debug'
        })
    ]
});
exports.debug = function(){
        logger.debug( Array.prototype.slice.call(arguments).join(" "));
};
exports.info =  function(){
        logger.info( Array.prototype.slice.call(arguments).join(" "));
};
exports.verbose = function(){
        logger.verbose( Array.prototype.slice.call(arguments).join(" "));
};
exports.warn = function(){
        logger.warn( Array.prototype.slice.call(arguments).join(" "));
};
exports.error =  function(){
        logger.error( Array.prototype.slice.call(arguments).join(" "));
};

exports.logger = logger;