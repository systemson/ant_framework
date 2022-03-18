import { BoostrapInterface } from "./bootstrap";

export interface ServiceProviderContract {
    boostrap: BoostrapInterface;

    boot(): Promise<void>;
}

export abstract class ServiceProvider implements ServiceProviderContract {
    constructor(public boostrap: BoostrapInterface) { }

    abstract boot(): Promise<void>;
}
