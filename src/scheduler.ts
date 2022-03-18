/* eslint-disable no-console */
import { Lang, TIMESTAMP_FORMAT } from "./helpers";
import moment from "moment";
import cron, { ScheduledTask } from "node-cron";
import { Logger } from "./logger";

export interface TaskContract {
    /**
     *
     */
    cronExpression: string;

    /**
     * 
     */
    name: string;

    /**
     * The worker's concurrency ID.
     */
    id: number;

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

    handler(now: Date): Promise<void>;
}

export abstract class BaseTask implements TaskContract {
    public cronExpression = "* * * * * *";
    public abstract name: string;
    public id!: number;
    public isRunning = false;
    public delayedTimes = 0;
    public executedTimes = 0;

    abstract handler(now: Date): Promise<void>;
}

export class SchedulerFacade {
    public static cron = cron;

    public static tasks: Map<string, ScheduledTask> = new Map();

    public static schedule(scheduler: TaskContract): void {
        this.tasks.set(
            scheduler.name,
            this.cron.schedule(
                scheduler.cronExpression,
                (now: Date) => {
                    if (!scheduler.isRunning) {
                        scheduler.isRunning = true;

                        Logger.audit(Lang.__("Running task {{name}} at {{date}}", {
                            name: `${scheduler.constructor.name}`,
                            date: moment(now).format(TIMESTAMP_FORMAT),
                        }));
    
                        scheduler.handler(now).then(() => {
                            scheduler.isRunning = false;
                        });
                    } else {
                        Logger.audit(Lang.__("Waiting for task {{name}} to complete", {
                            name: `${scheduler.constructor.name}`,
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
