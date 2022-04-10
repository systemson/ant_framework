import { Consumer, EachMessagePayload } from "kafkajs";
export interface ConsumerContract {
    groupId: string;
    topic: string;
    base: Consumer;
    handler(payload: EachMessagePayload): Promise<void>;
    prepareConsumer(base: Consumer): Promise<void>;
    doHandle(): void;
    error(error: Error): void;
}
export declare abstract class BaseConsumer implements ConsumerContract {
    groupId: string;
    topic: string;
    base: Consumer;
    prepareConsumer(base: Consumer): Promise<void>;
    abstract handler(payload: EachMessagePayload): Promise<void>;
    doHandle(): void;
    error(error: Error): void;
}
//# sourceMappingURL=kafka_consumer.d.ts.map