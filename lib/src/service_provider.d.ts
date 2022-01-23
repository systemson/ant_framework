export interface ServiceProviderContract {
    boot(): Promise<void>;
}
export declare abstract class ServiceProvider implements ServiceProviderContract {
    abstract boot(): Promise<void>;
}
