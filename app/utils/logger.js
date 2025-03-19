import winston from 'winston';

const { combine, timestamp, json, cli } = winston.format;

const safeFormat = winston.format((info) => {
    // Check if the info object contains an error with Zod-like structure
    if (info.name === "ZodError") {
      // Extract the relevant parts from Zod error
        return { ...info, message: "ZodError: " + JSON.stringify(info.errors, undefined, 2) };
    }

    return info;
});

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: process.env.NODE_ENV == "production" ? 
            combine(safeFormat(), timestamp(), json()) :
            combine(safeFormat(), cli()),
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
  