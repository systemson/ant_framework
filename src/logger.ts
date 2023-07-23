/* eslint-disable no-console */
import { DATE_FORMAT, getEnv, logCatchedError, NODE_ENV, now, timestamp, today } from "./helpers";
import fs from "fs";
import { EOL } from "os";
import moment from "moment";

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

export type LOG_LEVEL_NAME = "fatal" | "error" | "warn" | "info" | "debug" | "trace" | "audit";

export type LOG_LEVEL = {
    name: LOG_LEVEL_NAME;
    number: number;
};

export interface LogDriverContract {
    log(msg: string, level: LOG_LEVEL_NAME, date: string): Promise<void>;

    clear(): void;
}

export class ConsoleLogger implements LogDriverContract {
    protected LOG_COLORS = {
        fatal: "\u001b[7m" + LOG_COLORS.danger,
        error: LOG_COLORS.danger,
        warn: LOG_COLORS.warning,
        info: LOG_COLORS.success,
        debug: LOG_COLORS.info,
        trace: LOG_COLORS.light,
        audit: LOG_COLORS.secondary,
    }

    public log(msg: string, level: LOG_LEVEL_NAME, date: string): Promise<void> {
        return new Promise((resolve) => {
            switch (level) {
            case "error":
            case "fatal":
            case "warn":
                console.error(
                    this.LOG_COLORS[level],
                    `[${date}] | ${level.toUpperCase().padEnd(5, " ")} | ${msg}`,
                    "\x1b[0m"
                );
                break;

            default:
                console.log(
                    this.LOG_COLORS[level],
                    `[${date}] | ${level.toUpperCase().padEnd(5, " ")} | ${msg}`,
                    "\x1b[0m"
                );
                break;
            }

            resolve();
        });
    }

    public clear(): void {
        console.clear();
    }
}

export class FileLogger implements LogDriverContract {
    protected tick = 0;

    public constructor(
        public folder: string,
        public name: string,
        public maxTicks: number = 10
    ) {
        this.tick = this.maxTicks;
    }

    public log(msg: string, level: LOG_LEVEL_NAME, date: string): Promise<void> {
        this.init();

        return new Promise((resolve) => {
            resolve(fs.appendFileSync(
                `${this.folder}/${this.fileName}`,
                `[${date}] | ${level.toUpperCase().padEnd(5, " ")} | ${msg}` + EOL
            ));
        });
    }

    protected get fileName(): string {
        return `${this.name.toLowerCase()}-${today()}.log`;
    }

    protected getFileName(time: string): string {
        return `${this.name.toLowerCase()}-${time}.log`;

    }

    /**
     * @todo Make it async
     */
    protected init(): void {
        if (this.tick < this.maxTicks) {
            this.tick++;
            return;
        } else {
            this.tick = 0;
        }

        if (!fs.existsSync(this.folder)) {
            fs.mkdirSync(this.folder, { recursive: true });
        }

        const maxDays = getEnv("APP_LOG_MAX_DAYS", "false");

        if (maxDays != "false") {
            fs.readdirSync(this.folder)
                .map(file => file.replace(`${this.name}-`, "").replace(".log", ""))
                .filter(file => file <= moment().subtract(parseInt(getEnv("APP_LOG_MAX_DAYS", "10")), "days").format(DATE_FORMAT))
                .forEach(file => {
                    fs.unlinkSync(`${this.folder}/${this.getFileName(file)}`);
                })
            ;
        }

        const maxSize = getEnv("APP_LOG_MAX_SIZE", "false");

        if (maxSize != "false") {
            const fileName = `${this.folder}/${this.fileName}`;
            if (fs.existsSync(fileName)) {
                const stats = fs.statSync(fileName);
                const fileSize = stats.size / (1024 * 1024);
    
                if (fileSize >= parseInt(maxSize)) {
                    fs.renameSync(fileName, `${this.folder}/${this.getFileName(moment().unix().toString())}`);
                }
            }
        }
    }

    public clear(): void {
        const path = `${this.folder}/${this.fileName}`;

        if (fs.existsSync(path)) {
            fs.truncateSync(path);
        }
    }
}

export interface DatabaseLoggerProvider {
    Message: string;
    LogLevel: string;
    Date: Date;

    save(): Promise<any>;
}

export class DatabaseLogger implements LogDriverContract {
    protected messages: DatabaseLoggerProvider[] = [];
    protected initTime: number;
    protected retryUntil: number = 5 * 1000;
    protected isRunning = true;

    public constructor(
        protected loggerClass: new () => DatabaseLoggerProvider
    ) {
        this.initTime = this.unixTS();
    }

    log(msg: string, level: LOG_LEVEL_NAME, date: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.isRunning) {
                const log = new this.loggerClass();

                log.Message = msg;
                log.LogLevel = level.toUpperCase();
                log.Date = new Date(date);

                this.messages.push(log);

                this.flushLog().then(resolve, reject);
            } else {
                resolve();
            }
        });
    }

    protected async flushLog(): Promise<void> {
        while (this.messages.length >= 1) {
            const log = this.messages.shift() as DatabaseLoggerProvider;

            try {
                await log.save();
            } catch (error: any) {

                if (this.checkTimeout()) {
                    this.isRunning = false;
                    logCatchedError(error);
                } else {
                    this.messages.push(log);
                }
                break;
            }
        }
    }

    protected checkTimeout(): boolean {
        return this.initTime + this.retryUntil <= this.unixTS();
    }

    protected unixTS(): number {
        return parseInt(now().format("x"));
    }

    public clear(): void {
        return;
    }
}

type LoggerMessage = {
    date: string;
    level: LOG_LEVEL;
    message: string;
}

export class Logger {
    public static instances: { driver: LogDriverContract; can: boolean }[] = [];

    protected static messages: LoggerMessage[] = [];

    public static FATAL: LOG_LEVEL = {
        name: "fatal",
        number: 0
    }
    public static ERROR: LOG_LEVEL = {
        name: "error",
        number: 1
    }
    public static WARN: LOG_LEVEL = {
        name: "warn",
        number: 2
    }
    public static INFO: LOG_LEVEL = {
        name: "info",
        number: 3
    }
    public static DEBUG: LOG_LEVEL = {
        name: "debug",
        number: 4
    }
    public static TRACE: LOG_LEVEL = {
        name: "trace",
        number: 5
    }
    public static AUDIT: LOG_LEVEL = {
        name: "audit",
        number: 6
    }

    public static isReady = false;

    public static log(level: LOG_LEVEL, raw: unknown): Promise<void> {
        if (typeof raw == "undefined") {
            return Promise.resolve();
        }

        let msg: string;

        if (typeof raw != "string") {
            if (NODE_ENV == "development") {
                msg = JSON.stringify(raw, null, 4);
            } else {
                msg = JSON.stringify(raw);
            }
        } else {
            msg = raw;
        }

        return new Promise((resolve, reject) => {
            if (parseInt(getEnv("APP_LOG_LEVEL", "3")) >= level.number) {
                this.messages.push({
                    date: timestamp(),
                    level: level,
                    message: msg,
                });
                Logger.doLog().then(resolve, reject);
            }
        });
    }

    protected static doLog(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (Logger.isReady) {
                while (Logger.messages.length >= 1) {
                    const message = Logger.messages.shift() as LoggerMessage;
                    for (const instance of Logger.instances) {
                        if (instance.can) {
                            instance.driver
                                .log(message.message, message.level.name, message.date)
                                .then(resolve, reject)
                                .catch(logCatchedError)
                            ;
                        }
                    }
                }
            }
        });
    }

    static fatal(msg: unknown): Promise<void> {
        return this.log(this.FATAL, msg);
    }

    static error(msg: unknown): Promise<void> {
        return this.log(this.ERROR, msg);
    }

    static warn(msg: unknown): Promise<void> {
        return this.log(this.WARN, msg);
    }

    static info(msg: unknown): Promise<void> {
        return this.log(this.INFO, msg);
    }

    static debug(msg: unknown): Promise<void> {
        return this.log(this.DEBUG, msg);
    }

    static trace(msg: unknown): Promise<void> {
        return this.log(this.TRACE, msg);
    }

    static audit(msg: unknown): Promise<void> {
        return this.log(this.AUDIT, msg);
    }

    public static pushDriver(driver: LogDriverContract, can = true): void {
        this.instances.push({ driver: driver, can: can });
    }

    public static clear(): void {
        for (const instance of this.instances) {
            instance.driver.clear();
        }
    }
}
