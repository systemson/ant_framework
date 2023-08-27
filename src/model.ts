import { BaseEntity, FindManyOptions } from "typeorm";

export type PaginationResponse<T extends BaseEntity> = {
    data: T[];
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
    from: number;
    to: number;
}

export interface PaginationOptions<Entity = any> extends Omit<FindManyOptions<Entity>, "take" | "skip"> {
    perPage?: number;

    page?: number;
}

export class Model extends BaseEntity  {
    static async paginate<T extends BaseEntity>(this: {
        new (): T;
    } & typeof BaseEntity, options?: PaginationOptions<T>): Promise<PaginationResponse<T>> {
        const opt: FindManyOptions = options ?? {};
        const perPage = options?.perPage ?? 15;
        const page = options?.page ?? 1;

        opt.skip = Math.ceil((page * perPage) - perPage);
        opt.take = perPage;

        const [data, total] = await this.findAndCount(opt);

        return {
            data,
            total,
            lastPage: Math.ceil(total / opt.take),
            currentPage: page,
            perPage: perPage,
            from: opt.skip + 1,
            to: opt.skip + opt.take > total ? total : opt.skip + opt.take,
        };
    }
}
