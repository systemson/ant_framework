import { Consumer, EachMessagePayload } from "kafkajs";
export interface ConsumerContract {
    groupId: string;
    topic: string;
    base: Consumer;
    handler(payload: EachMessagePayload): Promise<void>;
    prepareConsumer(): Promise<void>;
    doHandle(): void;
    error(error: Error): void;
}
export declare abstract class BaseConsumer {
    base: Consumer;
    groupId: string;
    topic: string;
    constructor(base: Consumer);
    prepareConsumer(): Promise<void>;
    abstract handler(payload: EachMessagePayload): Promise<void>;
    doHandle(): void;
    error(error: Error): void;
}