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
    constructor() {
        this.cronExpression = "* * * * * *";
        this.isRunning = false;
        this.delayedTimes = 0;
        this.executedTimes = 0;
    }
}
exports.BaseTask = BaseTask;
class SchedulerFacade {
    static schedule(scheduler) {
        this.tasks.set(scheduler.name, this.cron.schedule(scheduler.cronExpression, (now) => {
            if (!scheduler.isRunning) {
                scheduler.isRunning = true;
                logger_1.Logger.audit(helpers_1.Lang.__("Running task {{name}} at {{date}}", {
                    name: `${scheduler.constructor.name}`,
                    date: (0, moment_1.default)(now).format(helpers_1.TIMESTAMP_FORMAT),
                }));
                scheduler.handler(now).then(() => {
                    scheduler.isRunning = false;
                });
            }
            else {
                logger_1.Logger.audit(helpers_1.Lang.__("Waiting for task {{name}} to complete", {
                    name: `${scheduler.constructor.name}`,
                }));
            }
        }));
    }
    static stop(name) {
        var _a;
        if (this.tasks.has(name)) {
            (_a = this.tasks.get(name)) === null || _a === void 0 ? void 0 : _a.stop();
        }
    }
    static start(name) {
        var _a;
        if (this.tasks.has(name)) {
            (_a = this.tasks.get(name)) === null || _a === void 0 ? void 0 : _a.start();
        }
    }
}
exports.SchedulerFacade = SchedulerFacade;
SchedulerFacade.cron = node_cron_1.default;
SchedulerFacade.tasks = new Map();
