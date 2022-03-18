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
exports.App = void 0;
const logger_1 = require("./logger");
const queue_1 = require("./queue");
const router_1 = require("./router");
const bullmq_1 = require("bullmq");
const helpers_1 = require("./helpers");
const os_1 = __importDefault(require("os"));
class App {
    constructor(boostrap) {
        this.boostrap = boostrap;
        this.routes = new Map();
        this.isRunning = false;
        this.init();
    }
    setRoutes(routeClasses) {
        return new Promise((resolve, reject) => {
            if (routeClasses.length > 0) {
                for (const routeClass of routeClasses) {
                    const instance = new routeClass();
                    const config = (0, router_1.routerConfig)();
                    const routeData = {
                        name: instance.constructor.name,
                        scheme: config.scheme || "http",
                        host: config.host || "localhost",
                        port: config.port,
                        endpoint: instance.url,
                        method: instance.method.toLocaleUpperCase(),
                    };
                    logger_1.Logger.audit(helpers_1.Lang.__("Preparing route [{{name}} => ({{method}}) {{scheme}}://{{host}}:{{port}}{{{endpoint}}}].", routeData));
                    const router = router_1.RouterFacade.getInstance();
                    router[instance.method](instance.url, (req, res) => {
                        logger_1.Logger.debug(helpers_1.Lang.__("Request received in [{{name}} => ({{method}}) {{scheme}}://{{host}}:{{port}}{{{endpoint}}}].", routeData));
                        logger_1.Logger.trace(helpers_1.Lang.__("Client request: ") + JSON.stringify({
                            url: req.url,
                            method: req.method,
                            clientIp: req.ip,
                            body: req.body,
                            query: req.query,
                            params: req.params,
                            headers: req.headers,
                        }, null, 4));
                        instance.doHandle(req)
                            .then((handler) => {
                            handler.send(res);
                            logger_1.Logger.debug(helpers_1.Lang.__("Request handled in [{{name}} => ({{method}}) {{scheme}}://{{host}}:{{port}}{{{endpoint}}}].", routeData));
                            logger_1.Logger.trace(helpers_1.Lang.__("Server response: ") + JSON.stringify(handler.getData(), null, 4));
                            instance.onCompleted(req);
                        }, (error) => {
                            res.status(500).send(error);
                            logger_1.Logger.error(helpers_1.Lang.__("Error handling a request in [{{name}} => ({{method}}) {{scheme}}://{{host}}:{{port}}{{{endpoint}}}].", routeData));
                            (0, helpers_1.logCatchedError)(error);
                            instance.onFailed(req);
                        }).catch((error) => {
                            res.status(500).send(error);
                            logger_1.Logger.error(helpers_1.Lang.__("Unhandled error on a request in [{{name}} => ({{method}}) {{scheme}}://{{host}}:{{port}}{{{endpoint}}}].", routeData));
                            (0, helpers_1.logCatchedError)(error);
                        });
                    });
                    logger_1.Logger.audit(helpers_1.Lang.__("Route [{{name}} => ({{method}}) {{scheme}}://{{host}}:{{port}}{{{endpoint}}}] is ready.", routeData));
                }
                resolve(routeClasses.length);
            }
            else {
                reject({
                    message: "No routes found.",
                });
            }
        });
    }
    setWorkers(workerClasses) {
        return new Promise((resolve, reject) => {
            if (workerClasses.length > 0) {
                for (const workerClass of workerClasses) {
                    for (let id = 0; id < parseInt((0, helpers_1.getEnv)("APP_QUEUE_WORKERS_CONCURRENCY", "1")); id++) {
                        const instance = new workerClass();
                        instance.setId(id + 1);
                        const queueName = instance.getQueueName();
                        logger_1.Logger.audit(helpers_1.Lang.__("Preparing worker [{{name}}(#{{id}}):{{queue}}].", {
                            name: instance.constructor.name,
                            queue: queueName,
                            id: instance.getId().toString()
                        }));
                        const queueOptions = instance.getOptions();
                        queue_1.QueueEngineFacade.bootQueue(queueName, queueOptions);
                        const concrete = new bullmq_1.Worker(queueName, (job) => {
                            logger_1.Logger.debug(helpers_1.Lang.__("Handling job [{{jobName}}#{{jobId}}] on [{{name}}:{{queue}}].", instance.getWorkerData(job)));
                            logger_1.Logger.trace(JSON.stringify(job, null, 4));
                            return instance.handler(job);
                        }, instance.getOptions());
                        concrete.on("completed", (job, returnValue) => {
                            instance.onCompleted(job, returnValue);
                        });
                        concrete.on("progress", (job, progress) => {
                            instance.onProgress(job, progress);
                        });
                        concrete.on("failed", (job, failedReason) => {
                            instance.onFailed(job, failedReason);
                        });
                        concrete.on("drained", () => instance.onDrained());
                        concrete.on("error", helpers_1.logCatchedError);
                        logger_1.Logger.audit(helpers_1.Lang.__("Worker [{{name}}(#{{id}}):{{queue}}] is ready.", {
                            name: instance.constructor.name,
                            queue: queueName,
                            id: instance.getId().toString()
                        }));
                        if ((0, helpers_1.getEnv)("APP_QUEUE_REMOVE_FAILED_ON_START") === "true") {
                            queue_1.QueueEngineFacade.getInstance(queueName).clean(5 * 60 * 1000, 0, "failed").then(() => {
                                resolve(workerClasses.length);
                            });
                        }
                        else {
                            resolve(workerClasses.length);
                        }
                    }
                }
            }
            else {
                reject({
                    message: "No workers found.",
                });
            }
        });
    }
    bootProviders() {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.audit("Service providers booting started.");
            while (this.boostrap.providers.length > 0) {
                yield this.bootNext();
            }
            logger_1.Logger.audit(helpers_1.Lang.__("Service providers booting completed."));
        });
    }
    bootNext() {
        return __awaiter(this, void 0, void 0, function* () {
            const providerClass = this.boostrap.providers.shift();
            const provider = new providerClass(this.boostrap);
            logger_1.Logger.audit(helpers_1.Lang.__("Botting service provider [{{name}}].", {
                name: provider.constructor.name,
            }));
            yield provider.boot().catch(helpers_1.logCatchedException);
            logger_1.Logger.audit(helpers_1.Lang.__("Service provider [{{name}}] booted.", {
                name: provider.constructor.name,
            }));
        });
    }
    init() {
    }
    boot() {
        return new Promise((resolve, rejects) => {
            logger_1.Logger.info(helpers_1.Lang.__("Node {{node}}-{{platform}}-{{arch}} | {{type}} {{release}} [{{env}}]", {
                node: process.version,
                platform: os_1.default.platform(),
                arch: os_1.default.arch(),
                release: os_1.default.release(),
                type: os_1.default.type(),
                env: helpers_1.NODE_ENV,
            }));
            logger_1.Logger.info(helpers_1.Lang.__("Starting [{{name}}] application.", { name: (0, helpers_1.getEnv)("APP_NAME") }));
            try {
                this.bootProviders().then(() => __awaiter(this, void 0, void 0, function* () {
                    logger_1.Logger.audit(helpers_1.Lang.__("Routes set up started."));
                    yield this.setRoutes(this.boostrap.routes)
                        .then((count) => {
                        logger_1.Logger.audit(helpers_1.Lang.__("Routes set up completed [{{count}}].", {
                            count: count.toString()
                        }));
                    }, (error) => {
                        logger_1.Logger.audit(helpers_1.Lang.__(error.message));
                    })
                        .catch(helpers_1.logCatchedException);
                    logger_1.Logger.audit(helpers_1.Lang.__("Workers set up started."));
                    yield this.setWorkers(this.boostrap.workers)
                        .then((count) => {
                        logger_1.Logger.audit(helpers_1.Lang.__("Workers set up completed [{{count}}].", {
                            count: count.toString()
                        }));
                    }, (error) => {
                        logger_1.Logger.audit(helpers_1.Lang.__(error.message));
                    })
                        .catch(helpers_1.logCatchedException);
                    logger_1.Logger.info(helpers_1.Lang.__("[{{name}}] application running.", { name: (0, helpers_1.getEnv)("APP_NAME") }));
                    this.isRunning = true;
                    resolve();
                })).catch(helpers_1.logCatchedException);
            }
            catch (error) {
                rejects(error);
            }
        });
    }
    shutDown() {
        return new Promise((resolve) => {
            logger_1.Logger.info("Gracefully shutting down the application.");
            resolve();
        });
    }
}
exports.App = App;
