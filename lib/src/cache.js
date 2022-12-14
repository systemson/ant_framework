"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheFacade = exports.RedisChacheDriver = exports.FilesystemChacheDriver = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const helpers_1 = require("./helpers");
const logger_1 = require("./logger");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const StringUtils_1 = require("typeorm/util/StringUtils");
class FilesystemChacheDriver {
    constructor(baseDir) {
        this.baseDir = baseDir;
        this.initFilesystem();
    }
    initFilesystem() {
        if (!fs_1.default.existsSync(this.baseDir)) {
            fs_1.default.mkdirSync(this.baseDir, { recursive: true });
        }
    }
    set(key, value, ttl) {
        return new Promise((resolve) => {
            resolve(fs_1.default.writeFileSync(this.getRealKey(key), this.encode({
                data: value,
                until: parseInt((0, helpers_1.now)().format("x")) + (ttl || 0),
            })));
        });
    }
    has(key) {
        return new Promise((resolve) => {
            if (fs_1.default.existsSync(this.getRealKey(key))) {
                const token = this.decode(this.getFileData(key));
                if (token.until && token.until >= parseInt((0, helpers_1.now)().format("x"))) {
                    resolve(true);
                }
                else {
                    this.unset(key).then(() => resolve(false));
                }
            }
            else {
                resolve(false);
            }
        });
    }
    get(key, def) {
        return new Promise((resolve) => {
            var _a;
            resolve(((_a = this.decode(this.getFileData(key))) === null || _a === void 0 ? void 0 : _a.data) || def);
        });
    }
    unset(key) {
        return new Promise((resolve) => {
            const path = this.getRealKey(key);
            if (fs_1.default.existsSync(path)) {
                fs_1.default.unlinkSync(path);
            }
            resolve();
        });
    }
    getRealKey(key) {
        return path_1.default.join(this.baseDir, crypto_1.default.createHash("sha256").update(key).digest("hex"));
    }
    getFileData(key) {
        try {
            return fs_1.default.readFileSync(this.getRealKey(key)).toString("utf-8");
        }
        catch (error) {
            return JSON.stringify("");
        }
    }
    encode(data) {
        return JSON.stringify(data);
    }
    decode(data) {
        return JSON.parse(data);
    }
}
exports.FilesystemChacheDriver = FilesystemChacheDriver;
class RedisChacheDriver {
    constructor(config) {
        this.config = config;
    }
    initRedis() {
        if (this.client === undefined) {
            if (this.config.url) {
                this.client = new ioredis_1.default(this.config.url);
            }
            else {
                this.client = new ioredis_1.default(this.config.port, this.config.host, {
                    password: this.config.password
                });
            }
            this.client.on("error", (error) => {
                logger_1.Logger.error(helpers_1.Lang.__("Could not connect to redis server on [{{host}}:{{port}}].", {
                    host: this.config.host,
                    port: this.config.port.toString(),
                }));
                (0, helpers_1.logCatchedException)(error);
            });
        }
    }
    set(key, value, ttl) {
        this.initRedis();
        return new Promise((resolve, reject) => {
            this.client.set(this.getRealKey(key), JSON.stringify(value), "PX", ttl || 0).then(() => resolve(), reject);
        });
    }
    has(key) {
        this.initRedis();
        return new Promise((resolve, reject) => {
            this.client.exists(this.getRealKey(key)).then((value) => {
                resolve(value > 0);
            }, reject);
        });
    }
    get(key, def) {
        this.initRedis();
        return new Promise((resolve, reject) => {
            this.client.get(this.getRealKey(key)).then((value) => {
                if (value) {
                    resolve(JSON.parse(value));
                }
                else {
                    resolve(def);
                }
            }, reject);
        });
    }
    unset(key) {
        this.initRedis();
        return new Promise((resolve, reject) => {
            this.client.del(this.getRealKey(key)).then(() => {
                resolve();
            }, reject);
        });
    }
    getRealKey(key) {
        return `${(0, StringUtils_1.snakeCase)((0, helpers_1.getEnv)("APP_REDIS_CACHE_PREFIX"))}${key}`;
    }
}
exports.RedisChacheDriver = RedisChacheDriver;
class CacheFacade {
    static setDriver(driver) {
        this.driver = driver;
    }
    static set(key, value, ttl) {
        return new Promise((resolve, reject) => {
            this.driver.set(key, value, ttl).then(resolve, reject).catch(helpers_1.logCatchedError);
        });
    }
    static has(key) {
        return new Promise((resolve, reject) => {
            this.driver.has(key).then(resolve, reject).catch(helpers_1.logCatchedError);
        });
    }
    static get(key, def) {
        return new Promise((resolve, reject) => {
            this.driver.get(key, def).then(resolve, reject).catch(helpers_1.logCatchedError);
        });
    }
    static unset(key) {
        return new Promise((resolve, reject) => {
            this.driver.unset(key).then(resolve, reject).catch(helpers_1.logCatchedError);
        });
    }
    static call(key, callback, ttl) {
        return new Promise((resolve, reject) => {
            this.driver.has(key).then((has) => {
                if (!has) {
                    callback.then(value => {
                        this.driver.set(key, value, ttl).then(() => {
                            this.driver.get(key).then(resolve, reject);
                        });
                    });
                }
                else {
                    this.driver.get(key).then(resolve, reject);
                }
            });
        });
    }
}
exports.CacheFacade = CacheFacade;
//# sourceMappingURL=cache.js.map