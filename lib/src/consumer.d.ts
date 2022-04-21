import { Consumer, EachMessagePayload, KafkaMessage } from "kafkajs";
export interface ConsumerContract {
    groupId: string;
    topic: string;
    base: Consumer;
    handler(value: unknown, payload: EachMessagePayload): Promise<void>;
    boot(base: Consumer): Promise<void>;
    prepare(): void;
    onCompleted(message: KafkaMessage): void;
    onFailed(message: KafkaMessage, error?: unknown): void;
}
export declare abstract class BaseConsumer implements ConsumerContract {
    abstract topic: string;
    base: Consumer;
    boot(base: Consumer): Promise<void>;
    abstract handler(value: unknown, payload: EachMessagePayload): Promise<void>;
    prepare(): void;
    get groupId(): string;
    onCompleted(message: KafkaMessage): void;
    onFailed(message: KafkaMessage, error?: unknown): void;
}
//# sourceMappingURL=consumer.d.ts.map