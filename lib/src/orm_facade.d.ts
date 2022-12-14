import { Connection } from "typeorm";
export declare class OrmFacade {
    protected static ormInstance: Connection;
    static set orm(orm: Connection);
    static get orm(): Connection;
    static get em(): any;
}
//# sourceMappingURL=orm_facade.d.ts.map