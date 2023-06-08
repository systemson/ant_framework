"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerFacade = exports.BaseTask = void 0;
const helpers_1 = require("./helpers");
const moment_1 = __importDefault(require("moment"));
const node_cron_1 = __importDefault(require("node-cron"));
const logger_1 = require("./logger");
class BaseTask {
    cronExpression = "* * * * * *";
    isRunning = false;
    delayedTimes = 0;
    executedTimes = 0;
    id = 0;
    concurrency = 1;
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
    setId(id) {
        this.id = id;
    }
    getId() {
        return this.id;
    }
}
exports.BaseTask = BaseTask;
class SchedulerFacade {
    static cron = node_cron_1.default;
    static tasks = new Map();
    static schedule(scheduler) {
        this.tasks.set(scheduler.name, this.cron.schedule(scheduler.cronExpression, () => {
            if (!scheduler.isRunning) {
                scheduler.isRunning = true;
                logger_1.Logger.audit(helpers_1.Lang.__("Running task [{{name}}(#{{id}})] at [{{date}}]", {
                    name: `${scheduler.constructor.name}`,
                    id: scheduler.id.toString(),
                    date: (0, moment_1.default)((0, helpers_1.now)()).format(helpers_1.TIMESTAMP_FORMAT),
                }));
                scheduler.handler().then(() => {
                    scheduler.isRunning = false;
                    scheduler.delayedTimes = 0;
                    scheduler.executedTimes++;
                    logger_1.Logger.audit(helpers_1.Lang.__("Task [{{name}}(#{{id}})] completed successfully at [{{date}}]", {
                        name: `${scheduler.constructor.name}`,
                        id: scheduler.id.toString(),
                        date: (0, moment_1.default)().format(helpers_1.TIMESTAMP_FORMAT),
                    }));
                    scheduler.onCompleted();
                }, (error) => {
                    (0, helpers_1.logCatchedError)(error);
                    scheduler.isRunning = false;
                    scheduler.delayedTimes = 0;
                    scheduler.executedTimes = 0;
                    scheduler.onFailed(error);
                })
                    .catch((error) => {
                    (0, helpers_1.logCatchedError)(error);
                    scheduler.isRunning = false;
                    scheduler.delayedTimes = 0;
                    scheduler.executedTimes = 0;
                });
            }
            else {
                scheduler.delayedTimes++;
                scheduler.executedTimes = 0;
                logger_1.Logger.audit(helpers_1.Lang.__("Waiting for task [{{name}}(#{{id}})]-[({{times}})] to complete", {
                    name: `${scheduler.constructor.name}`,
                    id: scheduler.id.toString(),
                    times: scheduler.delayedTimes.toString(),
                }));
            }
        }));
    }
    static stop(name) {
        if (this.tasks.has(name)) {
            this.tasks.get(name)?.stop();
        }
    }
    static start(name) {
        if (this.tasks.has(name)) {
            this.tasks.get(name)?.start();
        }
    }
}
exports.SchedulerFacade = SchedulerFacade;
//# sourceMappingURL=scheduler.js.map