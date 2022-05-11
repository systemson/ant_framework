import { Consumer, EachMessagePayload, KafkaMessage } from "kafkajs";
import { snakeCase } from "typeorm/util/StringUtils";
import { dummyCallback, logCatchedError } from "./helpers";
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

export abstract class BaseConsumer implements ConsumerContract {
    public abstract topic: string;

    public base!: Consumer;

    async boot(base: Consumer): Promise<Consumer> {
        this.base = base;

        await this.base.connect().catch(logCatchedError);
        await this.base.subscribe({
            topic: this.topic,
            fromBeginning: false,
        });

        return base;
    }

    public abstract handler(value: unknown, payload: EachMessagePayload): Promise<void>;

    public onCreated(): void {
        //
    }

    public onBooted(): void {
        //
    }

    public get groupId(): string {
        return `${snakeCase(this.constructor.name)}_group`;
    }

    public onCompleted(message: KafkaMessage): void {
        dummyCallback(message);
    }

    public onFailed(message: KafkaMessage, error?: unknown): void {
        dummyCallback(error, message);
    }

    public onError(error?: unknown): void {
        dummyCallback(error);
    }

    public onDestroyed(): void {
        //
    }
}
