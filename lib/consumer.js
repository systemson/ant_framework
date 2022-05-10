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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseConsumer = void 0;
const StringUtils_1 = require("typeorm/util/StringUtils");
const helpers_1 = require("./helpers");
class BaseConsumer {
    boot(base) {
        return __awaiter(this, void 0, void 0, function* () {
            this.base = base;
            yield this.base.connect().catch(helpers_1.logCatchedError);
            yield this.base.subscribe({
                topic: this.topic,
                fromBeginning: false,
            });
        });
    }
    onCreated() {
    }
    onBooted() {
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
    onError(error) {
        (0, helpers_1.dummyCallback)(error);
    }
    onDestroyed() {
    }
}
exports.BaseConsumer = BaseConsumer;
//# sourceMappingURL=consumer.js.map