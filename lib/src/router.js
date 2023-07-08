"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouterFacade = exports.BaseRoute = exports.response = exports.ResponseContainer = exports.BaseMiddleware = exports.routerConfig = void 0;
const helpers_1 = require("./helpers");
function routerConfig() {
    return {
        scheme: (0, helpers_1.getEnv)("APP_REST_SERVER_SCHEME", "http"),
        host: (0, helpers_1.getEnv)("APP_REST_SERVER_HOST", "localhost"),
        port: process.env.PORT || (0, helpers_1.getEnv)("APP_REST_SERVER_PORT", "3200"),
    };
}
exports.routerConfig = routerConfig;
class BaseMiddleware {
    handle(_req, _res, next) {
        next();
    }
}
exports.BaseMiddleware = BaseMiddleware;
class ResponseContainer {
    content;
    codeStatus = 200;
    headers = {};
    setStatus(code) {
        if (code) {
            this.codeStatus = code;
        }
        return this;
    }
    setData(data) {
        if (data) {
            this.content = data;
        }
        return this;
    }
    setHeaders(headers) {
        if (headers) {
            this.headers = headers;
        }
        return this;
    }
    getStatus() {
        return this.codeStatus;
    }
    getData() {
        return this.content;
    }
    setHeader(name, value) {
        this.headers[name] = value;
        return this;
    }
    getHeaders() {
        return this.headers;
    }
    send(response) {
        return response
            .status(this.getStatus())
            .header(this.getHeaders())
            .send(this.getData());
    }
    json(data, status = 200, headers = {}) {
        headers["Content-Type"] = "application/json";
        return this
            .setHeaders(headers)
            .setData(data)
            .setStatus(status);
    }
    xml(data, status = 200, headers = {}) {
        headers["Content-Type"] = "application/xml";
        return this
            .setHeaders(headers)
            .setData(data)
            .setStatus(status);
    }
    ok(data, headers = {}) {
        return this
            .setData(data)
            .setStatus(202)
            .setHeaders(headers);
    }
    created(data, headers = {}) {
        return this
            .setData(data)
            .setStatus(201)
            .setHeaders(headers);
    }
    accepted(data, headers = {}) {
        return this
            .setData(data)
            .setStatus(202)
            .setHeaders(headers);
    }
    unauthorized(data, headers = {}) {
        return this
            .setData(data)
            .setStatus(401)
            .setHeaders(headers);
    }
    forbidden(data, headers = {}) {
        return this
            .setData(data)
            .setStatus(403)
            .setHeaders(headers);
    }
    notFound(data, headers = {}) {
        return this
            .setData(data)
            .setStatus(404)
            .setHeaders(headers);
    }
    unprocessable(data, headers = {}) {
        return this
            .setData(data)
            .setStatus(422)
            .setHeaders(headers);
    }
    error(data, headers = {}) {
        return this
            .setData(data)
            .setStatus(500)
            .setHeaders(headers);
    }
    badGateway(data, headers = {}) {
        return this
            .setData(data)
            .setStatus(502)
            .setHeaders(headers);
    }
    unavailable(data, headers = {}) {
        return this
            .setData(data)
            .setStatus(503)
            .setHeaders(headers);
    }
}
exports.ResponseContainer = ResponseContainer;
function response(body, code = 200, headers = {}) {
    return (new ResponseContainer())
        .setData(body)
        .setStatus(code)
        .setHeaders(headers);
}
exports.response = response;
class BaseRoute {
    middlewares = [];
    handler(req) {
        const response = this.handle(req);
        if (response instanceof Promise) {
            return response;
        }
        return new Promise((resolve) => {
            resolve(response);
        });
    }
    onCreated() {
    }
    onBooted() {
    }
    onCompleted(req) {
        return (0, helpers_1.dummyCallback)(req);
    }
    onFailed(req, error) {
        return (0, helpers_1.dummyCallback)(req, error);
    }
    onError(error) {
        return (0, helpers_1.dummyCallback)(error);
    }
    onDestroyed() {
    }
}
exports.BaseRoute = BaseRoute;
class RouterFacade {
    static instance;
    static setInstance(router) {
        this.instance = router;
        return RouterFacade;
    }
    static getInstance() {
        return this.instance;
    }
}
exports.RouterFacade = RouterFacade;
//# sourceMappingURL=router.js.map