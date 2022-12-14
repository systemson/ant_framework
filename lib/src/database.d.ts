import { ConnectionOptions, DatabaseType, DefaultNamingStrategy, NamingStrategyInterface, Table, Logger as TypeOrmLogContract } from "typeorm";
import { timestamp } from "./helpers";
import { ConsoleLogger } from "./logger";
export declare class SnakeCaseNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
    tableName(className: string, customName: string): string;
    columnName(propertyName: string, customName: string): string;
    relationName(propertyName: string): string;
    joinColumnName(relationName: string, referencedColumnName: string): string;
    joinTableName(firstTableName: string, secondTableName: string, firstPropertyName: string): string;
    joinTableColumnName(tableName: string, propertyName: string, columnName?: string): string;
    joinTableInverseColumnName(tableName: string, propertyName: string, columnName?: string): string;
    primaryKeyName(tableOrName: Table | string, columnNames: string[]): string;
    foreignKeyName(tableOrName: Table | string, columnNames: string[]): string;
    indexName(tableOrName: Table | string, columnNames: string[]): string;
    uniqueConstraintName(tableOrName: Table | string, columnNames: string[]): string;
    classTableInheritanceParentColumnName(parentTableName: unknown, parentTableIdPropertyName: unknown): string;
    eagerJoinRelationAlias(alias: string, propertyPath: string): string;
}
export declare class UpperCaseNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
    tableName(className: string, customName: string): string;
    columnName(propertyName: string, customName: string): string;
    relationName(propertyName: string): string;
    joinColumnName(relationName: string, referencedColumnName: string): string;
    joinTableName(firstTableName: string, secondTableName: string, firstPropertyName: string): string;
    joinTableColumnName(tableName: string, propertyName: string, columnName?: string): string;
    joinTableInverseColumnName(tableName: string, propertyName: string, columnName?: string): string;
    primaryKeyName(tableOrName: Table | string, columnNames: string[]): string;
    foreignKeyName(tableOrName: Table | string, columnNames: string[]): string;
    indexName(tableOrName: Table | string, columnNames: string[]): string;
    uniqueConstraintName(tableOrName: Table | string, columnNames: string[]): string;
    classTableInheritanceParentColumnName(parentTableName: unknown, parentTableIdPropertyName: unknown): string;
    eagerJoinRelationAlias(alias: string, propertyPath: string): string;
}
export declare class CustomLogger implements TypeOrmLogContract {
    protected logger: ConsoleLogger;
    protected timestamp: typeof timestamp;
    logQuery(query: string, parameters?: any[]): void;
    logQueryError(error: string | Error, query: string, parameters?: any[]): void;
    logQuerySlow(time: number, query: string, parameters?: any[]): void;
    logSchemaBuild(message: string): void;
    logMigration(message: string): void;
    log(level: "warn" | "info" | "log", message: string): void;
}
export declare function getConnectionConfig(type: Exclude<DatabaseType, "aurora-data-api" | "aurora-data-api-pg" | "expo" | "capacitor">, extra?: Partial<ConnectionOptions>): Exclude<ConnectionOptions, "CapacitorConnectionOptions">;
//# sourceMappingURL=database.d.ts.map