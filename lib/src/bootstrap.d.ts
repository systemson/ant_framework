import { ConsumerContract } from "..";
import { ListenerContract } from "./events";
import { WorkerContract } from "./queue";
import { RouteContract } from "./router";
import { TaskContract } from "./scheduler";
import { ServiceProviderContract } from "./service_provider";
export interface BoostrapInterface {
    providers: (new (boostrap: BoostrapInterface) => ServiceProviderContract)[];
    routes: (new () => RouteContract)[];
    workers: (new () => WorkerContract)[];
    consumers: (new () => ConsumerContract)[];
    tasks: (new () => TaskContract)[];
    listeners: (new () => ListenerContract)[];
}
//# sourceMappingURL=bootstrap.d.ts.map