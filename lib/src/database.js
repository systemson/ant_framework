"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnectionConfig = exports.CustomLogger = exports.UpperCaseNamingStrategy = exports.SnakeCaseNamingStrategy = void 0;
const typeorm_1 = require("typeorm");
const StringUtils_1 = require("typeorm/util/StringUtils");
const helpers_1 = require("./helpers");
const logger_1 = require("./logger");
class SnakeCaseNamingStrategy extends typeorm_1.DefaultNamingStrategy {
    tableName(className, customName) {
        return customName ? customName : (0, StringUtils_1.snakeCase)(className);
    }
    columnName(propertyName, customName) {
        return customName ? customName : (0, StringUtils_1.snakeCase)(propertyName);
    }
    relationName(propertyName) {
        return (0, StringUtils_1.snakeCase)(propertyName);
    }
    joinColumnName(relationName, referencedColumnName) {
        return (0, StringUtils_1.snakeCase)(relationName + "_" + referencedColumnName);
    }
    joinTableName(firstTableName, secondTableName, firstPropertyName) {
        return (0, StringUtils_1.snakeCase)(firstTableName +
            "_" +
            firstPropertyName.replace(/\./gi, "_") +
            "_" +
            secondTableName);
    }
    joinTableColumnName(tableName, propertyName, columnName) {
        return (0, StringUtils_1.snakeCase)(tableName + "_" + (columnName ? columnName : propertyName));
    }
    joinTableInverseColumnName(tableName, propertyName, columnName) {
        return (0, StringUtils_1.snakeCase)(tableName + "_" + (columnName ? columnName : propertyName));
    }
    primaryKeyName(tableOrName, columnNames) {
        return `pk_${typeof tableOrName == "string" ? tableOrName : tableOrName.name}_${columnNames.join("_")}`;
    }
    foreignKeyName(tableOrName, columnNames) {
        return `fk_${typeof tableOrName == "string" ? tableOrName : tableOrName.name}_${columnNames.join("_")}`;
    }
    indexName(tableOrName, columnNames) {
        return `in_${typeof tableOrName == "string" ? tableOrName : tableOrName.name}_${columnNames.join("_")}`;
    }
    uniqueConstraintName(tableOrName, columnNames) {
        return `uq_${typeof tableOrName == "string" ? tableOrName : tableOrName.name}_${columnNames.join("_")}`;
    }
    classTableInheritanceParentColumnName(parentTableName, parentTableIdPropertyName) {
        return (0, StringUtils_1.snakeCase)(parentTableName + "_" + parentTableIdPropertyName);
    }
    eagerJoinRelationAlias(alias, propertyPath) {
        return alias + "__" + propertyPath.replace(".", "_");
    }
}
exports.SnakeCaseNamingStrategy = SnakeCaseNamingStrategy;
class UpperCaseNamingStrategy extends typeorm_1.DefaultNamingStrategy {
    tableName(className, customName) {
        return (customName ? customName : (0, StringUtils_1.snakeCase)(className)).toUpperCase();
    }
    columnName(propertyName, customName) {
        return (customName ? customName : (0, StringUtils_1.snakeCase)(propertyName)).toUpperCase();
    }
    relationName(propertyName) {
        return (0, StringUtils_1.snakeCase)(propertyName).toUpperCase();
    }
    joinColumnName(relationName, referencedColumnName) {
        return (0, StringUtils_1.snakeCase)(relationName + "_" + referencedColumnName).toUpperCase();
    }
    joinTableName(firstTableName, secondTableName, firstPropertyName) {
        return (0, StringUtils_1.snakeCase)(firstTableName +
            "_" +
            firstPropertyName.replace(/\./gi, "_") +
            "_" +
            secondTableName).toUpperCase();
    }
    joinTableColumnName(tableName, propertyName, columnName) {
        return (0, StringUtils_1.snakeCase)(tableName + "_" + (columnName ? columnName : propertyName));
    }
    joinTableInverseColumnName(tableName, propertyName, columnName) {
        return (0, StringUtils_1.snakeCase)(tableName + "_" + (columnName ? columnName : propertyName)).toUpperCase();
    }
    primaryKeyName(tableOrName, columnNames) {
        return (`pk_${typeof tableOrName == "string" ? tableOrName : tableOrName.name}_${columnNames.join("_")}`).toUpperCase();
    }
    foreignKeyName(tableOrName, columnNames) {
        return (`fk_${typeof tableOrName == "string" ? tableOrName : tableOrName.name}_${columnNames.join("_")}`).toUpperCase();
    }
    indexName(tableOrName, columnNames) {
        return (`in_${typeof tableOrName == "string" ? tableOrName : tableOrName.name}_${columnNames.join("_")}`).toUpperCase();
    }
    uniqueConstraintName(tableOrName, columnNames) {
        return (`uq_${typeof tableOrName == "string" ? tableOrName : tableOrName.name}_${columnNames.join("_")}`).toUpperCase();
    }
    classTableInheritanceParentColumnName(parentTableName, parentTableIdPropertyName) {
        return (0, StringUtils_1.snakeCase)(parentTableName + "_" + parentTableIdPropertyName).toUpperCase();
    }
    eagerJoinRelationAlias(alias, propertyPath) {
        return (alias + "__" + propertyPath.replace(".", "_")).toUpperCase();
    }
}
exports.UpperCaseNamingStrategy = UpperCaseNamingStrategy;
class CustomLogger {
    constructor() {
        this.logger = new logger_1.ConsoleLogger();
        this.timestamp = helpers_1.timestamp;
    }
    logQuery(query, parameters) {
        const date = this.timestamp();
        this.logger.log(query, "audit", date);
        this.logger.log(JSON.stringify(parameters), "audit", date);
    }
    logQueryError(error, query, parameters) {
        const date = this.timestamp();
        this.logger.log(JSON.stringify(error), "audit", date);
        this.logger.log(query, "audit", date);
        this.logger.log(JSON.stringify(parameters), "audit", date);
    }
    logQuerySlow(time, query, parameters) {
        const date = this.timestamp();
        this.logger.log(time.toString(), "audit", date);
        this.logger.log(query, "audit", date);
        this.logger.log(JSON.stringify(parameters), "audit", date);
    }
    logSchemaBuild(message) {
        const date = this.timestamp();
        this.logger.log(message, "audit", date);
    }
    logMigration(message) {
        const date = this.timestamp();
        this.logger.log(message, "audit", date);
    }
    log(level, message) {
        const date = this.timestamp();
        this.logger.log(message, "audit", date);
    }
}
exports.CustomLogger = CustomLogger;
function getConnectionConfig(type, extra, sufix = "") {
    let config = {
        type: type,
        url: (0, helpers_1.getEnv)(`DB_URL${sufix}`),
        host: (0, helpers_1.getEnv)(`DB_HOST${sufix}`, "localhost"),
        port: parseInt((0, helpers_1.getEnv)(`DB_PORT${sufix}`, "5432")),
        username: (0, helpers_1.getEnv)(`DB_USERNAME${sufix}`, "oracle"),
        password: (0, helpers_1.getEnv)(`DB_PASSWORD${sufix}`, "oracle"),
        schema: (0, helpers_1.getEnv)(`DB_SCHEMA${sufix}`, ""),
        entityPrefix: (0, helpers_1.getEnv)(`BD_PREFIX${sufix}`),
        synchronize: (0, helpers_1.envIsTrue)([`DB_SYNCHRONIZE${sufix}`, `DB_RESTART${sufix}`]),
        dropSchema: (0, helpers_1.envIsTrue)([`DB_DROP_SCHEMA${sufix}`, `DB_RESTART${sufix}`]),
        migrationsRun: (0, helpers_1.envIsTrue)([`DB_MIGRATE${sufix}`, `DB_RESTART${sufix}`]),
        logging: (0, helpers_1.envIsTrue)([`BD_DEBUG${sufix}`]),
        ssl: (0, helpers_1.envIsTrue)([`DB_SSL${sufix}`]),
        extra: {
            ssl: (0, helpers_1.envIsTrue)([`DB_SSL${sufix}`]) ? {
                rejectUnauthorized: false,
            } : undefined,
        },
    };
    switch (type) {
        case "oracle":
            config = Object.assign(Object.assign({}, config), { sid: (0, helpers_1.getEnv)(`DB_DATABASE${sufix}`) });
            break;
        case "postgres":
        case "mysql":
        case "mariadb":
        case "cockroachdb":
            config = Object.assign(Object.assign({}, config), { database: (0, helpers_1.getEnv)(`DB_DATABASE${sufix}`) });
            break;
        case "sqlite":
        case "better-sqlite3":
            config = Object.assign(Object.assign({}, config), { database: (0, helpers_1.getEnv)(`DB_DATABASE${sufix}`), entityPrefix: (0, helpers_1.getEnv)(`BD_PREFIX${sufix}`) });
            break;
        default:
            throw new Error(helpers_1.Lang.__("No default connection availible for [{{type}}]", {
                type: type
            }));
            break;
    }
    return Object.assign({}, config, extra);
}
exports.getConnectionConfig = getConnectionConfig;
//# sourceMappingURL=database.js.map