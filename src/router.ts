import { Request as ExpressRequest, Response as ExpressResponse, RequestHandler } from "express";
import { Server } from "http";
import { dummyCallback, getEnv } from "./helpers";
import { ServiceContract } from "./service_provider";

export type RouterConfig = {
    scheme?: string;
    host?: string;
    port: string;
}

export function routerConfig(): RouterConfig {
    return {
        scheme: getEnv("APP_REST_SERVER_SCHEME", "http"),
        host: getEnv("APP_REST_SERVER_HOST", "localhost"),
        port: process.env.PORT || getEnv("APP_REST_SERVER_PORT", "3200"),
    };
}

/**
 * The HTTP Rest methods.
 */
export type Method = "get" | "post" | "put" | "patch" | "delete";

export type RouteOptions = {
    name?: string;
    method: Method,
    callback: RequestHandler,
}

export interface RouteContract extends ServiceContract {
    url: string | string[];
    method: Method;

    handle(req: Request):  Promise<Response> | Response;
    
    handler(req: Request): Promise<Response>;

    onCompleted(req: Request): void;

    onFailed(req: Request, error?: unknown): void;

    onError(error?: unknown): void;
}

export interface Response {
    setData(data?: unknown): Response;
    getData(): unknown;

    setStatus(code?: number): Response;
    getStatus(): number;

    setHeaders(headers?:  {
        [key: string]: string;
    }): Response;
    setHeader(name: string, value: string): Response;
    getHeaders(): any;

    send(response: ExpressResponse): ExpressResponse;

    json(data?: unknown, status?: number, headers?: {[key: string]: string;}): Response;
    xml(data?: unknown, status?: number, headers?: {[key: string]: string;}): Response;

    accepted(data?: unknown, headers?: {[key: string]: string;}): Response;

    unauthorized(data?: unknown, headers?: {[key: string]: string;}): Response;

    notFound(data?: unknown, headers?: {[key: string]: string;}): Response;

    error(data?: unknown, headers?: {[key: string]: string;}): Response;
}

export type Request = ExpressRequest

export class ResponseContainer implements Response {
    protected content?: any;

    protected codeStatus = 200;

    protected headers: any = {};

    setStatus(code?: number): Response {
        if (code) {
            this.codeStatus = code;
        }

        return this;
    }

    setData(data?: unknown): Response {
        if (data) {
            this.content = data;
        }

        return this;
    }

    setHeaders(headers?: {
        [key: string]: string;
    }): Response {
        if (headers) {
            this.headers = headers;
        }

        return this;
    }

    getStatus(): number {
        return this.codeStatus;
    }

    getData(): unknown {
        return this.content;
    }

    setHeader(name: string, value: string): Response {
        this.headers[name] = value;

        return this;
    }

    getHeaders(): {
        [key: string]: string;
        } {
        return this.headers;
    }

    send(response: ExpressResponse): ExpressResponse {
        return response
            .status(this.getStatus())
            .header(this.getHeaders())
            .send(this.getData())
        ;
    }
    
    json(data?: unknown, status = 200, headers: {[key: string]: string;} = {}): Response {
        headers["Content-Type"] = "application/json";

        return this
            .setHeaders(headers)
            .setData(data)
            .setStatus(status)
        ;
    }

    xml(data?: string, status = 200, headers: {[key: string]: string;} = {}): Response {
        headers["Content-Type"] = "application/xml";

        return this
            .setHeaders(headers)
            .setData(data)
            .setStatus(status)
        ;
    }

    accepted(data?: unknown, headers: {[key: string]: string;} = {}): Response {
        return this
            .setData(data)
            .setStatus(202)
            .setHeaders(headers)
        ;
    }

    unauthorized(data?: unknown, headers: {[key: string]: string;} = {}): Response {
        return this
            .setData(data)
            .setStatus(401)
            .setHeaders(headers)
        ;
    }

    notFound(data?: unknown, headers: {[key: string]: string;} = {}): Response {
        return this
            .setData(data)
            .setStatus(404)
            .setHeaders(headers)
        ;
    }

    error(data?: unknown, headers: {[key: string]: string;} = {}): Response {
        return this
            .setData(data)
            .setStatus(500)
            .setHeaders(headers)
        ;
    }
}

export function response(
    body?: unknown,
    code = 200,
    headers = {}
): Response {
    return (new ResponseContainer())
        .setData(body)
        .setStatus(code)
        .setHeaders(headers)
    ;
}

export abstract class BaseRoute implements RouteContract {
    abstract url: string | string[];

    abstract method: Method;

    abstract handle(req: Request): Promise<Response> | Response;

    handler(req: Request): Promise<Response> {
        const response = this.handle(req);

        if (response instanceof Promise) {
            return response;
        }

        return new Promise((resolve) => {
            resolve(response as Response);
        });
    }

    onCreated(): void {
        //
    }

    onBooted(): void {
        //
    }

    onCompleted(req: Request): void {
        return dummyCallback(req);
    }

    onFailed(req: Request, error?: unknown): void {
        return dummyCallback(req, error);
    }

    onError(error: unknown): void {
        return dummyCallback(error);
    }

    onDestroyed(): void {
        //
    }
}

export class RouterFacade {
    protected static instance: Server;

    public static setInstance(router: Server): RouterFacade {
        this.instance = router;

        return RouterFacade;
    }

    public static getInstance(): Server {
        return this.instance;
    }
}
