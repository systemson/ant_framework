import cron, { ScheduledTask } from "node-cron";
export interface TaskContract {
    cronExpression: string;
    name: string;
    id: number;
    isRunning: boolean;
    delayedTimes: number;
    executedTimes: number;
    handler(now: Date): Promise<void>;
}
export declare abstract class BaseTask implements TaskContract {
    cronExpression: string;
    abstract name: string;
    id: number;
    isRunning: boolean;
    delayedTimes: number;
    executedTimes: number;
    abstract handler(now: Date): Promise<void>;
}
export declare class SchedulerFacade {
    static cron: typeof cron;
    static tasks: Map<string, ScheduledTask>;
    static schedule(scheduler: TaskContract): void;
    static stop(name: string): void;
    static start(name: string): void;
}
