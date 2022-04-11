import { WorkerContract } from "./queue";
import { RouteOptions, RouteContract } from "./router";
import { BoostrapInterface } from "./bootstrap";
export declare class App {
    protected boostrap: BoostrapInterface;
    routes: Map<string, RouteOptions>;
    isRunning: boolean;
    constructor(boostrap: BoostrapInterface);
    setRoutes(routeClasses: (new () => RouteContract)[]): Promise<number>;
    setWorkers(workerClasses: (new () => WorkerContract)[]): Promise<number>;
    protected bootProviders(): Promise<void>;
    protected bootNext(): Promise<void>;
    init(): void;
    boot(): Promise<void>;
    shutDown(): Promise<void>;
}
//# sourceMappingURL=app.d.ts.map