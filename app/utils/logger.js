import winston from 'winston';

const { combine, timestamp, json, cli } = winston.format;

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: process.env.NODE_ENV == "production" ? 
            combine(timestamp(), json()) :
            cli(),
    transports: [
        new winston.transports.Console(),
    ]
})

export default logger;

// log levels
// {
//     error: 0,
//     warn: 1,
//     info: 2,
//     http: 3,
//     verbose: 4,
//     debug: 5,
//     silly: 6
//   }
  