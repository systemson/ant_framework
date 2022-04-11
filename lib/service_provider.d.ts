import { BoostrapInterface } from "./bootstrap";
export interface ServiceProviderContract {
    boostrap: BoostrapInterface;
    boot(): Promise<void>;
}
export declare abstract class ServiceProvider implements ServiceProviderContract {
    boostrap: BoostrapInterface;
    constructor(boostrap: BoostrapInterface);
    abstract boot(): Promise<void>;
}
//# sourceMappingURL=service_provider.d.ts.map