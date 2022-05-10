import { BoostrapInterface } from "./bootstrap";
export declare class App {
    protected boostrap: BoostrapInterface;
    isRunning: boolean;
    constructor(boostrap: BoostrapInterface);
    protected bootProviders(): Promise<void>;
    protected bootNext(): Promise<void>;
    init(): void;
    boot(): Promise<void>;
    shutDown(): Promise<void>;
}
//# sourceMappingURL=app.d.ts.map