import { BaseEntity } from "typeorm";
import { Request } from "./router";
type PaginatedResponse<T extends BaseEntity> = {
    data: T[];
    from: number;
    to: number;
    per_page: number;
    last_page: number;
    current_page: number;
    total: number;
};
export declare class Model extends BaseEntity {
    static paginate<T extends BaseEntity>(this: new () => T, req: Request): Promise<PaginatedResponse<T>>;
    protected static getColumns(): string[];
    protected static getModifiers(): string[];
}
export {};
//# sourceMappingURL=model.d.ts.map