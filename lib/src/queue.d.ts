import { Job, JobsOptions, Queue, QueueOptions, QueueScheduler, RepeatOptions, WorkerOptions } from "bullmq";
import { Redis } from "ioredis";
export interface WorkerContract {
    id: number;
    concurrency: number;
    setId(id: number): void;
    getId(): number;
    getQueueName(): string;
    getOptions(): WorkerOptions;
    handler(job: Job): any;
    handleFailed(job: Job, failedReason: string): void;
    getWorkerData(job?: Job, data?: unknown, id?: number): {
        name: string;
        id: string;
        queue: string;
        jobName?: string;
        jobId?: string;
        data?: string;
    };
    onCompleted(job: Job, returnValue: unknown): void;
    onProgress(job: Job, progress: number | unknown): void;
    onFailed(job: Job, failedReason: Error): void;
    onDrained(): void;
}
export declare abstract class BaseWorker implements WorkerContract {
    id: number;
    protected queueName: string;
    concurrency: number;
    connection: Redis;
    abstract handler(job: Job): any;
    setId(id: number): void;
    getId(): number;
    getQueueName(): string;
    protected getConnection(): Redis;
    getOptions(): WorkerOptions;
    protected dispatch(queueName: string, queuejob: string, data: unknown): Promise<unknown>;
    handleFailed(job: Job, failedReason: string): void;
    onCompleted(job: Job, returnValue: unknown): void;
    onProgress(job: Job<any, any, string>, progress: unknown): void;
    onFailed(job: Job, failedReason: Error): void;
    onDrained(): void;
    getWorkerData(job?: Job, data?: unknown): {
        name: string;
        id: string;
        queue: string;
        jobName?: string;
        jobId?: string;
        data?: string;
    };
}
export declare class QueueEngineFacade {
    protected static instances: Map<string, Queue>;
    protected static schedulers: Map<string, QueueScheduler>;
    protected static default: string;
    static bootQueue(name: string, queueOptions?: QueueOptions): typeof QueueEngineFacade;
    static getInstance(name: string): Queue;
    static queue(name: string): typeof QueueEngineFacade;
    static add(jobName: string, data: unknown): Promise<unknown>;
    static dispatch(jobName: string, data: unknown, jobOptions?: JobsOptions): Promise<unknown>;
    static repeat(jobName: string, data: unknown, options: RepeatOptions): Promise<unknown>;
    private static jobOptions;
    private static fallbackQueueOptions;
    static stop(): Promise<void>;
}
