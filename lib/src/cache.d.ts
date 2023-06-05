export interface CacheDriverContract {
    initDriver(): Promise<void>;
    set(key: string, value: unknown, ttl?: number): Promise<void>;
    has(key: string): Promise<boolean>;
    get(key: string, def?: unknown): Promise<any>;
    unset(key: string): Promise<void>;
}
export declare class FilesystemChacheDriver implements CacheDriverContract {
    baseDir: string;
    constructor(baseDir: string);
    initDriver(): Promise<void>;
    set(key: string, value: unknown, ttl?: number): Promise<void>;
    has(key: string): Promise<boolean>;
    get(key: string, def?: unknown): Promise<any>;
    unset(key: string): Promise<void>;
    protected getRealKey(key: string): string;
    protected getFileData(key: string): string;
    protected encode(data: unknown): string;
    protected decode(data: string): unknown;
}
export type RedisConfigContract = {
    url?: string;
    port: number;
    host: string;
    password: string;
    username?: string;
};
export declare class RedisChacheDriver implements CacheDriverContract {
    protected config: RedisConfigContract;
    private client;
    constructor(config: RedisConfigContract);
    initDriver(): Promise<void>;
    set(key: string, value: unknown, ttl?: number): Promise<void>;
    has(key: string): Promise<boolean>;
    get(key: string, def?: unknown): Promise<any>;
    unset(key: string): Promise<void>;
    protected getRealKey(key: string): string;
}
export declare class CacheFacade {
    protected static driver: CacheDriverContract;
    static setDriver(driver: CacheDriverContract): Promise<void>;
    static set(key: string, value: unknown, ttl?: number): Promise<void>;
    static has(key: string): Promise<boolean>;
    static get(key: string, def?: unknown): Promise<any>;
    static unset(key: string): Promise<void>;
    static call(key: string, callback: Promise<any>, ttl?: number): Promise<any>;
}
//# sourceMappingURL=cache.d.ts.map