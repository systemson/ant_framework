"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseConsumer = void 0;
const StringUtils_1 = require("typeorm/util/StringUtils");
const helpers_1 = require("./helpers");
class BaseConsumer {
    base;
    async boot(base) {
        this.base = base;
        await this.base.connect().catch(helpers_1.logCatchedError);
        await this.base.subscribe({
            topic: this.topic,
            fromBeginning: false,
        });
        return base;
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