import {
    BaseEntity,
    BeforeInsert,
    BeforeUpdate,
    FindManyOptions
} from "typeorm";
import { validate } from "class-validator";
import { ErrorResponse } from "./router";

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
            lastPage: perPage == 0 ? page : Math.ceil(total / opt.take),
            currentPage: page,
            perPage: perPage,
            from: opt.skip + 1,
            to: opt.skip + opt.take > total || opt.skip + opt.take == 0 ? total : opt.skip + opt.take,
        };
    }

    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        const errors = await validate(this);

        if (errors.length > 0) {
            throw new ErrorResponse(`Invalid data`).setData(errors.map(err => {
                const error: Record<string, any> = {};

                error[err.property] = err.constraints;
                return error;
            })).setStatus(422)
        }
    }
}
