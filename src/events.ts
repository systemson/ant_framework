import { EventEmitter as NodeEventEmitter } from 'events';
import { dummyCallback, Lang, logCatchedError } from './helpers';
import { Logger } from './logger';
import { ServiceContract } from './service_provider';

export interface EventEmitterDriverContract {
    addListener(event: string | symbol, listener: (...args: any[]) => void): this;
    removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string | symbol): this;
    setMaxListeners(n: number): this;
    getMaxListeners(): number;
    listeners(event: string | symbol): Function[];
    rawListeners(event: string | symbol): Function[];
    emit(event: string | symbol, ...args: any[]): boolean;
    listenerCount(event: string | symbol): number;
    eventNames(): Array<string | symbol>;
}

export class NodeEmitterDriver extends NodeEventEmitter implements EventEmitterDriverContract { }

export interface ListenerContract extends ServiceContract {
    eventName: string;
}

export abstract class BaseListener implements ListenerContract {
    abstract eventName: string;

    abstract handler(...args: any[]): void;

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
}

export class EventEmitter {
    public static driver: EventEmitterDriverContract;

    static listen(event: string | string[], listener: ListenerContract) {
        if (Array.isArray(event)) {
            this.listen(event, listener);
        } else {
            try {
                this.driver.addListener(event, (...args: any[]) => {
                    listener.handler(...args);

                    Logger.audit(Lang.__("Event [{{eventName}}] handled by [{{listener}}]", {
                        eventName: listener.eventName,
                        listener: listener.constructor.name,
                    }));
                });
            } catch (error) {
                logCatchedError(error as any);
                throw error;
            }
        }
    }

    static emit(event: string, ...args: any[]) {
        try {
            EventEmitter.driver.emit(event, ...args);
        } catch (error) {
            logCatchedError(error as any);
            throw error;
        }
    }
}
