import { Consumer, EachMessagePayload, KafkaMessage } from "kafkajs";
import { ServiceContract } from "./service_provider";
export interface ConsumerContract extends ServiceContract {
    groupId: string;
    topic: string;
    base: Consumer;
    handler(value: unknown, payload: EachMessagePayload): Promise<void>;
    boot(base: Consumer): Promise<Consumer>;
    onCompleted(message: KafkaMessage): void;
    onFailed(message: KafkaMessage, error?: unknown): void;
}
export declare abstract class BaseConsumer implements ConsumerContract {
    abstract topic: string;
    base: Consumer;
    boot(base: Consumer): Promise<Consumer>;
    abstract handler(value: unknown, payload: EachMessagePayload): Promise<void>;
    onCreated(): void;
    onBooted(): void;
    get groupId(): string;
    onCompleted(message: KafkaMessage): void;
    onFailed(message: KafkaMessage, error?: unknown): void;
    onError(error?: unknown): void;
    onDestroyed(): void;
}
//# sourceMappingURL=consumer.d.ts.map