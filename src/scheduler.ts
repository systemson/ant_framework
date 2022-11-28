/* eslint-disable no-console */
import { dummyCallback, Lang, logCatchedError, now, TIMESTAMP_FORMAT } from "./helpers";
import moment from "moment";
import cron, { ScheduledTask } from "node-cron";
import { Logger } from "./logger";
import { ServiceContract } from "./service_provider";

export interface TaskContract extends ServiceContract {
    /**
     *
     */
    cronExpression: string;

    /**
     * 
     */
    name: string;

    /**
     * The task's concurrency ID.
     */
    id: number;

    /**
     * Amount of task running in parallel.
     */
    concurrency: number;

    /**
     * Wether the taks is still running or not
     */
    isRunning: boolean;

    /**
     * How many times the Taks is delayed;
     */
    delayedTimes: number;

    /**
     * How many times the Taks is executed;
     */
    executedTimes: number;

    /**
     * Sets the task's concurrency ID.
     * 
     * @param id 
     */
    setId(id: number): void;

    /**
     * Gets the task's concurrency ID.
     */
    getId(): number;

    handler(): Promise<void>;

    onCompleted(): void;

    onFailed(error?: unknown): void;
}

export abstract class BaseTask implements TaskContract {
    public cronExpression = "* * * * * *";
    public abstract name: string;
    public isRunning = false;
    public delayedTimes = 0;
    public executedTimes = 0;
    public id = 0;
    public concurrency = 1;

    abstract handler(): Promise<void>;

    public onCreated(): void {
        //
    }

    public onBooted(): void {
        //
    }

    public onCompleted(): void {
        //
    }

    public onFailed(error: Error): void {
        dummyCallback(error);
    }

    public onError(error: Error): void {
        dummyCallback(error);
    }

    public onDestroyed(): void {
        //
    }

    public setId(id: number): void {
        this.id = id;
    }

    public getId(): number {
        return this.id;
    }
}

export class SchedulerFacade {
    public static cron = cron;

    public static tasks: Map<string, ScheduledTask> = new Map();

    public static schedule(scheduler: TaskContract): void {
        this.tasks.set(
            scheduler.name,
            this.cron.schedule(
                scheduler.cronExpression,
                () => {
                    if (!scheduler.isRunning) {
                        scheduler.isRunning = true;

                        Logger.audit(Lang.__("Running task [{{name}}(#{{id}})] at [{{date}}]", {
                            name: `${scheduler.constructor.name}`,
                            id: scheduler.id.toString(),
                            date: moment(now()).format(TIMESTAMP_FORMAT),
                        }));
    
                        scheduler.handler().then(() => {
                            scheduler.isRunning = false;
                            scheduler.delayedTimes = 0;
                            scheduler.executedTimes++;

                            Logger.audit(Lang.__("Task [{{name}}(#{{id}})] completed successfully at [{{date}}]", {
                                name: `${scheduler.constructor.name}`,
                                id: scheduler.id.toString(),
                                date: moment().format(TIMESTAMP_FORMAT),
                            }));

                            scheduler.onCompleted();
                        }, (error: Error) => {
                            logCatchedError(error);
                            scheduler.isRunning = false;
                            scheduler.delayedTimes = 0;
                            scheduler.executedTimes = 0;

                            scheduler.onFailed(error);
                        })
                            .catch((error) => {
                                logCatchedError(error);
                                scheduler.isRunning = false;
                                scheduler.delayedTimes = 0;
                                scheduler.executedTimes = 0;
                            })
                        ;
                    } else {
                        scheduler.delayedTimes++;
                        scheduler.executedTimes = 0;

                        Logger.audit(Lang.__("Waiting for task [{{name}}(#{{id}})]-[({{times}})] to complete", {
                            name: `${scheduler.constructor.name}`,
                            id: scheduler.id.toString(),
                            times: scheduler.delayedTimes.toString(),
                        }));
                    }
                }
            )
        );
        
    }

    public static stop(name: string): void {
        if (this.tasks.has(name)) {
            this.tasks.get(name)?.stop();
        }
    }

    public static start(name: string): void {
        if (this.tasks.has(name)) {
            this.tasks.get(name)?.start();
        }
    }
}


