/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
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

if (!fs.existsSync("assets")) {
    fs.mkdirSync("assets", { recursive: true });
}

Lang.configure({
    locales: getEnv("APP_LOCALEs", "en,es").split(","),
    defaultLocale: getEnv("APP_DEFAULT_LOCALE", "en"),
    directory: path.join(process.cwd(), "assets", "lang"),
    autoReload: true,
    syncFiles: true,
});

export { Lang };

export function getEnv(key: string, fallback?: string): string {
    return process.env[key] || fallback || "";
}
export function setEnv(key: string, value: string): void {
    process.env[key] = value;
}
export function envIsTrue(values: string[]) {
    for (const value of values) {
        if (getEnv(value) === "true") {
            return true;
        }

        if (getEnv(value) === "false") {
            return false;
        }
    }
    return false;
}

export const NODE_ENV = (<any>process).pkg ? "production" : process.env.NODE_ENV?.trim() ?? "development";

if (!fs.existsSync(`.env.${NODE_ENV}`) && !fs.existsSync(".env")) {
    Logger.warn(Lang.__("No environment variables file [.env or .env.{{env}}] found.", {
        env: NODE_ENV
    }));
}
if (NODE_ENV && fs.existsSync(`.env.${NODE_ENV}`)) {
    dotenvExpand(dotenv.config({ path: `.env.${NODE_ENV}` }));
} else {
    dotenvExpand(dotenv.config());
}

setEnv("NODE_ENV", NODE_ENV);

export function logCatchedException(error?: { message?: string; stack?: string; }): void {
    logCatchedError(error);
    Logger.fatal("An unrecoverable error has occurred. Shutting down application.");
    process.exit(1);
}
export function logCatchedError(error?: { name?: string; message?: string; stack?: string; }): void {
    Logger.error(error?.message || Lang.__("No message provided for this error."));
    Logger.error(error?.stack || Lang.__("No trace stack provided for this error."));
    if (NODE_ENV?.trim() === "development") {
        Logger.error(JSON.stringify(error, null, 4));
    }
}
export function logTypeORMCatchedError(error?: any): void {
    logCatchedError(error);
    Logger.error(Lang.__(error.detail));
    Logger.error(error.query);
    Logger.trace(JSON.stringify({
        schema: error.schema,
        table: error.table,
        column: error.column,
        severity: error.severity,
        code: error.code,
        hint: error.hint,
        internalQuery: error.internalQuery,
        dataType: error.dataType,
        constraint: error.constraint
    }, null, 4));
}
export function isTypescript(): boolean {
    return path.extname(require?.main?.filename ?? "") === ".ts";
}

export function now(): Moment {
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

export type TIME_FORMAT = "YYYY-MM-DD[T]HH:mm:ss.SSS" | "YYYY-MM-DD HH:mm:ss.SSS" | "YYYY-MM-DD HH:mm:ss" | "YYYYMMDDHHmmss" | "YYYY-MM-DD" | "YYYY/MM/DD" | "HH:mm:ss" | "HH:mm:ss.SSS" | "HHmmss" | "HHmmssSSS";

export const TIMESTAMP_FORMAT: TIME_FORMAT = "YYYY-MM-DD[T]HH:mm:ss.SSS";
export const DATE_FORMAT: TIME_FORMAT = "YYYY-MM-DD";
export const HOUR_FORMAT: TIME_FORMAT = "HH:mm:ss.SSS";

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms, [ms]);
    });
}

export function dummyCallback(...any: unknown[]): void {
    any;
}
export function dummyPromiseCallback(...any: unknown[]): Promise<any> {
    return new Promise(resolve => resolve(any));
}
/*
process.on("SIGINT", () => {
    app.shutDown().then(() => {
        process.exit(0);
    });
});
*/

export function redisConfig(): RedisOptions {
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

export function escapeHtml(unsafe: any): any {
    if (typeof unsafe == "string") {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
            ;
    }

    return unsafe;
}

export function addsscalashes(string: any): string {
    return JSON.stringify(`${string}`);
}

export function cartesian(...a: any[]): string[] {
    return a.reduce((a, b) => a.flatMap((d: any) => b.map((e: any) => [d, e])));
}

export function cartesianString(...a: any[]): string[] {
    return a.reduce((a, b) => a.flatMap((d: any) => b.map((e: any) => `${d}${e}`)));
}

export function pick(object: { [key: string]: any }, select: string[]) {
    return Object.fromEntries(Object.entries(object).filter(
        ([key]) => {
            return select.includes(key);
        }
    ));
}

export function omit(object: { [key: string]: any }, select: string[]) {
    return Object.fromEntries(Object.entries(object).filter(
        ([key]) => {
            return !select.includes(key);
        }
    ));
}

export function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function slugify(str: string) {
    return str
        .normalize('NFKD') // split accented characters into their base characters and diacritical marks
        .replace(/[\u0300-\u036f]/g, '') // remove all the accents, which happen to be all in the \u03xx UNICODE block.
        .trim() // trim leading or trailing whitespace
        .toLowerCase() // convert to lowercase
        .replace(/[^a-z -]/g, '') // remove non-alphanumeric characters
        .replace(/\s+/g, '-') // replace spaces with hyphens
        .replace(/-+/g, '-'); // remove consecutive hyphens
}

export function except(objeto: any, excludes: string[] | string[][]) {
    const propiedades = Object.getOwnPropertyNames(objeto);
    const ret: any = objeto;

    for (const exclude of excludes) {
        const array = typeof exclude == "string" ? exclude.split(".") : exclude;
        // const array = exclude;
        if (array.length == 1) {
            if (propiedades.includes(exclude as string)) {
                delete ret[exclude as string];
            }
        } else if (array.length > 1) {
            const parent = array.shift() as string;

            if (propiedades.includes(parent)) {
                ret[parent] = except(objeto[parent], array);
            }
        }
    }

    return ret;
}