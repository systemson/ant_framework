import { Logger } from "./logger";
import { getEnv, Lang, logCatchedException, NODE_ENV } from "./helpers";
import { ServiceProviderContract } from "./service_provider";
import { BoostrapInterface } from "./bootstrap";
import os from "os";
import { RouterFacade } from "./router";

export class App {
    public isRunning = false;

    constructor(
        protected boostrap: BoostrapInterface,
    ) {
        this.init();
    }

    /**
     * 
     */
    protected async bootProviders(): Promise<void> {
        Logger.audit("Service providers booting started.");

        while (this.boostrap.providers.length > 0) {
            await this.bootNext();
        }

        Logger.audit(Lang.__("Service providers booting completed."));
    }

    /**
     *
     */
    protected async bootNext(): Promise<void> {
        const providerClass = this.boostrap.providers.shift() as new(boostrap: BoostrapInterface) =>  ServiceProviderContract;
        const provider = new providerClass(this.boostrap);

        Logger.audit(Lang.__("Botting service provider [{{name}}].", {
            name: provider.constructor.name,
        }));

        await provider.boot().catch(logCatchedException);
        Logger.audit(Lang.__("Service provider [{{name}}] booted.", {
            name: provider.constructor.name,
        }));
    }


    /**
     * Prepares the application.
     */
    public init(): void {
        //
    }

    /**
     * Sets ready the application's components.
     */
    public boot(): Promise<void> {
        return new Promise((resolve, rejects) => {
            Logger.info(Lang.__("Node {{node}}-{{platform}}-{{arch}} | {{type}} {{release}} [{{env}}]", {
                node: process.version,
                platform: os.platform(),
                arch: os.arch(),
                release: os.release(),
                type: os.type(),
                env: NODE_ENV,
            }));

            Logger.info(Lang.__("Starting [{{name}}] application.", { name: getEnv("APP_NAME") }));

            try {
                this.bootProviders().then(async () => {
                    Logger.info(Lang.__("[{{name}}] application running.", { name: getEnv("APP_NAME") }));
                    resolve();
                }).catch(logCatchedException);

            } catch (error) {
                rejects(error);
            }
        });
    }

    /**
     * Gracefully shuts down the applicxations
     * 
     * @todo MUST validate that no workers are running before shut down.
     */
    public shutDown(): Promise<void> {
        return new Promise((resolve) => {
            Logger.info("Gracefully shutting down the application.");

            const server = RouterFacade.getInstance();

            if (server) {
                server.close();
            }

            resolve();

            /*
            if (this.isRunning) {
                QueueEngineFacade.stop().then(resolve);
            } else {
            }
            */
        });
    }
}
