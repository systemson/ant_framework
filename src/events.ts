import { EventEmitter as NodeEventEmitter } from "events";
import { dummyCallback, Lang, logCatchedError } from "./helpers";
import { Logger } from "./logger";
import { ServiceContract } from "./service_provider";

export type Listener = Function;

export interface EventEmitterDriverContract {
    addListener(event: string | symbol, listener: Listener): this;
    removeListener(event: string | symbol, listener: Listener): this;
    removeAllListeners(event?: string | symbol): this;
    setMaxListeners(n: number): this;
    getMaxListeners(): number;
    listeners(event: string | symbol): Listener[];
    rawListeners(event: string | symbol): Listener[];
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

    static listen(event: string | string[], listener: ListenerContract): EventEmitter {
        if (Array.isArray(event)) {
            this.listen(event, listener);
        } else {
            const logData = {
                eventName: listener.eventName,
                listener: listener.constructor.name,
            };

            Logger.audit(Lang.__("Suscribed to event [{{eventName}}] by [{{listener}}].", logData));

            try {
                this.driver.addListener(event, (...args: any[]) => {
                    listener.handler(...args);

                    Logger.audit(Lang.__("Event [{{eventName}}] handled by [{{listener}}].", logData));
                });

                Logger.audit(Lang.__("Suscribed to event [{{eventName}}] by [{{listener}}].", logData));
            } catch (error) {
                Logger.error(Lang.__("Error handling event [{{eventName}}] by [{{listener}}].", logData));
                logCatchedError(error as any);
                throw error;
            }
        }

        return this;
    }

    static emit(event: string, ...args: any[]): void {
        try {
            Logger.audit(Lang.__("Emiting event [{{eventName}}].", {
                eventName: event,
            }));

            EventEmitter.driver.emit(event, ...args);
        } catch (error) {
            Logger.audit(Lang.__("Error emiting event [{{eventName}}].", {
                eventName: event,
            }));

            logCatchedError(error as any);
            throw error;
        }
    }
}
