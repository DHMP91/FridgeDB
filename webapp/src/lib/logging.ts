import pino from "pino";
import path from "path";

const logFilePath = path.join(".logs", "app.log");

// log levels: trace < debug < info < warn < error < fatal
const logger = pino(
  {
    level: "trace", // log levels: trace < debug < info < warn < error < fatal
    transport: {
      targets: [
        {
          target: "pino/file",
          options: { destination: logFilePath, mkdir: true }, // file path
          level: "trace",
        },
        {
          target: "pino-pretty", // also print to console
          level: "trace",
          options: { colorize: true },
        },
      ],
    },
  }
);

export default logger;