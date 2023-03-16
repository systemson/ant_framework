"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventEmitter = exports.BaseListener = exports.NodeEmitterDriver = void 0;
const events_1 = require("events");
const helpers_1 = require("./helpers");
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
            try {
                this.driver.addListener(event, (...args) => listener.handler(...args));
            }
            catch (error) {
                (0, helpers_1.logCatchedError)(error);
                throw error;
            }
        }
    }
    static emit(event, ...args) {
        try {
            EventEmitter.driver.emit(event, ...args);
        }
        catch (error) {
            (0, helpers_1.logCatchedError)(error);
            throw error;
        }
    }
}
exports.EventEmitter = EventEmitter;
//# sourceMappingURL=events.js.map