import { WorkerContract } from "./queue";
import { RouteContract } from "./router";
import { ServiceProviderContract } from "./service_provider";
export interface BoostrapInterface {
    providers: (new () => ServiceProviderContract)[];
    routes: (new () => RouteContract)[];
    workers: (new () => WorkerContract)[];
}
