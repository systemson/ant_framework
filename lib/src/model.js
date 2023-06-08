"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Model = void 0;
const typeorm_1 = require("typeorm");
class Model extends typeorm_1.BaseEntity {
    static async paginate(req) {
        const query = req.query;
        const perPage = parseInt(query?.per_page) || 20;
        const page = parseInt(query?.page) || 1;
        const skip = perPage * (page - 1);
        const from = skip + 1;
        const to = skip + perPage;
        const conditionKeys = Object.keys(query).filter(key => this.getColumns().includes(key));
        const contidions = {};
        for (const key of conditionKeys) {
            contidions[key] = query[key];
        }
        let orderBy = undefined;
        if (query.order_by) {
            const orderByArray = query.order_by.split(",").map(order => {
                const result = order.split(":");
                const ret = {};
                ret[result[0]] = result[1] || "ASC";
                return ret;
            });
            orderBy = Object.assign({}, ...orderByArray);
        }
        const options = {
            take: perPage,
            skip: skip,
            select: query.select?.split(","),
            where: contidions,
            order: orderBy,
            relations: query.with?.split(","),
        };
        const data = await this
            .getRepository()
            .findAndCount(options);
        const total = data[1];
        return {
            data: data[0],
            from: from,
            to: to > total ? total : to,
            per_page: perPage,
            total: total,
            current_page: page,
            last_page: Math.ceil(data[1] / perPage),
        };
    }
    static getColumns() {
        return this.getRepository().metadata.columns.map(col => col.propertyName);
    }
    static getModifiers() {
        return [
            "_not",
            "_like",
            "_gte",
            "_lte",
            "_null",
        ];
    }
}
exports.Model = Model;
//# sourceMappingURL=model.js.map