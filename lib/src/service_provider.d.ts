import { BoostrapInterface } from "./bootstrap";
export interface ServiceProviderContract {
    boostrap: BoostrapInterface;
    boot(): Promise<void>;
    destroy(): Promise<void>;
}
export declare abstract class ServiceProvider implements ServiceProviderContract {
    boostrap: BoostrapInterface;
    constructor(boostrap: BoostrapInterface);
    abstract boot(): Promise<void>;
    destroy(): Promise<void>;
}
export interface ServiceContract {
    onCreated(...args: any[]): any;
    handler(...args: any[]): any;
    onBooted(...args: any[]): any;
    onCompleted(...args: any[]): any;
    onFailed(...args: any[]): any;
    onError(...args: any[]): any;
    onDestroyed(...args: any[]): any;
}
//# sourceMappingURL=service_provider.d.ts.map