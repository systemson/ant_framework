"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisInstance = exports.redisConfig = exports.dummyCallback = exports.sleep = exports.HOUR_FORMAT = exports.DATE_FORMAT = exports.TIMESTAMP_FORMAT = exports.time = exports.today = exports.timestamp = exports.dateFormated = exports.now = exports.isTypescript = exports.logCatchedError = exports.logCatchedException = exports.getEnv = exports.NODE_ENV = exports.Lang = void 0;
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
const dotenv_expand_1 = __importDefault(require("dotenv-expand"));
const logger_1 = require("./logger");
const moment_1 = __importDefault(require("moment"));
const ioredis_1 = __importDefault(require("ioredis"));
const i18n_1 = require("i18n");
const path_1 = __importDefault(require("path"));
const Lang = new i18n_1.I18n();
exports.Lang = Lang;
if (!fs_1.default.existsSync("assets")) {
    fs_1.default.mkdirSync("assets", { recursive: true });
}
Lang.configure({
    locales: getEnv("APP_LOCALEs", "en,es").split(","),
    defaultLocale: getEnv("APP_DEFAULT_LOCALE", "en"),
    directory: path_1.default.join(process.cwd(), "assets", "lang"),
    autoReload: true,
    syncFiles: true,
});
exports.NODE_ENV = process.pkg ? "compiled" : (_b = (_a = process.env.NODE_ENV) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : "development";
if (!fs_1.default.existsSync(`.env.${exports.NODE_ENV}`) && !fs_1.default.existsSync(".env")) {
    logger_1.Logger.warn(Lang.__("No environment variables file [.env or .env.{{env}}] found.", {
        env: exports.NODE_ENV
    }));
}
if (exports.NODE_ENV && fs_1.default.existsSync(`.env.${exports.NODE_ENV}`)) {
    (0, dotenv_expand_1.default)(dotenv_1.default.config({ path: `.env.${exports.NODE_ENV}` }));
}
else {
    (0, dotenv_expand_1.default)(dotenv_1.default.config());
}
function getEnv(key, fallback) {
    return process.env[key] || fallback || "";
}
exports.getEnv = getEnv;
function logCatchedException(error) {
    logCatchedError(error);
    logger_1.Logger.fatal("An unrecoverable error has occurred. Shutting down application.");
    process.exit(1);
}
exports.logCatchedException = logCatchedException;
function logCatchedError(error) {
    logger_1.Logger.error((error === null || error === void 0 ? void 0 : error.message) || Lang.__("No message provided for this error."));
    logger_1.Logger.error((error === null || error === void 0 ? void 0 : error.stack) || Lang.__("No trace stack provided for this error."));
    if ((exports.NODE_ENV === null || exports.NODE_ENV === void 0 ? void 0 : exports.NODE_ENV.trim()) === "develop") {
        logger_1.Logger.error(JSON.stringify(error, null, 4));
    }
}
exports.logCatchedError = logCatchedError;
function isTypescript() {
    var _a, _b;
    return path_1.default.extname((_b = (_a = require === null || require === void 0 ? void 0 : require.main) === null || _a === void 0 ? void 0 : _a.filename) !== null && _b !== void 0 ? _b : "") === ".ts";
}
exports.isTypescript = isTypescript;
function now() {
    return (0, moment_1.default)();
}
exports.now = now;
function dateFormated(format) {
    return now().format(format);
}
exports.dateFormated = dateFormated;
function timestamp() {
    return dateFormated(exports.TIMESTAMP_FORMAT);
}
exports.timestamp = timestamp;
function today() {
    return dateFormated(exports.DATE_FORMAT);
}
exports.today = today;
function time() {
    return dateFormated(exports.HOUR_FORMAT);
}
exports.time = time;
exports.TIMESTAMP_FORMAT = "YYYY-MM-DD[T]HH:mm:ss.SSS";
exports.DATE_FORMAT = "YYYY-MM-DD";
exports.HOUR_FORMAT = "HH:mm:ss.SSS";
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms, [ms]);
    });
}
exports.sleep = sleep;
function dummyCallback(...any) {
}
exports.dummyCallback = dummyCallback;
function redisConfig() {
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
exports.redisConfig = redisConfig;
function redisInstance() {
    const config = redisConfig();
    const redis = new ioredis_1.default(config);
    redis.on("error", (error) => {
        var _a;
        logger_1.Logger.error(Lang.__("Could not connect to redis server on [{{host}}:{{port}}].", {
            host: config.host || "localhost",
            port: ((_a = config.port) === null || _a === void 0 ? void 0 : _a.toString()) || "6379",
        }));
        logCatchedException(error);
    });
    return redis;
}
exports.redisInstance = redisInstance;
//# sourceMappingURL=helpers.js.map