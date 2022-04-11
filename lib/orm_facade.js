"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrmFacade = void 0;
class OrmFacade {
    static set orm(orm) {
        this.ormInstance = orm;
    }
    static get orm() {
        return this.ormInstance;
    }
    static get em() {
        return;
    }
}
exports.OrmFacade = OrmFacade;
//# sourceMappingURL=orm_facade.js.map