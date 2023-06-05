import { Moment } from "moment";
import { Redis, RedisOptions } from "ioredis";
import { I18n } from "i18n";
declare const Lang: I18n;
export { Lang };
export declare function getEnv(key: string, fallback?: string): string;
export declare function setEnv(key: string, value: string): void;
export declare function envIsTrue(values: string[]): boolean;
export declare const NODE_ENV: string;
export declare function logCatchedException(error?: {
    message?: string;
    stack?: string;
}): void;
export declare function logCatchedError(error?: {
    name?: string;
    message?: string;
    stack?: string;
}): void;
export declare function logTypeORMCatchedError(error?: any): void;
export declare function isTypescript(): boolean;
export declare function now(): Moment;
export declare function dateFormated(format: TIME_FORMAT): string;
export declare function timestamp(): string;
export declare function today(): string;
export declare function time(): string;
export type TIME_FORMAT = "YYYY-MM-DD[T]HH:mm:ss.SSS" | "YYYY-MM-DD HH:mm:ss.SSS" | "YYYY-MM-DD HH:mm:ss" | "YYYYMMDDHHmmss" | "YYYY-MM-DD" | "YYYY/MM/DD" | "HH:mm:ss" | "HH:mm:ss.SSS" | "HHmmss" | "HHmmssSSS";
export declare const TIMESTAMP_FORMAT: TIME_FORMAT;
export declare const DATE_FORMAT: TIME_FORMAT;
export declare const HOUR_FORMAT: TIME_FORMAT;
export declare function sleep(ms: number): Promise<void>;
export declare function dummyCallback(...any: unknown[]): void;
export declare function dummyPromiseCallback(...any: unknown[]): Promise<any>;
export declare function redisConfig(): RedisOptions;
export declare function redisInstance(): Redis;
export declare function escapeHtml(unsafe: any): any;
export declare function addsscalashes(string: any): string;
//# sourceMappingURL=helpers.d.ts.map