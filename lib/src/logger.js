"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.DatabaseLogger = exports.FileLogger = exports.ConsoleLogger = void 0;
const helpers_1 = require("./helpers");
const fs_1 = __importDefault(require("fs"));
const os_1 = require("os");
const LOG_COLORS = {
    danger: "\u001b[31m",
    success: "\u001b[32m",
    warning: "\u001b[33m",
    primary: "\u001b[34m",
    info: "\u001b[36m",
    secondary: "\u001b[30;1m",
    light: "\u001b[37m",
    dark: "\u001b[30m"
};
class ConsoleLogger {
    constructor() {
        this.LOG_COLORS = {
            fatal: "\u001b[7m" + LOG_COLORS.danger,
            error: LOG_COLORS.danger,
            warn: LOG_COLORS.warning,
            info: LOG_COLORS.success,
            debug: LOG_COLORS.info,
            trace: LOG_COLORS.light,
            audit: LOG_COLORS.secondary,
        };
    }
    log(msg, level, date) {
        return new Promise((resolve) => {
            resolve(console.log(this.LOG_COLORS[level], `[${date}] | ${level.toUpperCase().padEnd(5, " ")} | ${msg}`, "\x1b[0m"));
        });
    }
    clear() {
        console.clear();
    }
}
exports.ConsoleLogger = ConsoleLogger;
class FileLogger {
    constructor(folder, name, dateFormat = "YYYY-MM-DD") {
        this.folder = folder;
        this.name = name;
        this.dateFormat = dateFormat;
        this.fileName = `${this.name.toLowerCase()}-${(0, helpers_1.today)()}.log`;
    }
    log(msg, level, date) {
        this.init();
        return new Promise((resolve) => {
            resolve(fs_1.default.appendFileSync(`${this.folder}/${this.fileName}`, `[${date}] | ${level.toUpperCase().padEnd(5, " ")} | ${msg}` + os_1.EOL));
        });
    }
    init() {
        if (!fs_1.default.existsSync(this.folder)) {
            fs_1.default.mkdirSync(this.folder, { recursive: true });
        }
    }
    clear() {
        const path = `${this.folder}/${this.fileName}`;
        if (fs_1.default.existsSync(path)) {
            fs_1.default.truncateSync(path);
        }
    }
}
exports.FileLogger = FileLogger;
class DatabaseLogger {
    constructor(loggerClass) {
        this.loggerClass = loggerClass;
        this.messages = [];
        this.retryUntil = 5 * 1000;
        this.isRunning = true;
        this.initTime = this.unixTS();
    }
    log(msg, level, date) {
        return new Promise((resolve, reject) => {
            if (this.isRunning) {
                const log = new this.loggerClass();
                log.Message = msg;
                log.LogLevel = level.toUpperCase();
                log.Date = new Date(date);
                this.messages.push(log);
                this.flushLog().then(resolve, reject);
            }
            else {
                resolve();
            }
        });
    }
    flushLog() {
        return __awaiter(this, void 0, void 0, function* () {
            while (this.messages.length >= 1) {
                const log = this.messages.shift();
                try {
                    yield log.save();
                }
                catch (error) {
                    if (this.checkTimeout()) {
                        this.isRunning = false;
                        (0, helpers_1.logCatchedError)(error);
                    }
                    else {
                        this.messages.push(log);
                    }
                    break;
                }
            }
        });
    }
    checkTimeout() {
        return this.initTime + this.retryUntil <= this.unixTS();
    }
    unixTS() {
        return parseInt((0, helpers_1.now)().format("x"));
    }
    clear() {
        return;
    }
}
exports.DatabaseLogger = DatabaseLogger;
class Logger {
    static log(level, msg) {
        return new Promise((resolve) => {
            if (parseInt((0, helpers_1.getEnv)("APP_LOG_LEVEL", "3")) >= level.number) {
                this.messages.push({
                    date: (0, helpers_1.timestamp)(),
                    level: level,
                    message: msg,
                });
                Logger.doLog().then(resolve);
            }
        });
    }
    static doLog() {
        return new Promise((resolve) => {
            if (Logger.isReady) {
                while (Logger.messages.length >= 1) {
                    const message = Logger.messages.shift();
                    for (const instance of Logger.instances) {
                        if (instance.can) {
                            instance.driver
                                .log(message.message, message.level.name, message.date)
                                .then(resolve)
                                .catch(helpers_1.logCatchedError);
                        }
                    }
                }
            }
        });
    }
    static fatal(msg) {
        return this.log(this.FATAL, msg);
    }
    static error(msg) {
        return this.log(this.ERROR, msg);
    }
    static warn(msg) {
        return this.log(this.WARN, msg);
    }
    static info(msg) {
        return this.log(this.INFO, msg);
    }
    static debug(msg) {
        return this.log(this.DEBUG, msg);
    }
    static trace(msg) {
        return this.log(this.TRACE, msg);
    }
    static audit(msg) {
        return this.log(this.AUDIT, msg);
    }
    static pushDriver(driver, can = true) {
        this.instances.push({ driver: driver, can: can });
    }
    static clear() {
        for (const instance of this.instances) {
            instance.driver.clear();
        }
    }
}
exports.Logger = Logger;
Logger.instances = [];
Logger.messages = [];
Logger.FATAL = {
    name: "fatal",
    number: 0
};
Logger.ERROR = {
    name: "error",
    number: 1
};
Logger.WARN = {
    name: "warn",
    number: 2
};
Logger.INFO = {
    name: "info",
    number: 3
};
Logger.DEBUG = {
    name: "debug",
    number: 4
};
Logger.TRACE = {
    name: "trace",
    number: 5
};
Logger.AUDIT = {
    name: "audit",
    number: 6
};
Logger.isReady = false;
//# sourceMappingURL=logger.js.map