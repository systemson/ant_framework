import { ConsumerContract } from "..";
import { ListenerContract } from "./events";
import { WorkerContract } from "./queue";
import { RouteContract } from "./router";
import { TaskContract } from "./scheduler";
import { ServiceProviderContract } from "./service_provider";

export interface BoostrapInterface {
    /**
     * The declared application's service providers.
     */
    providers: (new(boostrap: BoostrapInterface) => ServiceProviderContract)[];

    /**
     * The declared application's routes. 
     */
    routes:  (new() => RouteContract)[];

    /**
     * The declared application's workers. 
     */
    workers: (new() => WorkerContract)[];

    /**
     * The declared application's workers. 
     */
    consumers: (new() => ConsumerContract)[];

    /**
     * The declared application's tasks. 
     */
    tasks: (new() => TaskContract)[];

    /**
     * The declared application's event listeners. 
     */
    listeners: (new() => ListenerContract)[];
}
