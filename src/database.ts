import {
    ConnectionOptions,
    DatabaseType,
    DefaultNamingStrategy,
    NamingStrategyInterface,
    Table,
    Logger as TypeOrmLogContract,
} from "typeorm";
import { snakeCase } from "typeorm/util/StringUtils";
import {
    getEnv,
    Lang,
    timestamp
} from "./helpers";
import { ConsoleLogger } from "./logger";

export class SnakeCaseNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
    tableName(className: string, customName: string): string {
        return customName ? customName : snakeCase(className);
    }

    columnName(
        propertyName: string,
        customName: string
    ): string {
        return customName ? customName : snakeCase(propertyName);
    }

    relationName(propertyName: string): string {
        return snakeCase(propertyName);
    }

    joinColumnName(relationName: string, referencedColumnName: string): string {
        return snakeCase(relationName + "_" + referencedColumnName);
    }

    joinTableName(
        firstTableName: string,
        secondTableName: string,
        firstPropertyName: string,
    ): string {
        return snakeCase(
            firstTableName +
            "_" +
            firstPropertyName.replace(/\./gi, "_") +
            "_" +
            secondTableName,
        );
    }

    joinTableColumnName(
        tableName: string,
        propertyName: string,
        columnName?: string,
    ): string {
        return snakeCase(
            tableName + "_" + (columnName ? columnName : propertyName),
        );
    }

    joinTableInverseColumnName(
        tableName: string,
        propertyName: string,
        columnName?: string,
    ): string {
        return snakeCase(
            tableName + "_" + (columnName ? columnName : propertyName),
        );
    }

    primaryKeyName(tableOrName: Table | string, columnNames: string[]): string {
        return `pk_${typeof tableOrName == 'string' ? tableOrName : tableOrName.name}_${columnNames.join("_")}`;
    }

    foreignKeyName(tableOrName: Table | string, columnNames: string[]): string {
        return `fk_${typeof tableOrName == 'string' ? tableOrName : tableOrName.name}_${columnNames.join("_")}`;
    }

    indexName(tableOrName: Table | string, columnNames: string[]): string {
        return `in_${typeof tableOrName == 'string' ? tableOrName : tableOrName.name}_${columnNames.join("_")}`;
    }

    uniqueConstraintName(tableOrName: Table | string, columnNames: string[]): string {
        return `uq_${typeof tableOrName == 'string' ? tableOrName : tableOrName.name}_${columnNames.join("_")}`;
    }

    classTableInheritanceParentColumnName(
        parentTableName: unknown,
        parentTableIdPropertyName: unknown,
    ): string {
        return snakeCase(parentTableName + "_" + parentTableIdPropertyName);
    }

    eagerJoinRelationAlias(alias: string, propertyPath: string): string {
        return alias + "__" + propertyPath.replace(".", "_");
    }
}

export class UpperCaseNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
    tableName(className: string, customName: string): string {
        return (customName ? customName : snakeCase(className)).toUpperCase();
    }

    columnName(
        propertyName: string,
        customName: string
    ): string {
        return (customName ? customName : snakeCase(propertyName)).toUpperCase();
    }

    relationName(propertyName: string): string {
        return snakeCase(propertyName).toUpperCase();
    }

    joinColumnName(relationName: string, referencedColumnName: string): string {
        return snakeCase(relationName + "_" + referencedColumnName).toUpperCase();
    }

    joinTableName(
        firstTableName: string,
        secondTableName: string,
        firstPropertyName: string,
    ): string {
        return snakeCase(
            firstTableName +
            "_" +
            firstPropertyName.replace(/\./gi, "_") +
            "_" +
            secondTableName,
        ).toUpperCase();
    }

    joinTableColumnName(
        tableName: string,
        propertyName: string,
        columnName?: string,
    ): string {
        return snakeCase(
            tableName + "_" + (columnName ? columnName : propertyName),
        );
    }

    joinTableInverseColumnName(
        tableName: string,
        propertyName: string,
        columnName?: string,
    ): string {
        return snakeCase(
            tableName + "_" + (columnName ? columnName : propertyName),
        ).toUpperCase();
    }

    primaryKeyName(tableOrName: Table | string, columnNames: string[]): string {
        return (`pk_${typeof tableOrName == 'string' ? tableOrName : tableOrName.name}_${columnNames.join("_")}`).toUpperCase();
    }

    foreignKeyName(tableOrName: Table | string, columnNames: string[]): string {
        return (`fk_${typeof tableOrName == 'string' ? tableOrName : tableOrName.name}_${columnNames.join("_")}`).toUpperCase();
    }

    indexName(tableOrName: Table | string, columnNames: string[]): string {
        return (`in_${typeof tableOrName == 'string' ? tableOrName : tableOrName.name}_${columnNames.join("_")}`).toUpperCase();
    }

    uniqueConstraintName(tableOrName: Table | string, columnNames: string[]): string {
        return (`uq_${typeof tableOrName == 'string' ? tableOrName : tableOrName.name}_${columnNames.join("_")}`).toUpperCase();
    }

    classTableInheritanceParentColumnName(
        parentTableName: unknown,
        parentTableIdPropertyName: unknown,
    ): string {
        return snakeCase(parentTableName + "_" + parentTableIdPropertyName).toUpperCase();
    }

    eagerJoinRelationAlias(alias: string, propertyPath: string): string {
        return (alias + "__" + propertyPath.replace(".", "_")).toUpperCase();
    }
}

export class CustomLogger implements TypeOrmLogContract {
    protected logger = new ConsoleLogger();
    protected timestamp = timestamp;

    logQuery(query: string, parameters?: any[]): void {
        const date = this.timestamp();
        this.logger.log(query, "audit", date);
        this.logger.log(JSON.stringify(parameters), "audit", date);
    }
    logQueryError(error: string | Error, query: string, parameters?: any[]): void {
        const date = this.timestamp();
        this.logger.log(JSON.stringify(error), "audit", date);
        this.logger.log(query, "audit", date);
        this.logger.log(JSON.stringify(parameters), "audit", date);
    }
    logQuerySlow(time: number, query: string, parameters?: any[]): void {
        const date = this.timestamp();
        this.logger.log(time.toString(), "audit", date);
        this.logger.log(query, "audit", date);
        this.logger.log(JSON.stringify(parameters), "audit", date);
    }
    logSchemaBuild(message: string): void {
        const date = this.timestamp();
        this.logger.log(message, "audit", date);
    }
    logMigration(message: string): void {
        const date = this.timestamp();
        this.logger.log(message, "audit", date);
    }
    log(level: "warn" | "info" | "log", message: string): void {
        const date = this.timestamp();
        this.logger.log(message, "audit", date);
    }
}

// eslint-disable-next-line no-undef
export function getConnectionConfig(
    type: Exclude<DatabaseType, "aurora-data-api" | "aurora-data-api-pg" | "expo" | "capacitor">,
    extra?: Partial<ConnectionOptions>
): Exclude<ConnectionOptions, "CapacitorConnectionOptions"> {
    let config: Exclude<ConnectionOptions, "CapacitorConnectionOptions">;

    switch (type) {
        case "oracle":
            config = {
                type: type,
                url: getEnv("DB_URL"),
                host: getEnv("DB_HOST", "localhost"),
                port: parseInt(getEnv("DB_PORT", "5432")),
                username: getEnv("DB_USERNAME", "postgres"),
                password: getEnv("DB_PASSWORD", "postgres"),
                sid: getEnv("DB_DATABASE"),
                schema: getEnv("DB_SCHEMA", ""),
                entityPrefix: getEnv("BD_PREFIX"),
            }
            break;

        case "postgres":
        case "mysql":
        case "mariadb":
        case "cockroachdb":
            config = {
                type: type,
                url: getEnv("DB_URL"),
                host: getEnv("DB_HOST", "localhost"),
                port: parseInt(getEnv("DB_PORT", "5432")),
                username: getEnv("DB_USERNAME", "postgres"),
                password: getEnv("DB_PASSWORD", "postgres"),
                database: getEnv("DB_DATABASE"),
                schema: getEnv("DB_SCHEMA", ""),
                entityPrefix: getEnv("DB_PREFIX"),
            }
            break;

        case "sqlite":
        case "better-sqlite3":
            config = {
                type: "sqlite",
                database: getEnv("DB_DATABASE"),
                entityPrefix: getEnv("DB_PREFIX"),
            }
            break;

        default:
            throw new Error(Lang.__("No default connection availible for [{{type}}]", {
                type: type
            }));
            break;
    }
    return Object.assign({}, config, extra);
}
