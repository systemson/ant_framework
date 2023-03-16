/// <reference types="node" />
import { EventEmitter as NodeEventEmitter } from 'events';
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
export declare class NodeEmitterDriver extends NodeEventEmitter implements EventEmitterDriverContract {
}
export interface ListenerContract extends ServiceContract {
    eventName: string;
}
export declare abstract class BaseListener implements ListenerContract {
    abstract eventName: string;
    abstract handler(...args: any[]): void;
    onCreated(): void;
    onBooted(): void;
    onCompleted(): void;
    onFailed(error: Error): void;
    onError(error: Error): void;
    onDestroyed(): void;
}
export declare class EventEmitter {
    static driver: EventEmitterDriverContract;
    static listen(event: string | string[], listener: ListenerContract): void;
    static emit(event: string, ...args: any[]): void;
}
//# sourceMappingURL=events.d.ts.map