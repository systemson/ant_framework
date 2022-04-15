"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Model = void 0;
const typeorm_1 = require("typeorm");
class Model extends typeorm_1.BaseEntity {
    static paginate(req) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const query = req.query;
            const perPage = parseInt(query === null || query === void 0 ? void 0 : query.per_page) || 20;
            const page = parseInt(query === null || query === void 0 ? void 0 : query.page) || 1;
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
                select: (_a = query.select) === null || _a === void 0 ? void 0 : _a.split(","),
                where: contidions,
                order: orderBy,
            };
            const data = yield this
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
        });
    }
    static getColumns() {
        return this.getRepository().metadata.columns.map(col => col.propertyName);
    }
    static getModifiers() {
        return [
            "_Not",
            "_like",
            "_gte",
            "_lte",
            "_null",
        ];
    }
}
exports.Model = Model;
//# sourceMappingURL=model.js.map