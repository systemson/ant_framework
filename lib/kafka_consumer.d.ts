import { Consumer, EachMessagePayload } from "kafkajs";
export interface ConsumerContract {
    groupId: string;
    topic: string;
    base: Consumer;
    handler(payload: EachMessagePayload): Promise<void>;
    boot(base: Consumer): Promise<void>;
    prepare(): void;
    onCompleted(): void;
    onFailed(error?: unknown): void;
}
export declare abstract class BaseConsumer implements ConsumerContract {
    groupId: string;
    topic: string;
    base: Consumer;
    boot(base: Consumer): Promise<void>;
    abstract handler(payload: EachMessagePayload): Promise<void>;
    prepare(): void;
    onCompleted(): void;
    onFailed(error?: unknown): void;
}
//# sourceMappingURL=kafka_consumer.d.ts.map