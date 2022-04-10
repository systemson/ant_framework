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
const helpers_1 = require("./helpers");
const logger_1 = require("./logger");
class BaseConsumer {
    constructor(base) {
        this.base = base;
        this.groupId = (0, helpers_1.getEnv)("KAFKA_CONSUMER_GROUP_ID", "my-group");
        this.topic = (0, helpers_1.getEnv)("KAFKA_DEFAULT_TOPIC", "my-topic");
    }
    prepareConsumer() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.base.connect().catch(helpers_1.logCatchedError);
            yield this.base.subscribe({
                topic: this.topic,
                fromBeginning: true,
            });
        });
    }
    doHandle() {
        this.base.run({
            eachMessage: (payload) => __awaiter(this, void 0, void 0, function* () {
                const message = payload.message;
                logger_1.Logger.info(`Consuming message on [${this.constructor.name}] from topic [${payload.topic}(#${payload.partition})]`);
                return this.handler(payload)
                    .then(() => {
                    var _a, _b;
                    logger_1.Logger.info(`Message successfully consumed on [${this.constructor.name}] from topic [${payload.topic}(#${payload.partition})]`);
                    logger_1.Logger.trace("Message consumed: " + JSON.stringify({
                        key: (_a = message.key) === null || _a === void 0 ? void 0 : _a.toString(),
                        offset: message.offset,
                        message: (_b = message.value) === null || _b === void 0 ? void 0 : _b.toString(),
                        headers: message.headers,
                        timestamp: (0, moment_1.default)(message.timestamp, "x").format(helpers_1.TIMESTAMP_FORMAT),
                    }, null, 4));
                }, error => {
                    this.error(error);
                })
                    .catch(helpers_1.logCatchedError);
            })
        });
    }
    error(error) {
        (0, helpers_1.logCatchedError)(error);
    }
}
exports.BaseConsumer = BaseConsumer;
