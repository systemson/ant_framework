import fs from "fs";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import { Logger } from "./logger";
import moment, { Moment } from "moment";
import IORedis, { Redis, RedisOptions } from "ioredis";

/**
 * require I18n with capital I as constructor
 */
import { I18n } from "i18n";
import path from "path";
 
/**
  * create a new instance
  */
const Lang = new I18n();
 
if (!fs.existsSync("assets")){
    fs.mkdirSync("assets", { recursive: true });
}
 
Lang.configure({
    locales:  getEnv("APP_LOCALEs", "en,es").split(","),
    defaultLocale: getEnv("APP_DEFAULT_LOCALE", "en"),
    directory: path.join(process.cwd(), "assets", "lang"),
    autoReload: true,
    syncFiles: true,
});
 
export { Lang };

export const NODE_ENV = (<any>process).pkg ? "compiled" : process.env.NODE_ENV?.trim() ?? "development";

if (!fs.existsSync(`.env.${NODE_ENV}`) && !fs.existsSync(".env")) {
    Logger.warn(Lang.__("No environment variables file [.env or .env.{{env}}] found.", {
        env: NODE_ENV
    }));
}
if (NODE_ENV && fs.existsSync(`.env.${NODE_ENV}`)) {
    dotenvExpand(dotenv.config({ path:  `.env.${NODE_ENV}`}));
} else {
    dotenvExpand(dotenv.config());
}
export function getEnv(key: string, fallback?: string): string {
    return process.env[key] || fallback || "";
}
export function logCatchedException(error?: {message?: string; stack?: string;}): void {
    logCatchedError(error);
    Logger.fatal("An unrecoverable error has occurred. Shutting down application.");
    process.exit(1);
}
export function logCatchedError(error?: {name?: string; message?: string; stack?: string;}): void {
    Logger.error(error?.message || Lang.__("No message provided for this error."));
    Logger.error(error?.stack || Lang.__("No trace stack provided for this error."));
    if (NODE_ENV?.trim() === "develop") {
        Logger.error(JSON.stringify(error, null, 4));
    }
}
export function isTypescript(): boolean {
    return path.extname(require?.main?.filename ?? "")  === ".ts";
}

export function now(): Moment  {
    return moment();
}
export function dateFormated(format: TIME_FORMAT): string {
    return now().format(format);
}
export function timestamp(): string {
    return dateFormated(TIMESTAMP_FORMAT);
}
export function today(): string {
    return dateFormated(DATE_FORMAT);
}
export function time(): string {
    return dateFormated(HOUR_FORMAT);
}

export type TIME_FORMAT = "YYYY-MM-DD[T]HH:mm:ss.SSS" | "YYYY-MM-DD HH:mm:ss.SSS" | "YYYY-MM-DD HH:mm:ss" |"YYYYMMDDHHmmss" | "YYYY-MM-DD" | "YYYY/MM/DD" | "HH:mm:ss" | "HH:mm:ss.SSS" | "HHmmss" | "HHmmssSSS";

export const TIMESTAMP_FORMAT: TIME_FORMAT = "YYYY-MM-DD[T]HH:mm:ss.SSS";
export const DATE_FORMAT: TIME_FORMAT = "YYYY-MM-DD";
export const HOUR_FORMAT: TIME_FORMAT = "HH:mm:ss.SSS";

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms, [ms]);
    });
}

export function dummyCallback(...any: unknown[]): void {
    //
}
/*
process.on("SIGINT", () => {
    app.shutDown().then(() => {
        process.exit(0);
    });
});
*/

export function redisConfig(): RedisOptions  {
    return {
        host: getEnv("REDIS_HOST"),
        port: parseInt(getEnv("REDIS_PORT")),
        password: getEnv("REDIS_PASSWORD"),
        username: getEnv("REDIS_USERNAME"),
        enableReadyCheck: false,
        maxRetriesPerRequest: null,
        stringNumbers: true,
    };
}

export function redisInstance(): Redis {
    const config = redisConfig();
    const redis = new IORedis(config);

    redis.on("error", (error) => {
        Logger.error(Lang.__("Could not connect to redis server on [{{host}}:{{port}}].", {
            host: config.host || "localhost",
            port: config.port?.toString() || "6379",
        }));

        logCatchedException(error);
    });

    return redis;
}
