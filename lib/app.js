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
const helpers_1 = require("./helpers");
const os_1 = __importDefault(require("os"));
const router_1 = require("./router");
class App {
    constructor(boostrap) {
        this.boostrap = boostrap;
        this.isRunning = false;
        this.init();
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
                    logger_1.Logger.info(helpers_1.Lang.__("[{{name}}] application running.", { name: (0, helpers_1.getEnv)("APP_NAME") }));
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
            const server = router_1.RouterFacade.getInstance();
            if (server) {
                server.close();
            }
            resolve();
        });
    }
}
exports.App = App;
//# sourceMappingURL=app.js.map