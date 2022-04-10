import { Consumer, EachMessagePayload } from "kafkajs";
import moment from "moment";
import { getEnv, logCatchedError, TIMESTAMP_FORMAT } from "./helpers";
import { Logger } from "./logger";

export interface ConsumerContract {
    groupId: string;
    topic: string;
    base: Consumer;

    handler(payload: EachMessagePayload): Promise<void>;
    prepareConsumer(): Promise<void>;
    doHandle(): void;
    error(error: Error): void;
}

export abstract class BaseConsumer {
    groupId = getEnv("KAFKA_CONSUMER_GROUP_ID", "my-group");
    topic = getEnv("KAFKA_DEFAULT_TOPIC", "my-topic");

    constructor(public base: Consumer) { }

    async prepareConsumer(): Promise<void> {
        await this.base.connect().catch(logCatchedError);
        await this.base.subscribe({
            topic: this.topic,
            fromBeginning: true,
        });
    }

    abstract handler(payload: EachMessagePayload): Promise<void>;

    public doHandle(): void {
        this.base.run({
            eachMessage:async (payload) => {
                const message = payload.message;
                Logger.info(`Consuming message on [${this.constructor.name}] from topic [${payload.topic}(#${payload.partition})]`);

                return this.handler(payload)
                    .then(() => {
                        Logger.info(`Message successfully consumed on [${this.constructor.name}] from topic [${payload.topic}(#${payload.partition})]`);

                        Logger.trace("Message consumed: " + JSON.stringify({
                            key: message.key?.toString(),
                            offset: message.offset,
                            message: message.value?.toString(),
                            headers: message.headers,
                            timestamp: moment(message.timestamp, "x").format(TIMESTAMP_FORMAT),
                        }, null, 4));
                    }, error => {
                        this.error(error);
                    })
                    .catch(logCatchedError)
                ;
            }
        });
    }

    public error(error: Error): void {
        logCatchedError(error);
    }
}
