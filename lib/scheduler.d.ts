import cron, { ScheduledTask } from "node-cron";
import { ServiceContract } from "./service_provider";
export interface TaskContract extends ServiceContract {
    cronExpression: string;
    name: string;
    isRunning: boolean;
    delayedTimes: number;
    executedTimes: number;
    handler(now: Date): Promise<void>;
    onCompleted(): void;
    onFailed(error?: unknown): void;
}
export declare abstract class BaseTask implements TaskContract {
    cronExpression: string;
    abstract name: string;
    isRunning: boolean;
    delayedTimes: number;
    executedTimes: number;
    abstract handler(now: Date): Promise<void>;
    onCreated(): void;
    onBooted(): void;
    onCompleted(): void;
    onFailed(error: Error): void;
    onError(error: Error): void;
    onDestroyed(): void;
}
export declare class SchedulerFacade {
    static cron: typeof cron;
    static tasks: Map<string, ScheduledTask>;
    static schedule(scheduler: TaskContract): void;
    static stop(name: string): void;
    static start(name: string): void;
}
//# sourceMappingURL=scheduler.d.ts.map