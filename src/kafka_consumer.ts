import { Consumer, EachMessagePayload, KafkaMessage } from "kafkajs";
import moment from "moment";
import { snakeCase } from "typeorm/util/StringUtils";
import { dummyCallback, getEnv, logCatchedError, TIMESTAMP_FORMAT } from "./helpers";
import { Logger } from "./logger";

export interface ConsumerContract {
    groupId: string;
    topic: string;
    base: Consumer;

    handler(payload: EachMessagePayload): Promise<void>;
    boot(base: Consumer): Promise<void>;
    prepare(): void;

    onCompleted(message: KafkaMessage): void;
    onFailed(error?: unknown): void;
}

export abstract class BaseConsumer implements ConsumerContract {
    public topic = snakeCase(getEnv("KAFKA_DEFAULT_TOPIC", "my-topic"));

    public base!: Consumer;

    async boot(base: Consumer): Promise<void> {
        this.base = base;

        await this.base.connect().catch(logCatchedError);
        await this.base.subscribe({
            topic: this.topic,
            fromBeginning: true,
        });

        this.prepare();
    }

    abstract handler(payload: EachMessagePayload): Promise<void>;

    public prepare(): void {
        this.base.run({
            eachMessage:async (payload) => {
                const message = payload.message;
                Logger.debug(`Consuming message on [${this.constructor.name}] from topic [${payload.topic}(#${payload.partition})]`);

                return this.handler(payload)
                    .then(() => {
                        Logger.debug(`Message successfully consumed on [${this.constructor.name}] from topic [${payload.topic}(#${payload.partition})]`);

                        Logger.trace("Message consumed: " + JSON.stringify({
                            key: message.key?.toString(),
                            offset: message.offset,
                            message: message.value?.toString(),
                            headers: message.headers,
                            timestamp: moment(message.timestamp, "x").format(TIMESTAMP_FORMAT),
                        }, null, 4));

                        this.onCompleted(message);
                    }, error => {
                        logCatchedError(error);
                        this.onFailed(error);
                    })
                    .catch(logCatchedError)
                ;
            }
        });
    }

    public get groupId(): string {
        return `${snakeCase(this.constructor.name)}_group`;
    }

    onCompleted(message: KafkaMessage): void {
        dummyCallback(message);
    }

    onFailed(error?: unknown): void {
        dummyCallback(error);
    }
}
