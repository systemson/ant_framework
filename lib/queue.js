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
exports.QueueEngineFacade = exports.BaseWorker = void 0;
const bullmq_1 = require("bullmq");
const helpers_1 = require("./helpers");
const logger_1 = require("./logger");
const StringUtils_1 = require("typeorm/util/StringUtils");
class BaseWorker {
    constructor() {
        this.id = 1;
        this.concurrency = parseInt((0, helpers_1.getEnv)("APP_QUEUE_JOB_CONCURRENCY", "1"));
    }
    setId(id) {
        this.id = id;
    }
    getId() {
        return this.id;
    }
    getQueueName() {
        return this.queueName || (0, StringUtils_1.snakeCase)((0, helpers_1.getEnv)("APP_DEFAULT_QUEUE", "default"));
    }
    getConnection() {
        if (typeof this.connection === "undefined") {
            this.connection = (0, helpers_1.redisInstance)();
        }
        return this.connection;
    }
    getOptions() {
        const options = {
            concurrency: this.concurrency,
            connection: this.getConnection(),
            prefix: (0, StringUtils_1.snakeCase)((0, helpers_1.getEnv)("APP_QUEUE_GROUP", "ant")),
        };
        return options;
    }
    dispatch(queueName, queuejob, data) {
        return QueueEngineFacade.queue(queueName).add(queuejob, data);
    }
    onCreated() {
    }
    onBooted() {
    }
    onCompleted(job) {
        logger_1.Logger.debug(helpers_1.Lang.__("Job [{{jobName}}(#{{jobId}})] successfully completed on [{{name}}(#{{id}}):{{queue}}].", this.getWorkerData(job)));
        logger_1.Logger.trace("Worker return: " + JSON.stringify(job.data, null, 4));
    }
    onProgress(job, progress) {
        logger_1.Logger.debug(JSON.stringify(job, null, 4));
        logger_1.Logger.trace(JSON.stringify(progress));
    }
    onFailed(job, failedReason) {
        logger_1.Logger.error(helpers_1.Lang.__("Job [{{jobName}}(#{{jobId}})] failed on [{{name}}(#{{id}}):{{queue}}].", this.getWorkerData(job)));
        (0, helpers_1.logCatchedError)(failedReason);
        logger_1.Logger.trace(JSON.stringify(job, null, 4));
    }
    onError() {
    }
    onDrained() {
        logger_1.Logger.audit(helpers_1.Lang.__("Worker [{{name}}(#{{id}}):{{queue}}] is empty.", this.getWorkerData()));
    }
    onDestroyed() {
    }
    getWorkerData(job) {
        var _a;
        return {
            name: this.constructor.name,
            id: this.getId().toString(),
            queue: this.getQueueName(),
            jobName: job === null || job === void 0 ? void 0 : job.name,
            jobId: (_a = job === null || job === void 0 ? void 0 : job.id) === null || _a === void 0 ? void 0 : _a.toString(),
        };
    }
}
exports.BaseWorker = BaseWorker;
class QueueEngineFacade {
    static bootQueue(name, queueOptions) {
        if (!QueueEngineFacade.instances.has(name)) {
            queueOptions = queueOptions || this.fallbackQueueOptions();
            const queue = new bullmq_1.Queue(name, queueOptions);
            QueueEngineFacade.instances.set(name, queue);
            if ((0, helpers_1.getEnv)("APP_QUEUE_RETRY_STRATEGY", "none") !== "none") {
                const queueSchedulerOptions = queueOptions;
                queueSchedulerOptions["maxStalledCount"] = 10;
                queueSchedulerOptions["stalledInterval"] = 1000;
                const Scheduler = new bullmq_1.QueueScheduler(name, queueSchedulerOptions);
                QueueEngineFacade.schedulers.set(name, Scheduler);
            }
        }
        return QueueEngineFacade;
    }
    static getInstance(name) {
        this.bootQueue(name);
        return QueueEngineFacade.instances.get(name);
    }
    static queue(name) {
        this.bootQueue(name);
        this.default = name;
        return QueueEngineFacade;
    }
    static add(jobName, data) {
        return this.dispatch(jobName, data);
    }
    static dispatch(jobName, data, jobOptions) {
        logger_1.Logger.debug(helpers_1.Lang.__("Dispatching Job [{{jobName}}] to queue [{{queue}}].", {
            jobName: jobName,
            queue: this.default || (0, StringUtils_1.snakeCase)((0, helpers_1.getEnv)("APP_DEFAULT_QUEUE"))
        }));
        logger_1.Logger.trace("Job data: " + JSON.stringify(data, null, 4));
        return QueueEngineFacade.getInstance(this.default || (0, StringUtils_1.snakeCase)((0, helpers_1.getEnv)("APP_DEFAULT_QUEUE"))).add(jobName, data, this.jobOptions(jobOptions));
    }
    static repeat(jobName, data, options) {
        return this.dispatch(jobName, data, this.jobOptions(options));
    }
    static jobOptions(options) {
        let backoff;
        if ((0, helpers_1.getEnv)("APP_QUEUE_RETRY_STRATEGY", "none") !== "none") {
            backoff = {
                type: (0, helpers_1.getEnv)("APP_QUEUE_RETRY_STRATEGY", "fixed"),
                delay: parseInt((0, helpers_1.getEnv)("APP_QUEUE_RETRY_DELAY", "1000")),
            };
        }
        const baseOptions = {
            removeOnComplete: (0, helpers_1.getEnv)("APP_QUEUE_REMOVE_COMPLETED") === "true",
            attempts: parseInt((0, helpers_1.getEnv)("APP_QUEUE_RETRIES", "3")),
            removeOnFail: (0, helpers_1.getEnv)("APP_QUEUE_REMOVE_FAILED") === "true",
            backoff: backoff,
        };
        return Object.assign(baseOptions, options);
    }
    static fallbackQueueOptions() {
        return {
            connection: (0, helpers_1.redisInstance)(),
            prefix: (0, StringUtils_1.snakeCase)((0, helpers_1.getEnv)("APP_QUEUE_GROUP", "ant")),
        };
    }
    static stop() {
        return new Promise((resolve) => {
            for (const instance of this.instances.values()) {
                logger_1.Logger.audit(helpers_1.Lang.__("Stoping queue [{{queue}}].", {
                    queue: instance.name,
                })).then(() => __awaiter(this, void 0, void 0, function* () {
                    yield instance.pause().then(() => __awaiter(this, void 0, void 0, function* () {
                        while ((yield instance.getActiveCount()) > 0) {
                            yield (0, helpers_1.sleep)(100);
                        }
                        resolve();
                    }));
                }));
            }
        });
    }
}
exports.QueueEngineFacade = QueueEngineFacade;
QueueEngineFacade.instances = new Map();
QueueEngineFacade.schedulers = new Map();
//# sourceMappingURL=queue.js.map