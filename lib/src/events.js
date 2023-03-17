"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventEmitter = exports.BaseListener = exports.NodeEmitterDriver = void 0;
const events_1 = require("events");
const helpers_1 = require("./helpers");
const logger_1 = require("./logger");
class NodeEmitterDriver extends events_1.EventEmitter {
}
exports.NodeEmitterDriver = NodeEmitterDriver;
class BaseListener {
    onCreated() {
    }
    onBooted() {
    }
    onCompleted() {
    }
    onFailed(error) {
        (0, helpers_1.dummyCallback)(error);
    }
    onError(error) {
        (0, helpers_1.dummyCallback)(error);
    }
    onDestroyed() {
    }
}
exports.BaseListener = BaseListener;
class EventEmitter {
    static listen(event, listener) {
        if (Array.isArray(event)) {
            this.listen(event, listener);
        }
        else {
            const logData = {
                eventName: listener.eventName,
                listener: listener.constructor.name,
            };
            logger_1.Logger.audit(helpers_1.Lang.__("Suscribed to event [{{eventName}}] by [{{listener}}].", logData));
            try {
                this.driver.addListener(event, (...args) => {
                    listener.handler(...args);
                    logger_1.Logger.audit(helpers_1.Lang.__("Event [{{eventName}}] handled by [{{listener}}].", logData));
                });
                logger_1.Logger.audit(helpers_1.Lang.__("Suscribed to event [{{eventName}}] by [{{listener}}].", logData));
            }
            catch (error) {
                logger_1.Logger.error(helpers_1.Lang.__("Error handling event [{{eventName}}] by [{{listener}}].", logData));
                (0, helpers_1.logCatchedError)(error);
                throw error;
            }
        }
    }
    static emit(event, ...args) {
        try {
            logger_1.Logger.audit(helpers_1.Lang.__("Emiting event [{{eventName}}].", {
                eventName: event,
            }));
            EventEmitter.driver.emit(event, ...args);
        }
        catch (error) {
            logger_1.Logger.audit(helpers_1.Lang.__("Error emiting event [{{eventName}}].", {
                eventName: event,
            }));
            (0, helpers_1.logCatchedError)(error);
            throw error;
        }
    }
}
exports.EventEmitter = EventEmitter;
//# sourceMappingURL=events.js.map