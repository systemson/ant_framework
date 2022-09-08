/// <reference types="node" />
import { Request as ExpressRequest, Response as ExpressResponse, RequestHandler } from "express";
import { Server } from "http";
import { ServiceContract } from "./service_provider";
export declare type RouterConfig = {
    scheme?: string;
    host?: string;
    port: string;
};
export declare function routerConfig(): RouterConfig;
export declare type Method = "get" | "post" | "put" | "patch" | "delete";
export declare type RouteOptions = {
    name?: string;
    method: Method;
    callback: RequestHandler;
};
export interface RouteContract extends ServiceContract {
    url: string;
    method: Method;
    handle(req: Request): Promise<Response> | Response;
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
    setHeaders(headers?: {
        [key: string]: string;
    }): Response;
    setHeader(name: string, value: string): Response;
    getHeaders(): any;
    send(response: ExpressResponse): ExpressResponse;
    json(data?: unknown, status?: number, headers?: {
        [key: string]: string;
    }): Response;
    xml(data?: unknown, status?: number, headers?: {
        [key: string]: string;
    }): Response;
    accepted(data?: unknown, headers?: {
        [key: string]: string;
    }): Response;
    unauthorized(data?: unknown, headers?: {
        [key: string]: string;
    }): Response;
    notFound(data?: unknown, headers?: {
        [key: string]: string;
    }): Response;
    error(data?: unknown, headers?: {
        [key: string]: string;
    }): Response;
}
export declare type Request = ExpressRequest;
export declare class ResponseContainer implements Response {
    protected content?: any;
    protected codeStatus: number;
    protected headers: any;
    setStatus(code?: number): Response;
    setData(data?: unknown): Response;
    setHeaders(headers?: {
        [key: string]: string;
    }): Response;
    getStatus(): number;
    getData(): unknown;
    setHeader(name: string, value: string): Response;
    getHeaders(): {
        [key: string]: string;
    };
    send(response: ExpressResponse): ExpressResponse;
    json(data?: unknown, status?: number, headers?: {
        [key: string]: string;
    }): Response;
    xml(data?: string, status?: number, headers?: {
        [key: string]: string;
    }): Response;
    accepted(data?: unknown, headers?: {
        [key: string]: string;
    }): Response;
    unauthorized(data?: unknown, headers?: {
        [key: string]: string;
    }): Response;
    notFound(data?: unknown, headers?: {
        [key: string]: string;
    }): Response;
    error(data?: unknown, headers?: {
        [key: string]: string;
    }): Response;
}
export declare function response(body?: unknown, code?: number, headers?: {}): Response;
export declare abstract class BaseRoute implements RouteContract {
    url: string;
    abstract method: Method;
    abstract handle(req: Request): Promise<Response> | Response;
    handler(req: Request): Promise<Response>;
    onCreated(): void;
    onBooted(): void;
    onCompleted(req: Request): void;
    onFailed(req: Request, error?: unknown): void;
    onError(error: unknown): void;
    onDestroyed(): void;
}
export declare class RouterFacade {
    protected static instance: Server;
    static setInstance(router: Server): RouterFacade;
    static getInstance(): Server;
}
//# sourceMappingURL=router.d.ts.map