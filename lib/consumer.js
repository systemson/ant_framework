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
exports.BaseConsumer = void 0;
const moment_1 = __importDefault(require("moment"));
const StringUtils_1 = require("typeorm/util/StringUtils");
const helpers_1 = require("./helpers");
const logger_1 = require("./logger");
class BaseConsumer {
    boot(base) {
        return __awaiter(this, void 0, void 0, function* () {
            this.base = base;
            yield this.base.connect().catch(helpers_1.logCatchedError);
            yield this.base.subscribe({
                topic: this.topic,
                fromBeginning: false,
            });
            this.prepare();
        });
    }
    prepare() {
        this.base.run({
            eachMessage: (payload) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const message = payload.message;
                const value = JSON.parse((_a = payload.message.value) === null || _a === void 0 ? void 0 : _a.toString());
                logger_1.Logger.debug(`Consuming message on [${this.constructor.name}] from topic [${payload.topic}(#${payload.partition})]`);
                return this.handler(value, payload)
                    .then(() => {
                    var _a, _b;
                    logger_1.Logger.debug(`Message successfully consumed on [${this.constructor.name}] from topic [${payload.topic}(#${payload.partition})]`);
                    logger_1.Logger.trace("Message consumed: " + JSON.stringify({
                        key: (_a = message.key) === null || _a === void 0 ? void 0 : _a.toString(),
                        offset: message.offset,
                        message: (_b = message.value) === null || _b === void 0 ? void 0 : _b.toString(),
                        headers: message.headers,
                        timestamp: (0, moment_1.default)(message.timestamp, "x").format(helpers_1.TIMESTAMP_FORMAT),
                    }, null, 4));
                    this.onCompleted(message);
                }, error => {
                    (0, helpers_1.logCatchedError)(error);
                    this.onFailed(error, message);
                })
                    .catch(helpers_1.logCatchedError);
            })
        });
    }
    get groupId() {
        return `${(0, StringUtils_1.snakeCase)(this.constructor.name)}_group`;
    }
    onCompleted(message) {
        (0, helpers_1.dummyCallback)(message);
    }
    onFailed(message, error) {
        (0, helpers_1.dummyCallback)(error, message);
    }
}
exports.BaseConsumer = BaseConsumer;
//# sourceMappingURL=consumer.js.map