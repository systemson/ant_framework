export declare type LOG_LEVEL_NAME = "fatal" | "error" | "warn" | "info" | "debug" | "trace" | "audit";
export declare type LOG_LEVEL = {
    name: LOG_LEVEL_NAME;
    number: number;
};
export interface LogDriverContract {
    log(msg: string, level: LOG_LEVEL_NAME, date: string): Promise<void>;
    clear(): void;
}
export declare class ConsoleLogger implements LogDriverContract {
    protected LOG_COLORS: {
        fatal: string;
        error: string;
        warn: string;
        info: string;
        debug: string;
        trace: string;
        audit: string;
    };
    log(msg: string, level: LOG_LEVEL_NAME, date: string): Promise<void>;
    clear(): void;
}
export declare class FileLogger implements LogDriverContract {
    folder: string;
    name: string;
    dateFormat: string;
    protected fileName: string;
    constructor(folder: string, name: string, dateFormat?: string);
    log(msg: string, level: LOG_LEVEL_NAME, date: string): Promise<void>;
    protected init(): void;
    clear(): void;
}
export interface DatabaseLoggerProvider {
    Message: string;
    LogLevel: string;
    Date: Date;
    save(): Promise<any>;
}
export declare class DatabaseLogger implements LogDriverContract {
    protected loggerClass: new () => DatabaseLoggerProvider;
    protected messages: DatabaseLoggerProvider[];
    protected initTime: number;
    protected retryUntil: number;
    protected isRunning: boolean;
    constructor(loggerClass: new () => DatabaseLoggerProvider);
    log(msg: string, level: LOG_LEVEL_NAME, date: string): Promise<void>;
    protected flushLog(): Promise<void>;
    protected checkTimeout(): boolean;
    protected unixTS(): number;
    clear(): void;
}
declare type LoggerMessage = {
    date: string;
    level: LOG_LEVEL;
    message: string;
};
export declare class Logger {
    static instances: {
        driver: LogDriverContract;
        can: boolean;
    }[];
    protected static messages: LoggerMessage[];
    static FATAL: LOG_LEVEL;
    static ERROR: LOG_LEVEL;
    static WARN: LOG_LEVEL;
    static INFO: LOG_LEVEL;
    static DEBUG: LOG_LEVEL;
    static TRACE: LOG_LEVEL;
    static AUDIT: LOG_LEVEL;
    static isReady: boolean;
    static log(level: LOG_LEVEL, msg: string): Promise<void>;
    protected static doLog(): Promise<void>;
    static fatal(msg: string): Promise<void>;
    static error(msg: string): Promise<void>;
    static warn(msg: string): Promise<void>;
    static info(msg: string): Promise<void>;
    static debug(msg: string): Promise<void>;
    static trace(msg: string): Promise<void>;
    static audit(msg: string): Promise<void>;
    static pushDriver(driver: LogDriverContract, can?: boolean): void;
    static clear(): void;
}
export {};
//# sourceMappingURL=logger.d.ts.map